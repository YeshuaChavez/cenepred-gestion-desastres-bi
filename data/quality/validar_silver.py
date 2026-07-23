"""Valida los datasets de Silver contra los esquemas declarativos de schemas.py.

Corresponde a la validación de calidad Bronze -> Silver de la sección 4.4 del informe (ver
schemas.py para el porqué de pandera en vez de Great Expectations). Se corre después de cada
script de Silver (data/silver/*/limpieza_*.py), sobre su resultado ya escrito en parquet.

Uso:
    python validar_silver.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import pandera.errors

from schemas import IndeciSchema, NasaFirmsSchema, OniSchema, OpenMeteoSchema, UsgsSchema

SILVER_DIR = Path(__file__).parent.parent / "silver"
OUTPUT_DIR = Path(__file__).parent / "local_data"

DATASETS = {
    "indeci": (
        SILVER_DIR / "indeci" / "local_data" / "indeci_emergencias_2012_2023.parquet",
        IndeciSchema,
    ),
    "open_meteo": (
        SILVER_DIR / "open_meteo" / "local_data" / "open_meteo_clima_2012_2023.parquet",
        OpenMeteoSchema,
    ),
    "usgs": (
        SILVER_DIR / "usgs" / "local_data" / "usgs_sismos_2012_2023.parquet",
        UsgsSchema,
    ),
    "nasa_firms": (
        SILVER_DIR / "nasa_firms" / "local_data" / "nasa_firms_focos_calor_2012_2023.parquet",
        NasaFirmsSchema,
    ),
    "noaa_oni": (
        SILVER_DIR / "noaa_oni" / "local_data" / "oni_2012_2023.parquet",
        OniSchema,
    ),
}


def validar_dataset(nombre: str, ruta: Path, esquema) -> dict:
    if not ruta.exists():
        return {"estado": "ARCHIVO_FALTANTE", "ruta": str(ruta)}

    df = pd.read_parquet(ruta)
    try:
        esquema.validate(df, lazy=True)
        return {"estado": "OK", "total_filas": len(df)}
    except pandera.errors.SchemaErrors as exc:
        fallos = exc.failure_cases
        resumen = (
            fallos.groupby("check")["failure_case"].count().sort_values(ascending=False).to_dict()
        )
        return {
            "estado": "FALLA",
            "total_filas": len(df),
            "total_errores": len(fallos),
            "errores_por_regla": resumen,
        }


def main() -> None:
    reporte = {}
    for nombre, (ruta, esquema) in DATASETS.items():
        reporte[nombre] = validar_dataset(nombre, ruta, esquema)
        estado = reporte[nombre]["estado"]
        print(f"[{estado}] {nombre}")
        if estado == "FALLA":
            for regla, count in reporte[nombre]["errores_por_regla"].items():
                print(f"    {regla}: {count} filas")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reporte_path = OUTPUT_DIR / "validacion_silver.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print(f"\nGuardado en {reporte_path}")


if __name__ == "__main__":
    main()
