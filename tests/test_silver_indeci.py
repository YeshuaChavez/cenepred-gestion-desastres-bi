"""Tests de data/silver/indeci/limpieza_indeci.py.

Cubren los bugs reales encontrados y corregidos durante la construcción de Silver: bytes
corruptos en departamento/tipo_fenomeno, filas sin id oficial de SINPAD (algunas vacías -> se
descartan, otras con datos reales -> id sintético), duplicados, y el ubigeo sin cero a la
izquierda.
"""

from __future__ import annotations

import geopandas as gpd
import pandas as pd
from shapely.geometry import Point

from limpieza_indeci import limpiar, validar_calidad

COLUMNAS_CRUDAS_BASE = {
    "provincia": "LIMA",
    "distrito": "LIMA",
    "region": "COSTA",
    "safecta": 0.0,
    "sdamni": 0.0,
    "sfalle": 0.0,
    "slesi": 0.0,
    "sdesa": 0.0,
    "safectaviv": 0.0,
    "sdestruviv": 0.0,
    "num_posx": -77.0,
    "num_posy": -12.0,
    "anio_archivo": "2020",
}


def _fila(**overrides) -> dict:
    fila = {
        "ide_sinpad": 100001.0,
        "cod_ubigeo": "150101",
        "departamen": "LIMA",
        "fenomeno": "LLUVIAS INTENSAS",
        "fecha": "15/03/2020",
        **COLUMNAS_CRUDAS_BASE,
    }
    fila.update(overrides)
    return fila


def _gdf(filas: list[dict]) -> gpd.GeoDataFrame:
    df = pd.DataFrame(filas)
    geometry = [Point(f["num_posx"], f["num_posy"]) for f in filas]
    return gpd.GeoDataFrame(df, geometry=geometry, crs="EPSG:4326")


def test_corrige_departamento_con_byte_corrupto():
    gdf = _gdf([_fila(departamen="APURXMAC")])  # "X" simula el byte corrupto en la vocal
    limpio = limpiar(gdf)
    assert limpio.loc[0, "departamento"] == "APURIMAC"


def test_corrige_tipo_fenomeno_con_byte_corrupto():
    gdf = _gdf([_fila(fenomeno="SEQUXAS")])
    limpio = limpiar(gdf)
    assert limpio.loc[0, "tipo_fenomeno"] == "SEQUIAS"


def test_fila_sin_id_y_sin_datos_se_descarta():
    # Simula una fila placeholder real de INDECI (verificado en 2018/2022/2023): sin id oficial y
    # con TODOS los campos de negocio en None/NaN real (no el string "nan", que sí cuenta como
    # "con datos" tras el .astype(str) de limpiar()).
    gdf = _gdf(
        [
            _fila(ide_sinpad=100001.0),
            _fila(
                ide_sinpad=float("nan"),
                cod_ubigeo=None,
                fecha=None,
                fenomeno=None,
                safecta=float("nan"),
            ),
        ]
    )
    limpio = limpiar(gdf)
    assert len(limpio) == 1
    assert limpio.iloc[0]["emergencia_id"] == "100001"


def test_fila_sin_id_pero_con_datos_reales_se_conserva_con_id_sintetico():
    gdf = _gdf(
        [
            _fila(ide_sinpad=100001.0),
            _fila(ide_sinpad=float("nan"), cod_ubigeo="020101", fenomeno="HELADAS"),
        ]
    )
    limpio = limpiar(gdf)
    assert len(limpio) == 2
    fila_generada = limpio[limpio["emergencia_id_generado"]]
    assert len(fila_generada) == 1
    assert fila_generada.iloc[0]["emergencia_id"].startswith("SIN_ID_")


def test_deduplica_por_emergencia_id():
    gdf = _gdf([_fila(ide_sinpad=100001.0), _fila(ide_sinpad=100001.0)])
    limpio = limpiar(gdf)
    assert len(limpio) == 1


def test_emergencia_id_real_queda_como_string_de_entero():
    gdf = _gdf([_fila(ide_sinpad=117516.0)])
    limpio = limpiar(gdf)
    assert limpio.loc[0, "emergencia_id"] == "117516"
    assert not limpio.loc[0, "emergencia_id_generado"]


def test_ubigeo_se_rellena_con_ceros_a_la_izquierda():
    gdf = _gdf([_fila(cod_ubigeo="1234")])
    limpio = limpiar(gdf)
    assert limpio.loc[0, "ubigeo"] == "001234"


def test_validar_calidad_detecta_ubigeo_mal_formado():
    gdf = _gdf([_fila(cod_ubigeo="150101"), _fila(ide_sinpad=100002.0, cod_ubigeo="ABC")])
    limpio = limpiar(gdf)
    reporte = validar_calidad(limpio)
    regla_ubigeo = next(r for r in reporte["reglas"] if r["regla"] == "consistencia_ubigeo_formato")
    assert regla_ubigeo["ok"] is False


def test_validar_calidad_mide_completitud_id_sobre_datos_crudos():
    # 1 de 4 filas sin id oficial (y sin datos, se descarta en limpiar): la completitud reportada
    # debe reflejar el 75% crudo, no el 100% que quedaría después de descartar esa fila.
    filas = [_fila(ide_sinpad=100001.0 + i) for i in range(3)]
    filas.append(_fila(ide_sinpad=float("nan"), cod_ubigeo="nan", fecha=None, fenomeno="nan"))
    limpio = limpiar(_gdf(filas))
    reporte = validar_calidad(limpio)
    regla_id = next(r for r in reporte["reglas"] if r["regla"] == "completitud_emergencia_id")
    assert regla_id["valor"] == 0.75
    assert regla_id["ok"] is False
