# CI/CD (GitHub Actions)

## Implementado (`ci.yml`, corre en cada push/PR a `main`)

1. **Lint y sintaxis** — `py_compile` sobre todos los `.py` del repo y `ruff check --select F,E9`
   (errores de sintaxis, nombres indefinidos, imports/variables sin usar).
2. **Dependencias** — instala `requirements.txt` y hace un smoke test de import de las librerías
   clave (pandas, geopandas, pandera, scikit-learn, xgboost, torch, shap, mlflow, azure-*).
3. **Terraform validate (condicional)** — si `infra/` ya tiene módulos `.tf`, corre
   `fmt -check` + `validate` por módulo; si todavía no existen (estado actual), el job lo reporta
   y termina sin fallar.

## Pendiente (requiere secretos de Azure, no implementado aún)

Descrito en la sección 7.3 del informe, pero no se puede ejecutar de verdad sin credenciales:

4. **Deploy de infraestructura** — `terraform apply` al entorno correspondiente (Dev automático,
   Test/Prod manual/aprobado — trunk-based, sección 7.4). Falta: módulos Terraform en `infra/` y
   backend remoto de state.
5. **Deploy de notebooks/pipelines** — publicación a Databricks y Data Factory. Falta: workspaces
   provisionados.
6. **Registro y promoción de modelos** — MLflow Model Registry; promoción de staging a producción
   solo si F1-score ≥ 0.75 y AUC-ROC ≥ 0.80, con mejora de al menos 2 puntos porcentuales de F1
   sobre el modelo en producción (sección 11.1). Falta: MLflow tracking server accesible desde CI.

Estos se irán agregando como jobs nuevos (probablemente `cd.yml`) a medida que exista
infraestructura real contra la cual correr — no tiene sentido simular un deploy que siempre
fallaría por falta de secretos.

## Nota sobre validación de calidad de datos

Los datos de Silver/Gold no están versionados en git (`.gitignore`, por diseño: van a Azure).
Por eso `data/quality/validar_silver.py` (pandera, ver `schemas.py`) no corre en CI todavía —
no hay contra qué validar en un checkout limpio. Se ejecuta localmente después de cada
`limpieza_*.py`.
