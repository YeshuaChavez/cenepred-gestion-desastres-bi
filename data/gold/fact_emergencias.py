"""Construye FACT_EMERGENCIAS (Silver -> Gold): grano = una fila por emergencia de INDECI.

Une Silver/INDECI contra DIM_TIEMPO, DIM_REGION y DIM_FENOMENO, y deriva `severidad` (sección
5.3 del informe: "severidad (derivada)", ya no un campo crudo de origen desde que se descubrió
que INDECI reporta conteos granulares en vez de una severidad única — ver informe).

Regla de severidad (criterio propio, no oficial de INDECI, basado en la distribución real de los
datos: ~46% de emergencias no reportan ningún impacto medible, <1% tienen fallecidos):
    ALTO:  hay al menos 1 fallecido o desaparecido, o >= 10 viviendas destruidas.
    MEDIO: no es ALTO, pero hay algún damnificado, vivienda afectada/destruida, o >50 afectados.
    BAJO:  todo lo demás (sin impacto medible reportado).

Requiere haber corrido antes dim_tiempo.py, dim_region.py y dim_fenomeno.py.

Uso:
    python fact_emergencias.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

GOLD_DIR = Path(__file__).parent / "local_data"
INDECI_SILVER = (
    Path(__file__).parent.parent / "silver" / "indeci" / "local_data"
    / "indeci_emergencias_2012_2023.parquet"
)


def calcular_severidad(df: pd.DataFrame) -> pd.Series:
    alto = (
        (df["cantidad_fallecidos"] > 0)
        | (df["cantidad_desaparecidos"] > 0)
        | (df["viviendas_destruidas"] >= 10)
    )
    medio = (
        (df["cantidad_damnificados"] > 0)
        | (df["viviendas_destruidas"] > 0)
        | (df["viviendas_afectadas"] > 0)
        | (df["cantidad_afectados"] > 50)
    )
    return pd.Series(
        pd.cut(
            alto.astype(int) * 2 + (medio & ~alto).astype(int),
            bins=[-1, 0, 1, 2],
            labels=["BAJO", "MEDIO", "ALTO"],
        ),
        index=df.index,
    )


def construir() -> pd.DataFrame:
    indeci = pd.read_parquet(INDECI_SILVER)
    dim_tiempo = pd.read_parquet(GOLD_DIR / "dim_tiempo.parquet")[["fecha_id", "fecha"]]
    dim_region = pd.read_parquet(GOLD_DIR / "dim_region.parquet")[["region_id", "departamento"]]
    dim_fenomeno = pd.read_parquet(GOLD_DIR / "dim_fenomeno.parquet")[
        ["fenomeno_id", "tipo_fenomeno"]
    ]

    df = indeci.merge(dim_tiempo, on="fecha", how="left")
    df = df.merge(dim_region, on="departamento", how="left")
    df = df.merge(dim_fenomeno, on="tipo_fenomeno", how="left")

    df["severidad"] = calcular_severidad(df)

    columnas = [
        "emergencia_id", "fecha_id", "region_id", "fenomeno_id",
        "cantidad_afectados", "cantidad_damnificados", "cantidad_fallecidos",
        "cantidad_lesionados", "cantidad_desaparecidos", "viviendas_afectadas",
        "viviendas_destruidas", "severidad",
    ]
    return df[columnas]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["fecha_id", "region_id", "fenomeno_id"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}_fk",
                "meta": 1.0,
                "valor": round(completitud, 4),
                "ok": bool(round(completitud, 6) >= 1.0),
            }
        )

    resultado["emergencia_id_unico"] = bool(df["emergencia_id"].is_unique)
    resultado["distribucion_severidad"] = df["severidad"].value_counts().to_dict()
    resultado["todas_las_reglas_ok"] = (
        all(r["ok"] for r in resultado["reglas"]) and resultado["emergencia_id_unico"]
    )
    return resultado


def main() -> None:
    df = construir()
    reporte = validar_calidad(df)

    parquet_path = GOLD_DIR / "fact_emergencias.parquet"
    df.to_parquet(parquet_path)

    reporte_path = GOLD_DIR / "fact_emergencias_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"FACT_EMERGENCIAS: {len(df)} filas")
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")
    print(f"Distribución severidad: {reporte['distribucion_severidad']}")


if __name__ == "__main__":
    main()
