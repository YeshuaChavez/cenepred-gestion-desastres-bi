"""Construye FACT_MONITOREO_DIARIO (Silver -> Gold): grano = región × fecha.

Combina las 3 fuentes de monitoreo activo al grano común región-fecha (sección 5.2 del informe):
- Open-Meteo: ya está a este grano exacto (clima diario por región), se une directo.
- USGS: los sismos son eventos puntuales esporádicos, no diarios. Se agregan primero a
  conteo/magnitud máxima por región-día, y luego se calcula la ventana móvil de 7 días
  (num_sismos_7d, magnitud_max_7d) sobre el calendario completo de cada región.
- NASA FIRMS: se agregan los focos de calor a un conteo por región-día (mismo día, no ventana
  móvil — el informe define num_focos_calor_activos como el conteo del día).

Incluye también `oni` (Índice Oceánico El Niño, data/silver/noaa_oni/): a diferencia de las 3
fuentes anteriores, es un solo valor mensual para todo el Pacífico ecuatorial, no específico por
región — se repite igual para las 25 regiones en un mismo mes. Se agrega aquí (no solo en
ml/training/) porque es un dato de fuente real, no una feature derivada del modelo, así que le
corresponde vivir en Gold para que cualquier consumidor (dashboards, ML) lo use por igual.

Requiere haber corrido antes dim_tiempo.py y dim_region.py.

Uso:
    python fact_monitoreo_diario.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

GOLD_DIR = Path(__file__).parent / "local_data"
OPEN_METEO_SILVER = (
    Path(__file__).parent.parent / "silver" / "open_meteo" / "local_data"
    / "open_meteo_clima_2012_2023.parquet"
)
USGS_SILVER = (
    Path(__file__).parent.parent / "silver" / "usgs" / "local_data" / "usgs_sismos_2012_2023.parquet"
)
NASA_FIRMS_SILVER = (
    Path(__file__).parent.parent / "silver" / "nasa_firms" / "local_data"
    / "nasa_firms_focos_calor_2012_2023.parquet"
)
ONI_SILVER = (
    Path(__file__).parent.parent / "silver" / "noaa_oni" / "local_data" / "oni_2012_2023.parquet"
)

VENTANA_SISMOS_DIAS = 7


def construir_base(dim_tiempo: pd.DataFrame, dim_region: pd.DataFrame) -> pd.DataFrame:
    """Grilla completa región × fecha, para que ningún día/región quede sin fila."""
    tiempo = dim_tiempo[["fecha_id", "fecha"]].copy()
    tiempo["_key"] = 1
    region = dim_region[["region_id", "departamento"]].copy()
    region["_key"] = 1
    base = tiempo.merge(region, on="_key").drop(columns="_key")
    return base


def agregar_clima(base: pd.DataFrame) -> pd.DataFrame:
    clima = pd.read_parquet(OPEN_METEO_SILVER)
    return base.merge(clima, on=["departamento", "fecha"], how="left")


def agregar_sismos(base: pd.DataFrame) -> pd.DataFrame:
    usgs = pd.read_parquet(USGS_SILVER, columns=["departamento", "fecha", "magnitud"])
    usgs["fecha"] = pd.to_datetime(usgs["fecha"])
    diario = (
        usgs.groupby(["departamento", "fecha"])
        .agg(num_sismos_dia=("magnitud", "count"), magnitud_max_dia=("magnitud", "max"))
        .reset_index()
    )

    df = base.merge(diario, on=["departamento", "fecha"], how="left")
    df["num_sismos_dia"] = df["num_sismos_dia"].fillna(0)

    # Ventana móvil de 7 días por región, sobre el calendario completo (no solo los días con
    # sismos), para que la ventana cuente correctamente los días sin actividad como cero.
    df = df.sort_values(["departamento", "fecha"])
    grupos = df.groupby("departamento")
    df["num_sismos_7d"] = (
        grupos["num_sismos_dia"].transform(lambda s: s.rolling(VENTANA_SISMOS_DIAS, min_periods=1).sum())
    )
    df["magnitud_max_7d"] = (
        grupos["magnitud_max_dia"].transform(
            lambda s: s.rolling(VENTANA_SISMOS_DIAS, min_periods=1).max()
        )
    )
    return df.drop(columns=["num_sismos_dia", "magnitud_max_dia"])


def agregar_focos_calor(base: pd.DataFrame) -> pd.DataFrame:
    firms = pd.read_parquet(NASA_FIRMS_SILVER, columns=["departamento", "fecha"])
    diario = firms.groupby(["departamento", "fecha"]).size().reset_index(name="num_focos_calor_activos")

    df = base.merge(diario, on=["departamento", "fecha"], how="left")
    df["num_focos_calor_activos"] = df["num_focos_calor_activos"].fillna(0)
    return df


def agregar_oni(base: pd.DataFrame) -> pd.DataFrame:
    oni = pd.read_parquet(ONI_SILVER)
    df = base.copy()
    df["anio"] = df["fecha"].dt.year
    df["mes"] = df["fecha"].dt.month
    df = df.merge(oni, on=["anio", "mes"], how="left")
    return df.drop(columns=["anio", "mes"])


def construir() -> pd.DataFrame:
    dim_tiempo = pd.read_parquet(GOLD_DIR / "dim_tiempo.parquet")
    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet")

    base = construir_base(dim_tiempo, dim_region)
    base = agregar_clima(base)
    base = agregar_sismos(base)
    base = agregar_focos_calor(base)
    base = agregar_oni(base)

    columnas = [
        "region_id", "fecha_id", "temp_max", "temp_min", "precipitacion_mm",
        "num_sismos_7d", "magnitud_max_7d", "num_focos_calor_activos", "oni",
    ]
    return base[columnas]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["region_id", "fecha_id", "temp_max", "temp_min", "precipitacion_mm", "oni"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": 0.98,
                "valor": round(completitud, 4),
                "ok": bool(completitud >= 0.98),
            }
        )

    grano_unico = not df.duplicated(subset=["region_id", "fecha_id"]).any()
    resultado["grano_region_fecha_unico"] = bool(grano_unico)
    resultado["todas_las_reglas_ok"] = all(r["ok"] for r in resultado["reglas"]) and grano_unico
    return resultado


def main() -> None:
    df = construir()
    reporte = validar_calidad(df)

    parquet_path = GOLD_DIR / "fact_monitoreo_diario.parquet"
    df.to_parquet(parquet_path)

    reporte_path = GOLD_DIR / "fact_monitoreo_diario_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"FACT_MONITOREO_DIARIO: {len(df)} filas")
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")
    print(f"Grano región-fecha único: {reporte['grano_region_fecha_unico']}")


if __name__ == "__main__":
    main()
