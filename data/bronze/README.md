# Bronze

Representa el contenedor `/bronze` de ADLS Gen2 (`/bronze/indeci`, `/bronze/clima`,
`/bronze/sismos`, `/bronze/incendios`): el dato crudo tal cual llega de cada fuente, sin
transformar. Localmente, cada subcarpeta (`indeci/`, `open_meteo/`, `usgs/`, `nasa_firms/`)
contiene un `local_data/` con lo que las Functions de `data/ingestion/` ya escribieron (esa
carpeta sí es solo código, no dato).

`registrar_ingesta.py` cataloga esos archivos crudos (metadatos de ingesta: fecha, fuente,
tamaño, checksum) para trazabilidad, sin transformar el contenido — ver secciones 4.3, 5.1 y 5.2
del informe. En Azure equivale al registro como tabla Delta y a la catalogación en Microsoft
Purview.
