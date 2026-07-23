# Ingesta de datos (Azure Functions)

Scripts Python que consultan cada fuente externa y escriben el resultado crudo en `/bronze` de
ADLS Gen2, orquestados por Azure Data Factory (ver sección 4.5 y 5.2 del informe).

| Carpeta | Fuente | Frecuencia real |
|---|---|---|
| `indeci/` | SINPAD (CSV / Shapefile) | Irregular, con verificación automatizada periódica |
| `open_meteo/` | API REST de clima diario | Diaria |
| `usgs/` | Earthquake Catalog API | Continua / tiempo real |
| `nasa_firms/` | Focos de calor (FIRMS/LANCE) | ~cada 3 horas |
