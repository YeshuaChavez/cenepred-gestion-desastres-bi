# Dashboards de Power BI (Capa de Consumo Descriptiva y Predictiva)

Esta carpeta contiene los activos, archivos de proyecto, biblioteca de medidas DAX y documentación técnica de los **5 dashboards** del Sistema de Alerta Temprana de CENEPRED.

---

## 📁 Archivos en esta carpeta

* **`dashboard_cenepred.pbix`** — Archivo principal de Power BI Desktop conectado a Azure Databricks Serverless SQL Warehouse.
* **`medidas_dax.dax`** — Script de medidas DAX (Inteligencia de Tiempo, KPIs de Daño, Monitoreo Activo, ML Predictivo y Gasto Presupuestal MEF).
* **`MODELO_DATOS_POWERBI.md`** — Documentación técnica del esquema dimensional constelación, cardinalidad, relaciones y conector de Databricks.
* **`DASHBOARDS_SPEC.md`** — Especificación de maquetación visual, paleta de colores y componentes para los 5 dashboards.

---

## 📊 Resumen de los 5 Dashboards

1. **Monitoreo Diario de Riesgo y Actividad:** Clima (Open-Meteo), sismos 7d (USGS) y focos de calor satelitales activos (NASA FIRMS) por región.
2. **Histórico y Tendencias Multianuales:** Evolución temporal de emergencias 2012–2023 con Inteligencia de Tiempo YoY y YTD.
3. **Riesgo Dinámico Predictivo y Explicabilidad:** Mapa de riesgo con predicciones XGBoost (`FACT_PREDICCIONES`) y explicabilidad SHAP.
4. **Comparativo Regional y Matriz Estacional:** Heatmap Región × Mes y ranking de severidad ponderada.
5. **Impacto Socioeconómico y Presupuestal MEF:** Cruz de personas/viviendas afectadas vs. ejecución presupuestal PP 0068 (PREVAED).

---

## ⚡ Conexión a Azure Databricks

Los dashboards consumen las tablas Delta Lake de la capa Gold publicadas en Unity Catalog:

```
Power BI Desktop / Service 
       ↓ (DirectQuery / Import via Azure Databricks Connector)
Databricks Serverless SQL Warehouse (`sqlwh-cenepred-dev`)
       ↓
Delta Lake Gold (`dbw_cenepred_dev.default.*`)
```
