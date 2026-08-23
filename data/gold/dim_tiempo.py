"""Construye DIM_TIEMPO (Silver -> Gold): calendario diario 2012-2023.

No depende de ninguna fuente en particular: es un calendario completo generado para la ventana
de datos definida en la sección 2.4 del informe (2012-01-01 a 2023-12-31), para que las medidas
DAX de inteligencia de tiempo (sección 9.2) funcionen incluso en días sin ningún evento.

Uso:
    python dim_tiempo.py
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pandas as pd

OUTPUT_DIR = Path(__file__).parent / "local_data"

FECHA_INICIO = "2012-01-01"
# Se extiende hasta hoy + buffer para cubrir la telemetría dinámica diaria (fact_monitoreo_diario
# ahora llega hasta la fecha actual). Se puede fijar con DIM_TIEMPO_FECHA_FIN (ej. "2023-12-31"
# para reproducir la ventana histórica del informe).
FECHA_FIN = os.getenv("DIM_TIEMPO_FECHA_FIN") or (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

# Temporadas meteorológicas del hemisferio sur, por mes (aproximación estándar, no por
# solsticio/equinoccio exacto).
TEMPORADA_POR_MES = {
    12: "VERANO", 1: "VERANO", 2: "VERANO",
    3: "OTOÑO", 4: "OTOÑO", 5: "OTOÑO",
    6: "INVIERNO", 7: "INVIERNO", 8: "INVIERNO",
    9: "PRIMAVERA", 10: "PRIMAVERA", 11: "PRIMAVERA",
}

MES_NOMBRE = {
    1: "ENERO", 2: "FEBRERO", 3: "MARZO", 4: "ABRIL", 5: "MAYO", 6: "JUNIO",
    7: "JULIO", 8: "AGOSTO", 9: "SEPTIEMBRE", 10: "OCTUBRE", 11: "NOVIEMBRE", 12: "DICIEMBRE",
}


def construir() -> pd.DataFrame:
    fechas = pd.date_range(FECHA_INICIO, FECHA_FIN, freq="D")
    df = pd.DataFrame({"fecha": fechas})
    df["fecha_id"] = df["fecha"].dt.strftime("%Y%m%d").astype(int)
    df["anio"] = df["fecha"].dt.year
    df["mes"] = df["fecha"].dt.month
    df["mes_nombre"] = df["mes"].map(MES_NOMBRE)
    df["trimestre"] = df["fecha"].dt.quarter
    df["temporada"] = df["mes"].map(TEMPORADA_POR_MES)
    return df[["fecha_id", "fecha", "anio", "mes", "mes_nombre", "trimestre", "temporada"]]


def validar_calidad(df: pd.DataFrame) -> dict:
    dias_esperados = (pd.Timestamp(FECHA_FIN) - pd.Timestamp(FECHA_INICIO)).days + 1
    resultado = {
        "total_filas": len(df),
        "dias_esperados": dias_esperados,
        "fecha_id_unico": bool(df["fecha_id"].is_unique),
        "sin_nulos": bool(df.notna().all().all()),
    }
    resultado["todas_las_reglas_ok"] = (
        len(df) == dias_esperados and resultado["fecha_id_unico"] and resultado["sin_nulos"]
    )
    return resultado


def main() -> None:
    df = construir()
    reporte = validar_calidad(df)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "dim_tiempo.parquet"
    df.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "dim_tiempo_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"DIM_TIEMPO: {len(df)} filas ({FECHA_INICIO} a {FECHA_FIN})")
    print(f"Guardado en {parquet_path}")
    print(f"Reglas OK: {reporte['todas_las_reglas_ok']}")


if __name__ == "__main__":
    main()
