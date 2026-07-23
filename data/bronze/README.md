# Bronze

Notebooks Databricks (PySpark) que registran y catalogan lo que las Functions de `data/ingestion/`
ya escribieron en crudo en el contenedor `/bronze` de ADLS Gen2 (`/bronze/indeci`,
`/bronze/clima`, `/bronze/sismos`, `/bronze/incendios`): metadatos de ingesta (fecha, fuente,
versión) para trazabilidad, sin transformar el contenido original (ver secciones 4.3, 5.1 y 5.2 del
informe). La escritura del dato crudo en sí la hace `data/ingestion/`, no estos notebooks.
