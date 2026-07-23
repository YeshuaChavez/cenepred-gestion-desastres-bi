# Silver

Notebooks Databricks (PySpark) que limpian y estandarizan los datos de Bronze a un grano común
(región - fecha): estandarización de Ubigeo (INEI), join geoespacial de las fuentes basadas en
coordenadas (USGS, NASA FIRMS) contra los polígonos de regiones del Perú (shapefile INEI), y
validación de calidad vía Great Expectations (`data_quality/`) — completitud ≥ 98%, consistencia de
Ubigeo 100% (ver secciones 4.4, 5.2 y 11.1 del informe).
