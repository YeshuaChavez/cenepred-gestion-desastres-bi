"""Tests de data/gold/dim_tiempo.py. construir() no depende de ningún archivo, es puro."""

from __future__ import annotations

import pandas as pd

from dim_tiempo import construir, validar_calidad


def test_construir_cubre_toda_la_ventana_2012_2023_incluyendo_bisiestos():
    df = construir()
    # El calendario ahora se extiende dinámicamente hasta hoy (para el monitoreo diario a 2024+),
    # pero la ventana histórica 2012-2023 debe estar completa, con bisiestos 2012/2016/2020: 4383 días.
    assert df["fecha"].min() == pd.Timestamp("2012-01-01")
    assert df["fecha"].max() >= pd.Timestamp("2023-12-31")
    ventana_2012_2023 = df[(df["fecha"] >= "2012-01-01") & (df["fecha"] <= "2023-12-31")]
    assert len(ventana_2012_2023) == 4383
    assert df["fecha_id"].is_unique


def test_fecha_id_tiene_formato_yyyymmdd():
    df = construir()
    fila = df[df["fecha"] == "2020-03-15"].iloc[0]
    assert fila["fecha_id"] == 20200315


def test_temporada_hemisferio_sur():
    df = construir()
    enero = df[df["mes"] == 1].iloc[0]
    junio = df[df["mes"] == 6].iloc[0]
    assert enero["temporada"] == "VERANO"
    assert junio["temporada"] == "INVIERNO"


def test_validar_calidad_ok():
    df = construir()
    reporte = validar_calidad(df)
    assert reporte["todas_las_reglas_ok"] is True
    assert reporte["fecha_id_unico"] is True
