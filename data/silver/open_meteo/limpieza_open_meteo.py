"""Limpia y estandariza el clima diario de Open-Meteo (Bronze -> Silver).

Lee el JSON de las 25 regiones ya descargado en data/bronze/open_meteo/local_data/ (un objeto
por región, con arreglos paralelos de fecha/temperatura/precipitación) y lo convierte a formato
largo (una fila por región-fecha), al grano de FACT_MONITOREO_DIARIO (sección 5.3 del informe).

No construye aún el modelo dimensional (esa es tarea de Gold): esto es solo la capa Silver.

Uso:
    python limpieza_open_meteo.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

BRONZE_FILE = (
    Path(__file__).parent.parent.parent
    / "bronze" / "open_meteo" / "local_data" / "open_meteo_2012-01-01_2023-12-31.json"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

META_COMPLETITUD_MINIMA = 0.98  # sección 11.1 del informe


def cargar_historico() -> pd.DataFrame:
    if not BRONZE_FILE.exists():
        raise FileNotFoundError(f"No existe {BRONZE_FILE}")
    data = json.loads(BRONZE_FILE.read_text(encoding="utf-8"))

    partes = []
    for entrada in data:
        daily = entrada["daily"]
        df = pd.DataFrame(
            {
                "fecha": daily["time"],
                "temp_max": daily["temperature_2m_max"],
                "temp_min": daily["temperature_2m_min"],
                "precipitacion_mm": daily["precipitation_sum"],
            }
        )
        df["departamento"] = entrada["region"]
        partes.append(df)

    return pd.concat(partes, ignore_index=True)


def limpiar(df: pd.DataFrame) -> pd.DataFrame:
    df["fecha"] = pd.to_datetime(df["fecha"], format="%Y-%m-%d", errors="coerce")
    df["departamento"] = df["departamento"].astype(str).str.strip().str.upper()

    antes = len(df)
    df = df.drop_duplicates(subset=["departamento", "fecha"])
    duplicados_removidos = antes - len(df)

    df.attrs["duplicados_removidos"] = duplicados_removidos
    return df[["departamento", "fecha", "temp_max", "temp_min", "precipitacion_mm"]]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["fecha", "departamento", "temp_max", "temp_min", "precipitacion_mm"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": META_COMPLETITUD_MINIMA,
                "valor": round(completitud, 4),
                "ok": bool(completitud >= META_COMPLETITUD_MINIMA),
            }
        )

    # Rango físico razonable para Perú (sanity check, no es un límite oficial).
    temp_en_rango = df["temp_max"].between(-30, 45).mean()
    resultado["reglas"].append(
        {
            "regla": "rango_temp_max_razonable",
            "meta": 1.0,
            "valor": round(temp_en_rango, 4),
            "ok": bool(round(temp_en_rango, 6) >= 1.0),
        }
    )

    precip_no_negativa = (df["precipitacion_mm"] >= 0).mean()
    resultado["reglas"].append(
        {
            "regla": "precipitacion_no_negativa",
            "meta": 1.0,
            "valor": round(precip_no_negativa, 4),
            "ok": bool(round(precip_no_negativa, 6) >= 1.0),
        }
    )

    resultado["duplicados_removidos"] = int(df.attrs.get("duplicados_removidos", 0))
    resultado["regiones_unicas"] = int(df["departamento"].nunique())
    resultado["todas_las_reglas_ok"] = all(r["ok"] for r in resultado["reglas"])
    return resultado


def main() -> None:
    df_crudo = cargar_historico()
    print(f"Cargados {len(df_crudo)} registros crudos ({df_crudo['departamento'].nunique()} regiones).")

    df_limpio = limpiar(df_crudo)
    reporte = validar_calidad(df_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "open_meteo_clima_2012_2023.parquet"
    df_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "open_meteo_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Registros limpios: {len(df_limpio)} (duplicados removidos: {reporte['duplicados_removidos']})")
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")


if __name__ == "__main__":
    main()
