# Machine Learning

Consume la capa Gold para el componente predictivo del sistema (ver sección 10 del informe).
Entrenamiento y tracking vía MLflow.

- `training/` — Regresión Logística (baseline), Random Forest/XGBoost (clasificación principal),
  Prophet/SARIMA (forecasting), LSTM (comparación Deep Learning), K-Means (segmentación de
  regiones), Isolation Forest (detección de anomalías).
- `evaluation/` — cálculo de métricas frente a las metas de la sección 11.1 (F1-score, AUC-ROC,
  recall, RMSE, MAE, silhouette score) y explicabilidad SHAP.
- `inference/` — genera `FACT_PREDICCIONES` y el campo `cluster_riesgo` de `DIM_REGION` para
  consumo de los dashboards y el chatbot.
