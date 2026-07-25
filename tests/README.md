# Pruebas

Tests unitarios reales (pytest) de las funciones puras de `data/silver/*/limpieza_*.py` y
`data/gold/*.py` — corren en CI (`.github/workflows/ci.yml`, job `tests`) en cada push/PR, sin
necesitar datos ni credenciales de Azure: usan fixtures sintéticas pequeñas, no los parquet reales
(que están gitignored).

Cada archivo cubre en particular los bugs reales que se encontraron y corrigieron construyendo el
pipeline (ver `conftest.py` para cómo se importan los scripts, que no son un paquete instalable):

- `test_silver_indeci.py` — bytes corruptos en departamento/tipo_fenomeno, filas placeholder sin
  id oficial de SINPAD (se descartan si están vacías, se conservan con id sintético si traen
  datos reales), deduplicación, formato de ubigeo.
- `test_silver_usgs.py` — asignación de región por `sjoin_nearest` con margen de 55km (sismos
  costeros/marinos), a diferencia del join estricto de NASA FIRMS.
- `test_silver_nasa_firms.py` — el mismo join, pero estricto ("within"), sin margen.
- `test_silver_open_meteo.py`, `test_silver_oni.py` — limpieza y reglas de calidad.
- `test_gold_dim_tiempo.py`, `test_gold_dim_fenomeno.py`, `test_gold_fact_emergencias.py`,
  `test_gold_fact_monitoreo_diario.py` — calendario, clasificación de fenómenos (con un test de
  consistencia contra `limpieza_indeci.py`), regla de severidad derivada, y ventana móvil de
  sismos de 7 días.

Uso local:
```
pip install -r requirements-dev.txt
python -m pytest tests/ -v
```

Pendiente (no implementado): pruebas de integración de pipelines ADF, que requieren un workspace
de Azure real.
