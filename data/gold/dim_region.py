"""Construye DIM_REGION (Silver -> Gold): las 25 regiones (departamentos) del Perú.

Grano: departamento. Se eligió este grano (no distrito) porque las 3 fuentes de monitoreo
(Open-Meteo, USGS, NASA FIRMS) solo están disponibles a nivel de departamento en este proyecto
(la capital de cada uno, ver data/ingestion/open_meteo/regiones_peru.py); forzar un grano más
fino no aportaría información real para esas fuentes.

Nota importante sobre `region_natural`: NO es un atributo fijo por departamento (verificado con
los datos reales: Lima tiene distritos de Costa y de Sierra, Cajamarca tiene los 4 tipos). Aquí
se guarda la región natural PREDOMINANTE (moda de las emergencias históricas de INDECI en ese
departamento) como aproximación útil para dashboards/ML, no como dato exacto. El valor preciso
por evento individual sigue disponible en FACT_EMERGENCIAS.

`cluster_riesgo` queda nulo por ahora: se calcula en la fase de Machine Learning (K-Means,
sección 10.2 del informe), no en esta construcción de Gold.

Uso:
    python dim_region.py
"""

from __future__ import annotations

import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

import geopandas as gpd
import pandas as pd

INEI_LIMITES_ZIP = (
    Path(__file__).parent.parent / "bronze" / "inei_limites" / "local_data"
    / "inei_departamentos_limites.zip"
)
COORDENADAS_CAPITALES = (
    Path(__file__).parent.parent / "ingestion" / "open_meteo" / "regiones_coordenadas.json"
)
INDECI_SILVER = (
    Path(__file__).parent.parent / "silver" / "indeci" / "local_data"
    / "indeci_emergencias_2012_2023.parquet"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"


def cargar_poligonos() -> gpd.GeoDataFrame:
    with TemporaryDirectory() as tmp:
        with zipfile.ZipFile(INEI_LIMITES_ZIP) as z:
            z.extractall(tmp)
        shp = list(Path(tmp).glob("*.shp"))[0]
        gdf = gpd.read_file(shp)
    return gdf.rename(columns={"DEPARTAMEN": "departamento", "CODDEP": "coddep"})[
        ["departamento", "coddep", "CAPITAL"]
    ].rename(columns={"CAPITAL": "capital"})


def cargar_coordenadas_capital() -> pd.DataFrame:
    data = json.loads(COORDENADAS_CAPITALES.read_text(encoding="utf-8"))
    df = pd.DataFrame(data)
    return df.rename(columns={"region": "departamento"})[["departamento", "latitud", "longitud"]]


def calcular_region_natural_predominante() -> pd.DataFrame:
    indeci = pd.read_parquet(INDECI_SILVER, columns=["departamento", "region_natural"])
    moda = (
        indeci.groupby("departamento")["region_natural"]
        .agg(lambda s: s.value_counts().idxmax())
        .reset_index()
        .rename(columns={"region_natural": "region_natural_predominante"})
    )
    return moda


def construir() -> pd.DataFrame:
    poligonos = cargar_poligonos()
    poligonos["departamento"] = poligonos["departamento"].str.strip().str.upper()

    coords = cargar_coordenadas_capital()
    region_natural = calcular_region_natural_predominante()

    df = poligonos.merge(coords, on="departamento", how="left")
    df = df.merge(region_natural, on="departamento", how="left")

    df = df.sort_values("departamento").reset_index(drop=True)
    df["region_id"] = df.index + 1
    df["cluster_riesgo"] = pd.NA  # pendiente: fase de Machine Learning (K-Means)

    return df[
        ["region_id", "departamento", "coddep", "capital", "region_natural_predominante",
         "latitud", "longitud", "cluster_riesgo"]
    ]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {
        "total_filas": len(df),
        "esperado_25_regiones": bool(len(df) == 25),
        "region_id_unico": bool(df["region_id"].is_unique),
        "departamento_unico": bool(df["departamento"].is_unique),
        "sin_nulos_en_campos_clave": bool(
            df[["departamento", "coddep", "latitud", "longitud"]].notna().all().all()
        ),
    }
    resultado["todas_las_reglas_ok"] = all(
        v for k, v in resultado.items() if k != "total_filas"
    )
    return resultado


def main() -> None:
    df = construir()
    reporte = validar_calidad(df)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "dim_region.parquet"
    df.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "dim_region_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"DIM_REGION: {len(df)} filas")
    print(f"Guardado en {parquet_path}")
    print(f"Reglas OK: {reporte['todas_las_reglas_ok']}")
    print(df.to_string())


if __name__ == "__main__":
    main()
