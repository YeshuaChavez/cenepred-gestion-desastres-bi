"""Tests de data/gold/fact_emergencias.py: calcular_severidad().

Regla (criterio propio, ver fact_emergencias.py):
    ALTO:  fallecidos>0 o desaparecidos>0 o viviendas_destruidas>=10.
    MEDIO: no es ALTO, pero hay damnificados/viviendas afectadas o destruidas/afectados>50.
    BAJO:  todo lo demás.
"""

from __future__ import annotations

import pandas as pd

from fact_emergencias import calcular_severidad


def _base(**overrides) -> pd.DataFrame:
    fila = {
        "cantidad_fallecidos": 0,
        "cantidad_desaparecidos": 0,
        "viviendas_destruidas": 0,
        "cantidad_damnificados": 0,
        "viviendas_afectadas": 0,
        "cantidad_afectados": 0,
    }
    fila.update(overrides)
    return pd.DataFrame([fila])


def test_alto_por_fallecidos():
    resultado = calcular_severidad(_base(cantidad_fallecidos=1))
    assert resultado.iloc[0] == "ALTO"


def test_alto_por_desaparecidos():
    resultado = calcular_severidad(_base(cantidad_desaparecidos=2))
    assert resultado.iloc[0] == "ALTO"


def test_alto_por_viviendas_destruidas_en_el_umbral():
    resultado = calcular_severidad(_base(viviendas_destruidas=10))
    assert resultado.iloc[0] == "ALTO"


def test_medio_por_damnificados_sin_fallecidos():
    resultado = calcular_severidad(_base(cantidad_damnificados=5))
    assert resultado.iloc[0] == "MEDIO"


def test_medio_por_afectados_sobre_50():
    resultado = calcular_severidad(_base(cantidad_afectados=51))
    assert resultado.iloc[0] == "MEDIO"


def test_bajo_por_afectados_igual_a_50_no_supera_el_umbral():
    resultado = calcular_severidad(_base(cantidad_afectados=50))
    assert resultado.iloc[0] == "BAJO"


def test_bajo_sin_ningun_impacto():
    resultado = calcular_severidad(_base())
    assert resultado.iloc[0] == "BAJO"


def test_alto_tiene_prioridad_sobre_medio():
    # Cumple criterio de ALTO (fallecidos) Y de MEDIO (damnificados) a la vez: debe ganar ALTO.
    resultado = calcular_severidad(_base(cantidad_fallecidos=1, cantidad_damnificados=100))
    assert resultado.iloc[0] == "ALTO"


def test_menos_de_10_viviendas_destruidas_no_es_alto_por_si_solo():
    resultado = calcular_severidad(_base(viviendas_destruidas=9))
    assert resultado.iloc[0] == "MEDIO"
