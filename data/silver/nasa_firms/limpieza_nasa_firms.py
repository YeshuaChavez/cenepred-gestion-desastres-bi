"""Limpia y estandariza los focos de calor de NASA FIRMS (Bronze -> Silver).

Lee el CSV ya descargado en data/bronze/nasa_firms/local_data/ (1.5M+ detecciones VIIRS,
2012-2023), estandariza tipos y campos, y asigna cada foco de calor a un departamento del Perú
mediante join geoespacial contra los límites de INEI (data/bronze/inei_limites/). A diferencia
de los sismos de USGS, los focos de calor ocurren en tierra, así que se usa un join estricto
"within" (no hace falta el margen de distancia usado para sismos costeros/marinos).

Uso:
    python limpieza_nasa_firms.py
"""

from __future__ import annotations

import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

import geopandas as gpd
import pandas as pd

BRONZE_FILE = (
    Path(__file__).parent.parent.parent
    / "bronze" / "nasa_firms" / "local_data" / "nasa_firms_2012-01-20_2023-12-31.csv"
)
INEI_LIMITES_ZIP = (
    Path(__file__).parent.parent.parent
    / "bronze" / "inei_limites" / "local_data" / "inei_departamentos_limites.zip"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

META_COMPLETITUD_MINIMA = 0.98  # sección 11.1 del informe


def cargar_historico() -> pd.DataFrame:
    if not BRONZE_FILE.exists():
        raise FileNotFoundError(f"No existe {BRONZE_FILE}")
    df = pd.read_csv(BRONZE_FILE)
    return df.rename(
        columns={
            "latitude": "latitud",
            "longitude": "longitud",
            "frp": "potencia_radiativa_mw",
            "confidence": "confianza",
            "acq_date": "fecha",
            "acq_time": "hora_utc",
            "daynight": "dia_noche",
        }
    )


def cargar_poligonos_region() -> gpd.GeoDataFrame:
    if not INEI_LIMITES_ZIP.exists():
        raise FileNotFoundError(
            f"No existe {INEI_LIMITES_ZIP}. Corre primero: "
            "python data/ingestion/inei_limites/fetch_inei_limites.py"
        )
    with TemporaryDirectory() as tmp:
        with zipfile.ZipFile(INEI_LIMITES_ZIP) as z:
            z.extractall(tmp)
        shp = list(Path(tmp).glob("*.shp"))[0]
        gdf = gpd.read_file(shp)
        return gdf.rename(columns={"DEPARTAMEN": "departamento"})[
            ["departamento", "geometry"]
        ].copy()


def asignar_region(df: pd.DataFrame, poligonos: gpd.GeoDataFrame) -> pd.DataFrame:
    puntos = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df["longitud"], df["latitud"]),
        crs=poligonos.crs,
    )
    unidos = gpd.sjoin(puntos, poligonos, how="left", predicate="within")
    unidos = unidos[~unidos.index.duplicated(keep="first")]
    unidos["departamento"] = unidos["departamento"].astype(str).str.strip().str.upper()
    return unidos.drop(columns=["index_right", "geometry"])


def limpiar(df: pd.DataFrame, poligonos: gpd.GeoDataFrame) -> pd.DataFrame:
    df["fecha"] = pd.to_datetime(df["fecha"], format="%Y-%m-%d", errors="coerce")

    antes = len(df)
    df = df.drop_duplicates(subset=["latitud", "longitud", "fecha", "hora_utc"])
    duplicados_removidos = antes - len(df)

    df = asignar_region(df, poligonos)

    sin_region = df["departamento"].isna() | (df["departamento"] == "NAN")
    fuera_de_peru_removidos = int(sin_region.sum())
    df = df[~sin_region]

    df.attrs["duplicados_removidos"] = duplicados_removidos
    df.attrs["fuera_de_peru_removidos"] = fuera_de_peru_removidos
    return df[
        ["fecha", "hora_utc", "departamento", "latitud", "longitud",
         "confianza", "potencia_radiativa_mw", "dia_noche"]
    ]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["fecha", "departamento", "latitud", "longitud", "potencia_radiativa_mw"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": META_COMPLETITUD_MINIMA,
                "valor": round(completitud, 4),
                "ok": bool(completitud >= META_COMPLETITUD_MINIMA),
            }
        )

    frp_no_negativo = (df["potencia_radiativa_mw"] >= 0).mean()
    resultado["reglas"].append(
        {
            "regla": "potencia_radiativa_no_negativa",
            "meta": 1.0,
            "valor": round(frp_no_negativo, 4),
            "ok": bool(round(frp_no_negativo, 6) >= 1.0),
        }
    )

    resultado["duplicados_removidos"] = int(df.attrs.get("duplicados_removidos", 0))
    resultado["fuera_de_peru_removidos"] = int(df.attrs.get("fuera_de_peru_removidos", 0))
    resultado["regiones_unicas"] = int(df["departamento"].nunique())
    resultado["todas_las_reglas_ok"] = all(r["ok"] for r in resultado["reglas"])
    return resultado


def main() -> None:
    df_crudo = cargar_historico()
    print(f"Cargados {len(df_crudo)} focos de calor crudos.")

    poligonos = cargar_poligonos_region()
    df_limpio = limpiar(df_crudo, poligonos)
    reporte = validar_calidad(df_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "nasa_firms_focos_calor_2012_2023.parquet"
    df_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "nasa_firms_calidad.json"
    reporte["fecha_procesamiento_utc"] = datetime.now(timezone.utc).isoformat()
    reporte_path.write_text(json.dumps(reporte, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"Registros limpios: {len(df_limpio)} "
        f"(duplicados removidos: {reporte['duplicados_removidos']}, "
        f"fuera de Perú: {reporte['fuera_de_peru_removidos']}, "
        f"regiones asignadas: {reporte['regiones_unicas']})"
    )
    print(f"Guardado en {parquet_path}")
    for regla in reporte["reglas"]:
        estado = "OK" if regla["ok"] else "FALLA"
        print(f"  [{estado}] {regla['regla']}: {regla['valor']} (meta {regla['meta']})")


if __name__ == "__main__":
    main()
