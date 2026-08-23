"""Limpia y estandariza el catálogo sísmico de USGS (Bronze -> Silver).

Lee el GeoJSON ya descargado en data/bronze/usgs/local_data/, estandariza tipos y campos, y
asigna cada sismo a una región del Perú mediante join geoespacial (point-in-polygon) contra los
límites departamentales de INEI (data/bronze/inei_limites/, sección 5.2 del informe). El bbox
usado en la ingesta es un rectángulo que roza países vecinos; los eventos que no caen dentro de
ningún polígono de región (ej. en Ecuador, Bolivia, Chile o en el mar) se descartan aquí.

Uso:
    python limpieza_usgs.py
"""

from __future__ import annotations

import json
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory

import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

BRONZE_DIR = Path(__file__).parent.parent.parent / "bronze" / "usgs" / "local_data"
INEI_LIMITES_ZIP = (
    Path(__file__).parent.parent.parent
    / "bronze" / "inei_limites" / "local_data" / "inei_departamentos_limites.zip"
)
OUTPUT_DIR = Path(__file__).parent / "local_data"

META_COMPLETITUD_MINIMA = 0.98  # sección 11.1 del informe


def cargar_historico() -> pd.DataFrame:
    # Toma el geojson más reciente (nombre con rango de fechas): soporta ventana histórica e incremental.
    archivos = sorted(BRONZE_DIR.glob("usgs_*.geojson"))
    if not archivos:
        raise FileNotFoundError(f"No hay archivos usgs_*.geojson en {BRONZE_DIR}")
    data = json.loads(archivos[-1].read_text(encoding="utf-8"))

    filas = []
    for feature in data["features"]:
        props = feature["properties"]
        lon, lat, prof = feature["geometry"]["coordinates"]
        filas.append(
            {
                "usgs_id": props.get("code"),
                "fecha_hora_utc": props["time"],
                "magnitud": props.get("mag"),
                "tipo_magnitud": props.get("magType"),
                "lugar": props.get("place"),
                "longitud": lon,
                "latitud": lat,
                "profundidad_km": prof,
            }
        )
    return pd.DataFrame(filas)


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


# Muchos sismos relevantes para el riesgo de Perú ocurren frente a la costa (mar), no dentro de
# ningún polígono departamental (verificado: ~1700 de 3632 eventos con "Peru" en su descripción
# quedaban excluidos con un join estricto "within"). Se usa el vecino más cercano en su lugar,
# con un límite de distancia para no adoptar sismos de países vecinos que sí caen dentro del
# bbox rectangular de la ingesta. 55 km cubre la plataforma continental cercana a la costa, sin
# llegar al interior de Ecuador/Chile/Bolivia.
DISTANCIA_MAXIMA_METROS = 55_000

# UTM zona 18S (EPSG:32718): CRS proyectado (metros) centrado en la costa central del Perú, que
# es donde ocurre la mayoría de los sismos costeros relevantes. sjoin_nearest necesita un CRS
# proyectado para calcular distancias reales; en un CRS geográfico (grados) geopandas advierte
# que la distancia calculada no es precisa.
CRS_PROYECTADO_PERU = "EPSG:32718"


def asignar_region(df: pd.DataFrame, poligonos: gpd.GeoDataFrame) -> pd.DataFrame:
    puntos = gpd.GeoDataFrame(
        df,
        geometry=[Point(lon, lat) for lon, lat in zip(df["longitud"], df["latitud"])],
        crs=poligonos.crs,
    )
    puntos_proy = puntos.to_crs(CRS_PROYECTADO_PERU)
    poligonos_proy = poligonos.to_crs(CRS_PROYECTADO_PERU)

    unidos = gpd.sjoin_nearest(
        puntos_proy, poligonos_proy, how="left", max_distance=DISTANCIA_MAXIMA_METROS
    )
    # sjoin_nearest puede producir más de una fila por punto si hay empate de distancia entre
    # dos polígonos; nos quedamos con la primera coincidencia de cada evento original. La
    # geometría (en metros, EPSG:32718) se descarta después, así que no hace falta reproyectarla
    # de vuelta a grados.
    unidos = unidos[~unidos.index.duplicated(keep="first")]
    unidos["departamento"] = unidos["departamento"].astype(str).str.strip().str.upper()
    return unidos.drop(columns=["index_right", "geometry"])


def limpiar(df: pd.DataFrame, poligonos: gpd.GeoDataFrame) -> pd.DataFrame:
    df["fecha_hora_utc"] = pd.to_datetime(df["fecha_hora_utc"], unit="ms", utc=True)
    df["fecha"] = df["fecha_hora_utc"].dt.date

    antes = len(df)
    df = df.drop_duplicates(subset="usgs_id")
    duplicados_removidos = antes - len(df)

    df = asignar_region(df, poligonos)

    # El bbox de ingesta es un rectángulo que roza países vecinos; los eventos a más de
    # DISTANCIA_MAXIMA_GRADOS de cualquier departamento (ej. interior de Ecuador/Chile/Bolivia)
    # no encuentran región dentro del límite y quedan con departamento nulo. Se descartan aquí.
    sin_region = df["departamento"].isna() | (df["departamento"] == "NAN")
    fuera_de_peru_removidos = int(sin_region.sum())
    df = df[~sin_region]

    df.attrs["duplicados_removidos"] = duplicados_removidos
    df.attrs["fuera_de_peru_removidos"] = fuera_de_peru_removidos
    return df[
        ["usgs_id", "fecha", "fecha_hora_utc", "departamento", "magnitud", "tipo_magnitud",
         "lugar", "longitud", "latitud", "profundidad_km"]
    ]


def validar_calidad(df: pd.DataFrame) -> dict:
    resultado = {"total_filas": len(df), "reglas": []}

    for campo in ["usgs_id", "fecha", "departamento", "magnitud", "longitud", "latitud"]:
        completitud = df[campo].notna().mean()
        resultado["reglas"].append(
            {
                "regla": f"completitud_{campo}",
                "meta": META_COMPLETITUD_MINIMA,
                "valor": round(completitud, 4),
                "ok": bool(completitud >= META_COMPLETITUD_MINIMA),
            }
        )

    magnitud_en_rango = df["magnitud"].between(0, 10).mean()
    resultado["reglas"].append(
        {
            "regla": "magnitud_en_rango_fisico",
            "meta": 1.0,
            "valor": round(magnitud_en_rango, 4),
            "ok": bool(round(magnitud_en_rango, 6) >= 1.0),
        }
    )

    resultado["duplicados_removidos"] = int(df.attrs.get("duplicados_removidos", 0))
    resultado["fuera_de_peru_removidos"] = int(df.attrs.get("fuera_de_peru_removidos", 0))
    resultado["regiones_unicas"] = int(df["departamento"].nunique())
    resultado["todas_las_reglas_ok"] = all(r["ok"] for r in resultado["reglas"])
    return resultado


def main() -> None:
    df_crudo = cargar_historico()
    print(f"Cargados {len(df_crudo)} eventos crudos.")

    poligonos = cargar_poligonos_region()
    df_limpio = limpiar(df_crudo, poligonos)
    reporte = validar_calidad(df_limpio)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    parquet_path = OUTPUT_DIR / "usgs_sismos_2012_2023.parquet"
    df_limpio.to_parquet(parquet_path)

    reporte_path = OUTPUT_DIR / "usgs_calidad.json"
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
