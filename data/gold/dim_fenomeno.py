"""Construye DIM_FENOMENO (Silver -> Gold): tipos de fenómeno registrados por INDECI.

`tipo_fenomeno` viene directo de Silver/INDECI (72 valores distintos, ya sin bytes corruptos).
`categoria` se deriva aquí clasificando cada fenómeno según las 4 categorías estándar usadas por
el sistema de defensa civil peruano (SINAGERD/CENEPRED): Hidrometeorológico y Oceanográfico,
Geológico, Biológico-Sanitario, Antrópico/Tecnológico. La clasificación de INDECI no viene
etiquetada por categoría en el shapefile, así que este mapeo es un criterio razonable basado en
el nombre de cada fenómeno, no una fuente oficial verificada término por término — algunos casos
son ambiguos por diseño (ej. incendios forestales podría discutirse como antrópico o ambiental;
aquí se clasifica como antrópico porque en Perú la gran mayoría son de origen humano).

Uso:
    python dim_fenomeno.py
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

INDECI_SILVER = (
    Path(__file__).parent.parent / "silver" / "indeci" / "local_data"
    / "indeci_emergencias_2012_2023.parquet"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

HIDROMETEOROLOGICO = "HIDROMETEOROLOGICO Y OCEANOGRAFICO"
GEOLOGICO = "GEOLOGICO"
BIOLOGICO = "BIOLOGICO-SANITARIO"
ANTROPICO = "ANTROPICO-TECNOLOGICO"

CATEGORIA_POR_FENOMENO = {
    # Hidrometeorológico y oceanográfico
    "LLUVIAS INTENSAS": HIDROMETEOROLOGICO,
    "VIENTOS FUERTES": HIDROMETEOROLOGICO,
    "HELADAS": HIDROMETEOROLOGICO,
    "PRECIPITACIONES - GRANIZO": HIDROMETEOROLOGICO,
    "SEQUIAS": HIDROMETEOROLOGICO,
    "PRECIPITACIONES - NEVADA": HIDROMETEOROLOGICO,
    "FRIAJE": HIDROMETEOROLOGICO,
    "GRANIZADAS": HIDROMETEOROLOGICO,
    "DEFICIT HIDRICO": HIDROMETEOROLOGICO,
    "TEMPORALES (VIENTOS CON LLUVIAS)": HIDROMETEOROLOGICO,
    "TORMENTAS ELECTRICAS": HIDROMETEOROLOGICO,
    "NEVADAS": HIDROMETEOROLOGICO,
    "RIADA": HIDROMETEOROLOGICO,
    "PRECIPITACIONES PLUVIALES": HIDROMETEOROLOGICO,
    "MARETAZO": HIDROMETEOROLOGICO,
    "OTROS FENOM. MET.  O HIDROL.": HIDROMETEOROLOGICO,
    "TEMPESTADES ELECTRICAS": HIDROMETEOROLOGICO,
    "OTROS PELIGROS HIDROMETEOROLOGICOS Y OCEANOGRAFICOS": HIDROMETEOROLOGICO,
    "MARETAZO (MAREJADAS)": HIDROMETEOROLOGICO,
    "CAMBIOS CLIMATICOS": HIDROMETEOROLOGICO,
    "TSUNAMI": HIDROMETEOROLOGICO,
    "INUNDACION": HIDROMETEOROLOGICO,
    "INUNDACION POR DESBORDE DE RIO": HIDROMETEOROLOGICO,
    "INUNDACION POR DESBORDE DE CANALES": HIDROMETEOROLOGICO,
    "INUNDACION POR DESBORDE LAGO O LAGUNA": HIDROMETEOROLOGICO,
    "INUNDACION POR DESBORDE EN LA RUPTURA DE DIQUES": HIDROMETEOROLOGICO,
    "EROSION FLUVIAL": HIDROMETEOROLOGICO,
    "DEGLACIACION": HIDROMETEOROLOGICO,
    # Geológico (geodinámica interna y externa)
    "DESLIZAMIENTO": GEOLOGICO,
    "HUAYCOS": GEOLOGICO,
    "DERRUMBES": GEOLOGICO,
    "SISMOS": GEOLOGICO,
    "DERRUMBE CERROS": GEOLOGICO,
    "OTROS FENOMENOS DE GEODINAMICA EXTERNA": GEOLOGICO,
    "ERUPCIONES VOLCANICAS": GEOLOGICO,
    "REPTACION": GEOLOGICO,
    "OTROS FENOMENOS DE GEODINAMICA INTERNA": GEOLOGICO,
    "ALUDES": GEOLOGICO,
    "ALUVIONES": GEOLOGICO,
    # Biológico-sanitario
    "EPIDEMIA COVID-19": BIOLOGICO,
    "EPIDEMIAS": BIOLOGICO,
    "PLAGAS": BIOLOGICO,
    "OTROS FENOMENOS DE ORIGEN BIOLOGICO": BIOLOGICO,
    "EPIZOOTIAS": BIOLOGICO,
    "EPIDEMIA DENGUE": BIOLOGICO,
    # Antrópico / tecnológico
    "INCENDIOS": ANTROPICO,
    "INCENDIOS URBANOS": ANTROPICO,
    "INCENDIOS FORESTALES": ANTROPICO,
    "COLAPSO POR ANTIGUEDAD": ANTROPICO,
    "OTROS FENOMENOS TECNOLOGICOS": ANTROPICO,
    "CONTAMINACION AMBIENTAL": ANTROPICO,
    "ACCIDENTES DE TRANSPORTE": ANTROPICO,
    "DERRAME DE SUSTANCIAS NOCIVAS": ANTROPICO,
    "EXPLOSIONES": ANTROPICO,
    "OTROS PELIGROS ANTROPICOS": ANTROPICO,
    "DERRUMBE VIVIENDA": ANTROPICO,
    "ACCI. DE TRANSPORTE MEDIO TERRESTRE": ANTROPICO,
    "DSNPP HIDROCARBUROS": ANTROPICO,
    "DERRUMBE ESTRUCTUCTURA GENERAL": ANTROPICO,
    "DESERTIFICACION": ANTROPICO,
    "EMBALSES": ANTROPICO,
    "INCENDIOS INDUSTRIALES": ANTROPICO,
    "CONTAMINA AMB, DE AGUAS": ANTROPICO,
    "CONTAMINA AMB, DE SUELOS": ANTROPICO,
    "ACCIONES DE GUERRA": ANTROPICO,
    "VANDALISMO": ANTROPICO,
    "DEFORESTACION": ANTROPICO,
    "ACCI. DE TRANSPORTE MEDIO AEREO": ANTROPICO,
    "ACCI. DE TRANSPORTE MEDIO ACUATICO MARITIMO": ANTROPICO,
    "SABOTAJES": ANTROPICO,
    "ACCI. DE TRANSPORTE MEDIO ACUATICO FLUVIAL": ANTROPICO,
    "DSNPP GAS NATURAL": ANTROPICO,
}


def construir() -> pd.DataFrame:
    indeci = pd.read_parquet(INDECI_SILVER, columns=["tipo_fenomeno"])
    fenomenos = sorted(indeci["tipo_fenomeno"].dropna().unique())

    df = pd.DataFrame({"tipo_fenomeno": fenomenos})
    df["categoria"] = df["tipo_fenomeno"].map(CATEGORIA_POR_FENOMENO)
    df["fenomeno_id"] = range(1, len(df) + 1)
    return df[["fenomeno_id", "tipo_fenomeno", "categoria"]]


def validar_calidad(df: pd.DataFrame) -> dict:
    sin_categoria = df[df["categoria"].isna()]["tipo_fenomeno"].tolist()
    resultado = {
        "total_filas": len(df),
        "fenomeno_id_unico": bool(df["fenomeno_id"].is_unique),
        "tipo_fenomeno_unico": bool(df["tipo_fenomeno"].is_unique),
        "sin_categoria_asignada": sin_categoria,
        "distribucion_categorias": df["categoria"].value_counts().to_dict(),
    }
    resultado["todas_las_reglas_ok"] = (
        resultado["fenomeno_id_unico"]
        and resultado["tipo_fenomeno_unico"]
        and len(sin_categoria) == 0
    )
    return resultado


def main() -> None:
    df = construir()
    reporte = validar_calidad(df)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "dim_fenomeno.parquet"
    df.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "dim_fenomeno_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"DIM_FENOMENO: {len(df)} filas")
    print(f"Guardado en {parquet_path}")
    print(f"Sin categoría asignada: {reporte['sin_categoria_asignada']}")
    print(f"Distribución: {reporte['distribucion_categorias']}")
    print(f"Reglas OK: {reporte['todas_las_reglas_ok']}")


if __name__ == "__main__":
    main()
