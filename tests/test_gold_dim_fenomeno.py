"""Tests de data/gold/dim_fenomeno.py.

El caso más valioso: CATEGORIA_POR_FENOMENO (Gold) debe tener una entrada para cada nombre
corregido en CORRECCION_TIPO_FENOMENO (Silver/INDECI, ver limpieza_indeci.py). Si alguien agrega
una corrección nueva en Silver sin agregar su categoría en Gold, ese fenómeno terminaría con
`categoria` nula silenciosamente — este test detecta ese desfase entre los dos archivos.
"""

from __future__ import annotations

import pandas as pd

from dim_fenomeno import CATEGORIA_POR_FENOMENO, validar_calidad
from limpieza_indeci import CORRECCION_TIPO_FENOMENO


def test_todos_los_fenomenos_corregidos_en_silver_tienen_categoria_en_gold():
    faltantes = [
        nombre_corregido
        for nombre_corregido in CORRECCION_TIPO_FENOMENO.values()
        if nombre_corregido not in CATEGORIA_POR_FENOMENO
    ]
    assert faltantes == []


def test_validar_calidad_detecta_fenomeno_sin_categoria():
    df = pd.DataFrame(
        {
            "fenomeno_id": [1, 2],
            "tipo_fenomeno": ["LLUVIAS INTENSAS", "FENOMENO_NUEVO_SIN_MAPEAR"],
            "categoria": ["HIDROMETEOROLOGICO Y OCEANOGRAFICO", None],
        }
    )
    reporte = validar_calidad(df)
    assert reporte["todas_las_reglas_ok"] is False
    assert reporte["sin_categoria_asignada"] == ["FENOMENO_NUEVO_SIN_MAPEAR"]


def test_validar_calidad_detecta_fenomeno_duplicado():
    df = pd.DataFrame(
        {
            "fenomeno_id": [1, 2],
            "tipo_fenomeno": ["LLUVIAS INTENSAS", "LLUVIAS INTENSAS"],
            "categoria": ["HIDROMETEOROLOGICO Y OCEANOGRAFICO"] * 2,
        }
    )
    reporte = validar_calidad(df)
    assert reporte["tipo_fenomeno_unico"] is False
    assert reporte["todas_las_reglas_ok"] is False
