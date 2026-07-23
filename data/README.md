# Data

Todo lo relacionado al Lakehouse: desde la ingesta hasta el modelo dimensional listo para consumo
(ver secciones 4 y 5 del informe).

- `ingestion/` — scripts de ingesta (Azure Functions) por fuente externa.
- `pipelines/` — definiciones de Azure Data Factory (orquestación).
- `bronze/` → `silver/` → `gold/` — las tres capas de la arquitectura Medallion.
- `quality/` — suites de validación de calidad (Great Expectations), aplicadas en Bronze → Silver.
