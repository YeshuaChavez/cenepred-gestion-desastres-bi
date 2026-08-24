"""Limpia y estandariza el Índice Oceánico El Niño (ONI) (Bronze -> Silver).

El archivo crudo trae un valor por año (fila) y mes (columna 1-12), en un formato de ancho fijo
con una fila de encabezado (rango de años) y un valor centinela (99.90) para meses sin dato aún
(ej. meses futuros del año en curso). Se convierte a formato largo (año, mes, oni), filtrando los
centinelas, y se acota a la misma ventana 2012-2023 usada por el resto del proyecto.

Uso:
    python limpieza_oni.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

BRONZE_FILE = (
    Path(__file__).parent.parent.parent / "bronze" / "noaa_oni" / "local_data" / "oni.data.txt"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

# Ventana: desde 2012 hasta el año en curso (el ONI se actualiza mensualmente; los meses
# futuros del año en curso llegan como centinela 99.9 y se filtran).
ANIO_INICIO = 2012
ANIO_FIN = datetime.now(timezone.utc).year
VALOR_CENTINELA = 99.9


def cargar_historico() -> pd.DataFrame:
    lineas = BRONZE_FILE.read_text(encoding="utf-8").splitlines()
    filas = []
    for linea in lineas[1:]:  # la primera línea es el rango de años, no datos
        partes = linea.split()
        if len(partes) != 13:
            continue  # línea de cierre del archivo (metadata), no es una fila de año
        anio = int(partes[0])
        valores = [float(v) for v in partes[1:]]
        for mes, valor in enumerate(valores, start=1):
            filas.append({"anio": anio, "mes": mes, "oni": valor})
    return pd.DataFrame(filas)


def limpiar(df: pd.DataFrame) -> pd.DataFrame:
    # El archivo usa +/-99.9 como centinela para meses sin dato (futuros del año en curso);
    # el ONI real está en ~[-3, +3], así que se descarta cualquier valor de magnitud absurda.
    df = df[df["oni"].abs() < 90]
    df = df[(df["anio"] >= ANIO_INICIO) & (df["anio"] <= ANIO_FIN)]
    return df.sort_values(["anio", "mes"]).reset_index(drop=True)


def validar_calidad(df: pd.DataFrame) -> dict:
    # El año en curso es parcial, así que se valida CONTINUIDAD (2012-01 hasta el último mes
    # disponible, sin huecos) en vez de exigir 12 meses del año actual.
    if len(df):
        ult = df.sort_values(["anio", "mes"]).iloc[-1]
        meses_esperados = (int(ult["anio"]) - ANIO_INICIO) * 12 + int(ult["mes"])
    else:
        meses_esperados = 0
    resultado = {
        "total_filas": len(df),
        "meses_esperados": meses_esperados,
        "sin_nulos": bool(df["oni"].notna().all()),
        "anio_mes_unico": bool(not df.duplicated(subset=["anio", "mes"]).any()),
    }
    resultado["todas_las_reglas_ok"] = (
        len(df) == meses_esperados and resultado["sin_nulos"] and resultado["anio_mes_unico"]
    )
    return resultado


def main() -> None:
    df_crudo = cargar_historico()
    df_limpio = limpiar(df_crudo)
    reporte = validar_calidad(df_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "oni_2012_2023.parquet"
    df_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "oni_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"ONI: {len(df_limpio)} meses ({ANIO_INICIO}-{ANIO_FIN})")
    print(f"Guardado en {parquet_path}")
    print(f"Reglas OK: {reporte['todas_las_reglas_ok']}")


if __name__ == "__main__":
    main()
