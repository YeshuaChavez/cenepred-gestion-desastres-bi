"""Tests de data/silver/nasa_firms/limpieza_nasa_firms.py.

A diferencia de USGS (sismos costeros/marinos), los focos de calor ocurren en tierra, así que
aquí el join geoespacial es un "within" estricto, sin margen de distancia. Se prueba que un punto
apenas fuera del polígono (a diferencia de USGS) NO se asigna a ninguna región.
"""

from __future__ import annotations

import geopandas as gpd
import pandas as pd
from shapely.geometry import box

from limpieza_nasa_firms import asignar_region, limpiar

LIMA_POLIGONO = box(-78.0, -13.0, -76.5, -11.5)


def _poligonos() -> gpd.GeoDataFrame:
    return gpd.GeoDataFrame({"departamento": ["LIMA"]}, geometry=[LIMA_POLIGONO], crs="EPSG:4326")


def test_punto_dentro_del_poligono_se_asigna():
    df = pd.DataFrame({"longitud": [-77.0], "latitud": [-12.0]})
    resultado = asignar_region(df, _poligonos())
    assert resultado.loc[0, "departamento"] == "LIMA"


def test_punto_apenas_fuera_del_poligono_no_se_asigna():
    # A solo 0.01 grados (~1km) del borde, pero fuera: sin margen de distancia (a diferencia de
    # USGS), un "within" estricto no debe asignarlo a LIMA.
    df = pd.DataFrame({"longitud": [-78.01], "latitud": [-12.0]})
    resultado = asignar_region(df, _poligonos())
    assert pd.isna(resultado.loc[0, "departamento"]) or resultado.loc[0, "departamento"] == "NAN"


def test_limpiar_descarta_focos_fuera_de_peru():
    df = pd.DataFrame(
        {
            "latitud": [-12.0, -12.0],
            "longitud": [-77.0, -78.5],
            "fecha": ["2020-03-15", "2020-03-15"],
            "hora_utc": ["1200", "1200"],
            "confianza": ["h", "h"],
            "potencia_radiativa_mw": [5.0, 5.0],
            "dia_noche": ["D", "D"],
        }
    )
    limpio = limpiar(df, _poligonos())
    assert len(limpio) == 1
    assert limpio.iloc[0]["departamento"] == "LIMA"


def test_limpiar_deduplica_por_ubicacion_fecha_hora():
    df = pd.DataFrame(
        {
            "latitud": [-12.0, -12.0],
            "longitud": [-77.0, -77.0],
            "fecha": ["2020-03-15", "2020-03-15"],
            "hora_utc": ["1200", "1200"],
            "confianza": ["h", "h"],
            "potencia_radiativa_mw": [5.0, 5.0],
            "dia_noche": ["D", "D"],
        }
    )
    limpio = limpiar(df, _poligonos())
    assert len(limpio) == 1
