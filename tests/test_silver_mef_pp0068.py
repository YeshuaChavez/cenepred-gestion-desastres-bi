"""Tests de data/silver/mef_pp0068/limpieza_mef_pp0068.py.

Cubre lo específico de esta fuente: el nombre de departamento viene con un código numérico
("01: AMAZONAS") que hay que descartar, y Consulta Amigable nombra al Callao distinto
("Provincia Constitucional del Callao") del nombre canónico usado en el resto del proyecto
("CALLAO").
"""

from __future__ import annotations

import pandas as pd

from limpieza_mef_pp0068 import DEPARTAMENTOS_ESPERADOS, limpiar, validar_calidad

COLUMNAS_MONTO = [
    "monto_pia", "monto_pim", "monto_certificado", "monto_comprometido_anual",
    "monto_atencion_compromiso_mensual", "monto_devengado", "monto_girado",
]


def _fila_cruda(departamento_crudo: str, anio: int = 2020, **overrides) -> dict:
    fila = {"departamento_crudo": departamento_crudo, "anio": anio, "avance_pct": 80.0}
    for col in COLUMNAS_MONTO:
        fila[col] = 1000
    fila.update(overrides)
    return fila


def _df_25_departamentos(anio: int = 2020) -> pd.DataFrame:
    nombres = [
        "AMAZONAS", "ANCASH", "APURIMAC", "AREQUIPA", "AYACUCHO", "CAJAMARCA",
        "PROVINCIA CONSTITUCIONAL DEL CALLAO", "CUSCO", "HUANCAVELICA", "HUANUCO", "ICA",
        "JUNIN", "LA LIBERTAD", "LAMBAYEQUE", "LIMA", "LORETO", "MADRE DE DIOS", "MOQUEGUA",
        "PASCO", "PIURA", "PUNO", "SAN MARTIN", "TACNA", "TUMBES", "UCAYALI",
    ]
    filas = [_fila_cruda(f"{i + 1:02d}: {nombre}", anio=anio) for i, nombre in enumerate(nombres)]
    return pd.DataFrame(filas)


def test_limpiar_descarta_el_codigo_numerico_del_departamento():
    df = pd.DataFrame([_fila_cruda("01: AMAZONAS")])
    limpio = limpiar(df)
    assert limpio.loc[0, "departamento"] == "AMAZONAS"


def test_limpiar_corrige_nombre_del_callao():
    df = pd.DataFrame([_fila_cruda("07: PROVINCIA CONSTITUCIONAL DEL CALLAO")])
    limpio = limpiar(df)
    assert limpio.loc[0, "departamento"] == "CALLAO"


def test_limpiar_convierte_montos_a_numerico():
    df = pd.DataFrame([_fila_cruda("15: LIMA", monto_devengado="12345")])
    limpio = limpiar(df)
    assert limpio.loc[0, "monto_devengado"] == 12345
    assert pd.api.types.is_numeric_dtype(limpio["monto_devengado"])


def test_validar_calidad_ok_con_25_departamentos():
    # Simula tener la ventana 2012-2023 completa repitiendo el mismo año limpio para cada uno.
    todos = pd.concat(
        [limpiar(_df_25_departamentos(anio=anio)) for anio in range(2012, 2024)],
        ignore_index=True,
    )
    reporte = validar_calidad(todos)
    assert reporte["todos_los_anios_tienen_25_departamentos"] is True
    assert reporte["anios_faltantes"] == []
    assert reporte["todas_las_reglas_ok"] is True


def test_validar_calidad_detecta_departamento_faltante():
    df = _df_25_departamentos(anio=2020).iloc[:-1]  # solo 24 departamentos
    limpio = limpiar(df)
    reporte = validar_calidad(limpio)
    assert reporte["todos_los_anios_tienen_25_departamentos"] is False
    assert reporte["todas_las_reglas_ok"] is False


def test_validar_calidad_detecta_anio_faltante():
    limpio = limpiar(_df_25_departamentos(anio=2020))
    reporte = validar_calidad(limpio)
    assert 2012 in reporte["anios_faltantes"]
    assert reporte["todas_las_reglas_ok"] is False


def test_validar_calidad_detecta_monto_negativo():
    df = _df_25_departamentos(anio=2020)
    df.loc[0, "monto_devengado"] = -500
    limpio = limpiar(df)
    reporte = validar_calidad(limpio)
    assert reporte["montos_devengados_no_negativos"] is False


def test_departamentos_esperados_es_25():
    assert DEPARTAMENTOS_ESPERADOS == 25
