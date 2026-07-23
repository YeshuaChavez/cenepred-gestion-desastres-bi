# CI/CD (GitHub Actions)

Pipeline previsto (ver sección 7.3 del informe):

1. **Build** — `terraform validate`/`plan`, validación de sintaxis de notebooks.
2. **Test** — pruebas de calidad de datos (Great Expectations) sobre un dataset de referencia.
3. **Deploy de infraestructura** — `terraform apply` al entorno correspondiente.
4. **Deploy de notebooks/pipelines** — publicación a Databricks y Data Factory.
5. **Registro y promoción de modelos** — MLflow Model Registry; promoción de staging a producción
   solo si F1-score ≥ 0.75 y AUC-ROC ≥ 0.80, con mejora de al menos 2 puntos porcentuales de F1
   sobre el modelo en producción (sección 11.1).

Rama trunk-based: feature branches → PR → Dev automático; Test/Prod manual/aprobado (sección 7.4).
