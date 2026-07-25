"""Tests de data/silver/usgs/limpieza_usgs.py.

Cubren el bug real encontrado en la asignación de región: un join estricto "within" descartaba
~47% de sismos costeros/marinos que caen fuera de cualquier polígono departamental. La corrección
usa sjoin_nearest con un límite de 55 km, así que se prueba: punto dentro del polígono, punto en
el mar pero dentro del límite (se asigna al departamento más cercano), y punto fuera del límite
(no se asigna región y luego se descarta en limpiar()).
"""

from __future__ import annotations

import geopandas as gpd
import pandas as pd
from shapely.geometry import box

from limpieza_usgs import asignar_region, limpiar

# Un rectángulo simple que representa el departamento de LIMA, en la costa: longitud -78 a -76.5,
# latitud -13 a -11.5. El borde occidental (-78) es la línea de costa.
LIMA_POLIGONO = box(-78.0, -13.0, -76.5, -11.5)


def _poligonos() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame({"departamento": ["LIMA"]}, geometry=[LIMA_POLIGONO], crs="EPSG:4326")


def _eventos(puntos: list[tuple[float, float]]) -> pd.DataFrame:
    return pd.DataFrame(
        {
            "usgs_id": [f"ev{i}" for i in range(len(puntos))],
            "longitud": [p[0] for p in puntos],
            "latitud": [p[1] for p in puntos],
        }
    )


def test_punto_dentro_del_poligono_se_asigna_directo():
    df = _eventos([(-77.0, -12.0)])  # dentro del rectángulo de LIMA
    resultado = asignar_region(df, _poligonos())
    assert resultado.loc[0, "departamento"] == "LIMA"


def test_punto_en_el_mar_dentro_de_55km_se_asigna_al_mas_cercano():
    # ~0.2 grados de longitud al oeste de la costa (-78.0) equivalen a ~20km en esta latitud,
    # bien dentro del límite de 55km.
    df = _eventos([(-78.2, -12.0)])
    resultado = asignar_region(df, _poligonos())
    assert resultado.loc[0, "departamento"] == "LIMA"


def test_punto_lejos_en_el_mar_no_se_asigna_region():
    # ~2 grados de longitud (~220km) al oeste de la costa: fuera del límite de 55km.
    df = _eventos([(-80.0, -12.0)])
    resultado = asignar_region(df, _poligonos())
    assert pd.isna(resultado.loc[0, "departamento"]) or resultado.loc[0, "departamento"] == "NAN"


def test_limpiar_descarta_eventos_sin_region_asignada():
    df = pd.DataFrame(
        {
            "usgs_id": ["cerca", "lejos"],
            "fecha_hora_utc": [1_600_000_000_000, 1_600_000_000_000],
            "magnitud": [5.0, 6.0],
            "tipo_magnitud": ["mb", "mb"],
            "lugar": ["cerca de Lima", "medio del oceano"],
            "longitud": [-78.2, -80.0],
            "latitud": [-12.0, -12.0],
            "profundidad_km": [10.0, 10.0],
        }
    )
    limpio = limpiar(df, _poligonos())
    assert len(limpio) == 1
    assert limpio.iloc[0]["usgs_id"] == "cerca"
    assert limpio.iloc[0]["departamento"] == "LIMA"


def test_limpiar_deduplica_por_usgs_id():
    df = pd.DataFrame(
        {
            "usgs_id": ["mismo_evento", "mismo_evento"],
            "fecha_hora_utc": [1_600_000_000_000, 1_600_000_000_000],
            "magnitud": [5.0, 5.0],
            "tipo_magnitud": ["mb", "mb"],
            "lugar": ["cerca de Lima", "cerca de Lima"],
            "longitud": [-77.0, -77.0],
            "latitud": [-12.0, -12.0],
            "profundidad_km": [10.0, 10.0],
        }
    )
    limpio = limpiar(df, _poligonos())
    assert len(limpio) == 1
