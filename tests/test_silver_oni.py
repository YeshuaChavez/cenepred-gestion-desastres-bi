"""Tests de data/silver/noaa_oni/limpieza_oni.py.

Cubre el filtrado del valor centinela (+/-99.9, usado por NOAA para meses aún sin dato) y el
acotado a la ventana 2012 -> año en curso del proyecto.
"""

from __future__ import annotations

from datetime import datetime, timezone

import pandas as pd

from limpieza_oni import VALOR_CENTINELA, limpiar, validar_calidad


def test_limpiar_descarta_valor_centinela():
    df = pd.DataFrame(
        {
            "anio": [2020, 2020],
            "mes": [1, 2],
            "oni": [0.5, VALOR_CENTINELA],
        }
    )
    limpio = limpiar(df)
    assert len(limpio) == 1
    assert limpio.iloc[0]["mes"] == 1


def test_limpiar_descarta_anios_fuera_de_la_ventana():
    anio_actual = datetime.now(timezone.utc).year
    df = pd.DataFrame(
        {
            "anio": [2003, 2012, 2023, anio_actual, 2099],
            "mes": [1, 1, 1, 1, 1],
            "oni": [0.1, 0.2, 0.3, 0.4, 0.5],
        }
    )
    anios = sorted(limpiar(df)["anio"].unique().tolist())
    assert 2003 not in anios  # antes de 2012, descartado
    assert 2099 not in anios  # posterior al año en curso, descartado
    assert {2012, 2023, anio_actual}.issubset(set(anios))


def test_limpiar_descarta_centinela_negativo():
    # NOAA usa -99.9 (no solo +99.9) para meses del año en curso aún sin publicar.
    df = pd.DataFrame({"anio": [2020, 2020], "mes": [1, 2], "oni": [0.5, -VALOR_CENTINELA]})
    limpio = limpiar(df)
    assert len(limpio) == 1 and limpio.iloc[0]["mes"] == 1


def test_validar_calidad_meses_esperados_completos():
    filas = [
        {"anio": anio, "mes": mes, "oni": 0.0}
        for anio in range(2012, 2024)
        for mes in range(1, 13)
    ]
    limpio = limpiar(pd.DataFrame(filas))
    reporte = validar_calidad(limpio)
    assert reporte["todas_las_reglas_ok"] is True
    assert reporte["total_filas"] == reporte["meses_esperados"] == 144


def test_validar_calidad_falla_si_faltan_meses():
    filas = [{"anio": 2020, "mes": mes, "oni": 0.0} for mes in range(1, 6)]
    limpio = limpiar(pd.DataFrame(filas))
    reporte = validar_calidad(limpio)
    assert reporte["todas_las_reglas_ok"] is False
