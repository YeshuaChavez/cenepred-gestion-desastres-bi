"""Tests de data/silver/open_meteo/limpieza_open_meteo.py."""

from __future__ import annotations

import pandas as pd

from limpieza_open_meteo import limpiar, validar_calidad


def _df(**overrides) -> pd.DataFrame:
    base = {
        "fecha": ["2020-03-15", "2020-03-16"],
        "temp_max": [28.0, 27.0],
        "temp_min": [18.0, 17.0],
        "precipitacion_mm": [0.0, 5.2],
        "departamento": ["lima", "lima"],
    }
    base.update(overrides)
    return pd.DataFrame(base)


def test_limpiar_normaliza_departamento_a_mayusculas():
    limpio = limpiar(_df())
    assert (limpio["departamento"] == "LIMA").all()


def test_limpiar_parsea_fecha():
    limpio = limpiar(_df())
    assert pd.api.types.is_datetime64_any_dtype(limpio["fecha"])


def test_limpiar_deduplica_por_departamento_y_fecha():
    df = _df(
        fecha=["2020-03-15", "2020-03-15"],
        departamento=["lima", "lima"],
    )
    limpio = limpiar(df)
    assert len(limpio) == 1


def test_validar_calidad_detecta_precipitacion_negativa():
    limpio = limpiar(_df(precipitacion_mm=[-1.0, 5.2]))
    reporte = validar_calidad(limpio)
    regla = next(r for r in reporte["reglas"] if r["regla"] == "precipitacion_no_negativa")
    assert regla["ok"] is False


def test_validar_calidad_detecta_temperatura_fuera_de_rango():
    limpio = limpiar(_df(temp_max=[80.0, 27.0]))
    reporte = validar_calidad(limpio)
    regla = next(r for r in reporte["reglas"] if r["regla"] == "rango_temp_max_razonable")
    assert regla["ok"] is False


def test_validar_calidad_ok_con_datos_limpios():
    limpio = limpiar(_df())
    reporte = validar_calidad(limpio)
    assert reporte["todas_las_reglas_ok"] is True
