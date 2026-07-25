"""Limpia y estandariza el gasto del PP0068 PREVAED por departamento (Bronze -> Silver).

Lee los 12 archivos anuales (2012-2023) exportados a mano de Consulta Amigable en
data/bronze/mef_pp0068/local_data/ (ver data/ingestion/mef_pp0068/organizar_exportacion_manual.py
para el porqué de la exportación manual: la fuente no tiene API ni dataset abierto filtrable por
programa presupuestal). A diferencia de las demás fuentes, esto no alimenta el modelo ML: es
solo para el panel de Impacto Socioeconómico del dashboard (sección 9.5 del informe).

Cada archivo tiene extensión .xls pero en realidad es una tabla HTML (así la exporta el propio
navegador de Consulta Amigable) con 4 tablas: [0] encabezado con el año, [1] fila TOTAL y fila del
PP0068, [2] encabezados de columna, [3] el detalle de los 25 departamentos — esta última es la que
importa aquí.

Uso:
    python limpieza_mef_pp0068.py
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

BRONZE_DIR = Path(__file__).parent.parent.parent / "bronze" / "mef_pp0068" / "local_data"
OUTPUT_DIR = Path(__file__).parent / "local_data"

META_COMPLETITUD_MINIMA = 0.98  # sección 11.1 del informe
DEPARTAMENTOS_ESPERADOS = 25

COLUMNAS = [
    "departamento_crudo", "monto_pia", "monto_pim", "monto_certificado",
    "monto_comprometido_anual", "monto_atencion_compromiso_mensual",
    "monto_devengado", "monto_girado", "avance_pct",
]

# Consulta Amigable nombra al Callao como "Provincia Constitucional del Callao" en vez de
# "CALLAO", que es el nombre canónico usado en el resto del proyecto (ver
# data/ingestion/open_meteo/regiones_peru.py). Es la única discrepancia real: los otros 24
# nombres ya vienen sin tilde e iguales al resto de fuentes.
CORRECCION_DEPARTAMENTO = {
    "PROVINCIA CONSTITUCIONAL DEL CALLAO": "CALLAO",
}


def _extraer_anio(tablas: list[pd.DataFrame]) -> int:
    encabezado = str(tablas[0].iloc[0, 0])
    match = re.search(r"A.o de Ejecuci.n:\s*(\d{4})", encabezado)
    if not match:
        raise ValueError("No se pudo extraer el año del encabezado")
    return int(match.group(1))


def cargar_historico() -> pd.DataFrame:
    archivos = sorted(BRONZE_DIR.glob("mef_pp0068_*.xls"))
    if not archivos:
        raise FileNotFoundError(f"No hay archivos mef_pp0068_*.xls en {BRONZE_DIR}")

    partes = []
    for archivo in archivos:
        tablas = pd.read_html(archivo)
        anio = _extraer_anio(tablas)

        tabla_departamentos = tablas[3].copy()
        tabla_departamentos.columns = COLUMNAS
        tabla_departamentos["anio"] = anio
        partes.append(tabla_departamentos)

    return pd.concat(partes, ignore_index=True)


def limpiar(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # "01: AMAZONAS" -> "AMAZONAS" (se descarta el código numérico, no se usa en ningún otro lado
    # del proyecto; DIM_REGION ya tiene su propio region_id).
    df["departamento"] = (
        df["departamento_crudo"].str.split(":", n=1).str[1].str.strip().str.upper()
    )
    df["departamento"] = df["departamento"].replace(CORRECCION_DEPARTAMENTO)

    columnas_monto = [
        "monto_pia", "monto_pim", "monto_certificado", "monto_comprometido_anual",
        "monto_atencion_compromiso_mensual", "monto_devengado", "monto_girado",
    ]
    for col in columnas_monto:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df["avance_pct"] = pd.to_numeric(df["avance_pct"], errors="coerce")

    columnas_finales = ["anio", "departamento", *columnas_monto, "avance_pct"]
    return df[columnas_finales].sort_values(["anio", "departamento"]).reset_index(drop=True)


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["anio", "departamento", "monto_devengado"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": META_COMPLETITUD_MINIMA,
                "valor": round(completitud, 4),
                "ok": bool(completitud >= META_COMPLETITUD_MINIMA),
            }
        )

    departamentos_por_anio = df.groupby("anio")["departamento"].nunique()
    anios_con_25 = (departamentos_por_anio == DEPARTAMENTOS_ESPERADOS).all()
    resultado["todos_los_anios_tienen_25_departamentos"] = bool(anios_con_25)

    montos_no_negativos = (df["monto_devengado"].dropna() >= 0).all()
    resultado["montos_devengados_no_negativos"] = bool(montos_no_negativos)

    grano_unico = not df.duplicated(subset=["anio", "departamento"]).any()
    resultado["grano_anio_departamento_unico"] = bool(grano_unico)

    anios_esperados = set(range(2012, 2024))
    anios_presentes = set(df["anio"].unique().tolist())
    resultado["anios_faltantes"] = sorted(anios_esperados - anios_presentes)

    resultado["todas_las_reglas_ok"] = bool(
        all(r["ok"] for r in resultado["reglas"])
        and anios_con_25
        and montos_no_negativos
        and grano_unico
        and not resultado["anios_faltantes"]
    )
    return resultado


def main() -> None:
    df_crudo = cargar_historico()
    print(f"Cargados {len(df_crudo)} registros crudos ({df_crudo['anio'].nunique()} años).")

    df_limpio = limpiar(df_crudo)
    reporte = validar_calidad(df_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "mef_pp0068_gasto_2012_2023.parquet"
    df_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "mef_pp0068_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Registros limpios: {len(df_limpio)}")
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")
    print(f"Todos los años con 25 departamentos: {reporte['todos_los_anios_tienen_25_departamentos']}")
    if reporte["anios_faltantes"]:
        print(f"Años faltantes: {reporte['anios_faltantes']}")


if __name__ == "__main__":
    main()
