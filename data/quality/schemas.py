"""Esquemas declarativos de calidad de datos (Bronze -> Silver), con pandera.

El informe (sección 4.4) especifica Great Expectations para esta validación, pero esa librería
requiere numpy < 2.0, que no tiene wheels precompilados para Python 3.14 (muy reciente) y falla
al compilar desde código fuente en este entorno (requiere GCC >= 8.4, no disponible). Se usa
pandera en su lugar: misma idea (esquema declarativo de tipos/rangos/nulabilidad como única
fuente de verdad, en vez de validaciones sueltas repetidas en cada script), compatible con
Python 3.14 y numpy 2.x.

Cada esquema formaliza las reglas ya usadas en los reportes de calidad de cada script de Silver
(data/silver/*/limpieza_*.py): completitud de campos clave, formato de Ubigeo, rangos físicos
razonables. Las 25 regiones válidas se derivan de data/ingestion/open_meteo/regiones_peru.py.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandera.pandas as pa
from pandera.typing import DateTime, Series

sys.path.insert(0, str(Path(__file__).parent.parent / "ingestion" / "open_meteo"))
from regiones_peru import REGIONES_CAPITALES  # noqa: E402

REGIONES_VALIDAS = [r for r, _ in REGIONES_CAPITALES]


class IndeciSchema(pa.DataFrameModel):
    emergencia_id: Series[str]
    fecha: Series[DateTime]
    ubigeo: Series[str] = pa.Field(str_matches=r"^\d{6}$")
    departamento: Series[str] = pa.Field(isin=REGIONES_VALIDAS)
    tipo_fenomeno: Series[str]
    cantidad_afectados: Series[float] = pa.Field(ge=0)
    cantidad_damnificados: Series[float] = pa.Field(ge=0)
    cantidad_fallecidos: Series[float] = pa.Field(ge=0)
    cantidad_lesionados: Series[float] = pa.Field(ge=0)
    cantidad_desaparecidos: Series[float] = pa.Field(ge=0)
    viviendas_afectadas: Series[float] = pa.Field(ge=0)
    viviendas_destruidas: Series[float] = pa.Field(ge=0)
    longitud: Series[float] = pa.Field(ge=-82, le=-68)
    latitud: Series[float] = pa.Field(ge=-19, le=0.5)

    class Config:
        strict = False  # el parquet trae columnas adicionales (emergencia_id_generado, etc.)


class OpenMeteoSchema(pa.DataFrameModel):
    departamento: Series[str] = pa.Field(isin=REGIONES_VALIDAS)
    fecha: Series[DateTime]
    temp_max: Series[float] = pa.Field(ge=-10, le=45)
    temp_min: Series[float] = pa.Field(ge=-15, le=35)
    precipitacion_mm: Series[float] = pa.Field(ge=0)

    class Config:
        strict = False


class UsgsSchema(pa.DataFrameModel):
    usgs_id: Series[str]
    fecha: Series[object]
    departamento: Series[str] = pa.Field(isin=REGIONES_VALIDAS)
    magnitud: Series[float] = pa.Field(ge=0, le=10)
    longitud: Series[float]
    latitud: Series[float]

    class Config:
        strict = False


class NasaFirmsSchema(pa.DataFrameModel):
    fecha: Series[DateTime]
    departamento: Series[str] = pa.Field(isin=REGIONES_VALIDAS)
    latitud: Series[float]
    longitud: Series[float]
    potencia_radiativa_mw: Series[float] = pa.Field(ge=0)

    class Config:
        strict = False


class OniSchema(pa.DataFrameModel):
    anio: Series[int] = pa.Field(ge=2003, le=2023)
    mes: Series[int] = pa.Field(ge=1, le=12)
    oni: Series[float] = pa.Field(ge=-3, le=3)

    class Config:
        strict = False
