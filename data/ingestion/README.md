# Ingesta de datos (Azure Functions)

Scripts Python que consultan cada fuente externa y escriben el resultado crudo en `/bronze` de
ADLS Gen2, orquestados por Azure Data Factory (ver sección 4.5 y 5.2 del informe). Esta carpeta
contiene solo el código; el dato crudo descargado en sí vive en `data/bronze/{fuente}/local_data/`
(ver `data/bronze/README.md`), no aquí.

| Carpeta | Fuente | Frecuencia real |
|---|---|---|
| `indeci/` | SINPAD (CSV / Shapefile) | Irregular, con verificación automatizada periódica |
| `open_meteo/` | API REST de clima diario | Diaria |
| `usgs/` | Earthquake Catalog API | Continua / tiempo real |
| `nasa_firms/` | Focos de calor (FIRMS/LANCE) | ~cada 3 horas |
| `inei_limites/` | Polígonos de región (INEI) — referencia geoespacial, no una de las 4 fuentes analíticas del núcleo | Prácticamente estática, sin ventana de fechas |
| `noaa_oni/` | Índice Oceánico El Niño (ONI, NOAA PSL) | Mensual |
| `mef_pp0068/` | Ejecución de gasto del PP0068 PREVAED por departamento (MEF, Consulta Amigable) — enriquecimiento del dashboard de Impacto Socioeconómico, no alimenta el modelo ML | Anual, **exportación manual** (sin API ni dataset abierto filtrable por programa presupuestal — ver docstring de `organizar_exportacion_manual.py`) |
