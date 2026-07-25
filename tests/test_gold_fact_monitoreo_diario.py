"""Tests de data/gold/fact_monitoreo_diario.py.

construir_base() es puro (recibe DIM_TIEMPO/DIM_REGION como parámetros). agregar_sismos() lee
Silver/USGS de un Path fijo a nivel de módulo, así que se usa monkeypatch para apuntarlo a un
parquet de prueba en tmp_path, sin tocar el archivo real ni el código de producción.
"""

from __future__ import annotations

import pandas as pd

import fact_monitoreo_diario as fmd
from fact_monitoreo_diario import agregar_sismos, construir_base


def _dim_tiempo(fechas: list[str]) -> pd.DataFrame:
    fechas_ts = pd.to_datetime(fechas)
    return pd.DataFrame(
        {
            "fecha_id": [int(f.strftime("%Y%m%d")) for f in fechas_ts],
            "fecha": fechas_ts,
        }
    )


def _dim_region(departamentos: list[str]) -> pd.DataFrame:
    return pd.DataFrame(
        {"region_id": range(1, len(departamentos) + 1), "departamento": departamentos}
    )


def test_construir_base_es_producto_cartesiano_tiempo_por_region():
    dim_tiempo = _dim_tiempo(["2020-01-01", "2020-01-02", "2020-01-03"])
    dim_region = _dim_region(["LIMA", "CUSCO"])
    base = construir_base(dim_tiempo, dim_region)
    assert len(base) == 3 * 2
    assert set(base["departamento"].unique()) == {"LIMA", "CUSCO"}
    assert set(base.columns) == {"fecha_id", "fecha", "region_id", "departamento"}


def test_agregar_sismos_ventana_movil_7_dias_y_relleno_con_cero(tmp_path, monkeypatch):
    # 10 días de calendario para LIMA; solo el día 1 tiene sismos (2 eventos, magnitud máx 5.5).
    fechas = pd.date_range("2020-01-01", periods=10, freq="D")
    base = pd.DataFrame({"departamento": ["LIMA"] * 10, "fecha": fechas})

    usgs = pd.DataFrame(
        {
            "departamento": ["LIMA", "LIMA"],
            "fecha": [fechas[0].date(), fechas[0].date()],
            "magnitud": [4.0, 5.5],
        }
    )
    parquet_path = tmp_path / "usgs_sismos.parquet"
    usgs.to_parquet(parquet_path)
    monkeypatch.setattr(fmd, "USGS_SILVER", parquet_path)

    resultado = agregar_sismos(base)
    resultado = resultado.sort_values("fecha").reset_index(drop=True)

    # Día 1: 2 sismos, magnitud máxima 5.5.
    assert resultado.loc[0, "num_sismos_7d"] == 2
    assert resultado.loc[0, "magnitud_max_7d"] == 5.5
    # Día 7 (dentro de la ventana de 7 días desde el día 1): la actividad del día 1 sigue contando.
    assert resultado.loc[6, "num_sismos_7d"] == 2
    # Día 8 (8 días después del evento, ya fuera de la ventana de 7 días): vuelve a cero.
    assert resultado.loc[7, "num_sismos_7d"] == 0
    assert resultado.loc[7, "magnitud_max_7d"] != resultado.loc[7, "magnitud_max_7d"]  # NaN


def test_agregar_sismos_region_sin_ningun_sismo_queda_en_cero(tmp_path, monkeypatch):
    fechas = pd.date_range("2020-01-01", periods=3, freq="D")
    base = pd.DataFrame({"departamento": ["CUSCO"] * 3, "fecha": fechas})

    usgs_vacio = pd.DataFrame({"departamento": [], "fecha": [], "magnitud": []})
    parquet_path = tmp_path / "usgs_sismos.parquet"
    usgs_vacio.to_parquet(parquet_path)
    monkeypatch.setattr(fmd, "USGS_SILVER", parquet_path)

    resultado = agregar_sismos(base)
    assert (resultado["num_sismos_7d"] == 0).all()
