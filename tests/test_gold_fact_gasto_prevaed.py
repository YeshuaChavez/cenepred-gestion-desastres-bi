"""Tests de data/gold/fact_gasto_prevaed.py: validar_calidad()."""

from __future__ import annotations

import pandas as pd

from fact_gasto_prevaed import validar_calidad


def _fila(**overrides) -> dict:
    fila = {
        "region_id": 1,
        "anio": 2020,
        "monto_pia": 1000,
        "monto_pim": 1200,
        "monto_certificado": 1100,
        "monto_comprometido_anual": 1000,
        "monto_devengado": 900,
        "monto_girado": 850,
        "avance_pct": 75.0,
    }
    fila.update(overrides)
    return fila


def test_validar_calidad_ok_con_datos_limpios():
    df = pd.DataFrame([_fila(region_id=r, anio=2020) for r in range(1, 26)])
    reporte = validar_calidad(df)
    assert reporte["todas_las_reglas_ok"] is True
    assert reporte["grano_region_anio_unico"] is True


def test_validar_calidad_detecta_grano_duplicado():
    df = pd.DataFrame([_fila(region_id=1, anio=2020), _fila(region_id=1, anio=2020)])
    reporte = validar_calidad(df)
    assert reporte["grano_region_anio_unico"] is False
    assert reporte["todas_las_reglas_ok"] is False


def test_validar_calidad_detecta_monto_negativo():
    df = pd.DataFrame([_fila(monto_devengado=-500)])
    reporte = validar_calidad(df)
    assert reporte["montos_devengados_no_negativos"] is False
    assert reporte["todas_las_reglas_ok"] is False


def test_validar_calidad_detecta_region_id_sin_asignar():
    # Simula un departamento que no encontró match en DIM_REGION (join fallido).
    df = pd.DataFrame([_fila(region_id=1), _fila(region_id=None, anio=2021)])
    reporte = validar_calidad(df)
    regla = next(r for r in reporte["reglas"] if r["regla"] == "completitud_region_id")
    assert regla["ok"] is False
    assert reporte["todas_las_reglas_ok"] is False
