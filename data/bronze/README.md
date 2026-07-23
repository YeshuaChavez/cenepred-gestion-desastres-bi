# Bronze

Notebooks Databricks (PySpark) que escriben la ingesta cruda de cada fuente en su formato
original, sin transformar, con metadatos de ingesta (fecha, fuente, versión) para trazabilidad.
Corresponde al contenedor `/bronze` de ADLS Gen2: `/bronze/indeci`, `/bronze/clima`,
`/bronze/sismos`, `/bronze/incendios` (ver sección 5.1 y 5.2 del informe).
