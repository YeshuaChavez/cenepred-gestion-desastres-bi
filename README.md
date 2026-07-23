# CENEPRED - Gestión de Desastres BI

Sistema de alerta temprana de riesgo dinámico ante emergencias climáticas en el Perú, construido
sobre una arquitectura Lakehouse (Medallion) en Microsoft Azure, con un componente de Business
Intelligence y uno de Machine Learning.

## Contexto

CENEPRED opera actualmente **SIGRID**, un sistema que caracteriza el riesgo de desastres de forma
**estructural y estática** (geología, pendientes, zonificación). Este proyecto no reemplaza SIGRID:
lo complementa con una capa de **riesgo dinámico y actualizado**, calculada a partir de condiciones
de monitoreo activo — clima reciente, actividad sísmica y focos de calor — cruzadas contra el
historial oficial de emergencias del Perú.

La pregunta que responde el sistema: dado el comportamiento histórico de emergencias por región y
las condiciones de monitoreo de los últimos días, ¿qué tan probable es que una región presente una
nueva emergencia en el corto plazo, y por qué?

## Fuentes de datos

| Fuente | Rol | Actualización |
|---|---|---|
| **INDECI (SINPAD)** | Histórico oficial de emergencias — variable objetivo | Irregular, con verificación automatizada |
| **Open-Meteo** | Clima diario (temperatura, precipitación) por región | Diaria |
| **USGS Earthquake Catalog** | Actividad sísmica histórica y reciente | Continua / tiempo real |
| **NASA FIRMS** | Detección satelital de focos de calor activos | ~cada 3 horas |

El histórico de entrenamiento se acota a los últimos 12 años con datos realmente publicados
(2012-2023), por consistencia de los registros de INDECI y cobertura real de NASA FIRMS.

## Arquitectura

Arquitectura Medallion (Bronze → Silver → Gold) sobre Azure Data Lake Storage Gen2, orquestada por
Azure Data Factory y procesada en Azure Databricks:

```
[INDECI] [Open-Meteo] [USGS] [NASA FIRMS]
        |       |        |        |
        +-------+--------+--------+
                    |
             Azure Data Factory  (orquestación)
                    |
    ADLS Gen2: /bronze -> /silver -> /gold  (Delta Lake)
                    |
             Azure Databricks  (PySpark, ML, MLflow)
                    |
    Azure Synapse Serverless SQL Pool
                    |
  Power BI  |  Chatbot (Azure OpenAI + AI Search)  |  Web App
```

**Gobierno de datos:** Microsoft Purview (catálogo y linaje), Great Expectations (calidad
Bronze → Silver), Microsoft Entra ID (RBAC), Azure Key Vault (secretos).

**Infraestructura como código:** Terraform, con entornos Dev / Test / Prod y despliegue vía GitHub
Actions (trunk-based: feature branches → PR → Dev automático, Test/Prod manual/aprobado).

## Modelo de datos

Modelo dimensional (constelación de hechos) en la capa Gold:

- **Dimensiones:** `DIM_TIEMPO`, `DIM_REGION` (incluye `region_natural` y `cluster_riesgo`),
  `DIM_FENOMENO`.
- **Hechos:** `FACT_EMERGENCIAS` (afectados, damnificados, fallecidos, lesionados, desaparecidos,
  viviendas afectadas/destruidas), `FACT_MONITOREO_DIARIO` (clima, sismos, focos de calor por
  región/día), `FACT_PREDICCIONES` (probabilidad de riesgo por modelo).

## Componente descriptivo (Power BI)

Cinco dashboards, cada uno con un propósito analítico distinto:

1. **Monitoreo Diario** — clima, sismos y focos de calor recientes por región.
2. **Histórico y Tendencias** — serie multianual de emergencias con inteligencia de tiempo.
3. **Riesgo Dinámico y Explicabilidad** — mapa de riesgo, probabilidad por región y SHAP.
4. **Comparativo Regional** — heatmap región × mes y ranking por tipo de fenómeno.
5. **Impacto Socioeconómico** — afectados, viviendas y severidad por región.

## Componente predictivo (Machine Learning)

- **Clasificación de riesgo:** Regresión Logística (baseline), Random Forest / XGBoost (principal).
- **Forecasting:** Prophet / SARIMA.
- **Deep Learning:** LSTM, como comparación metodológica frente a los modelos clásicos.
- **No supervisado:** K-Means (segmentación de regiones), Isolation Forest (detección de
  anomalías).
- **Explicabilidad:** SHAP sobre el modelo de clasificación principal.

Metas de desempeño: F1-score ≥ 0.75, AUC-ROC ≥ 0.80, recall ≥ 0.70 en clasificación; silhouette
score ≥ 0.50 en clustering; umbral de promoción a producción vía MLflow acorde a esas metas.

## Chatbot y aplicación final

Chatbot conversacional (RAG) sobre Azure OpenAI Service + Azure AI Search, que responde preguntas
en lenguaje natural sobre el riesgo por región combinando la predicción del modelo con su
explicación SHAP. Se integra junto a los cinco dashboards en una aplicación web desplegada en
Azure App Service o Azure Static Web Apps.

## Estructura del repositorio

| Carpeta | Contenido |
|---|---|
| `infra/` | Infraestructura como código (Terraform) para todos los recursos de Azure |
| `data/` | Lakehouse completo: `ingestion/`, `pipelines/` (ADF) y las capas Medallion `bronze/` → `silver/` → `gold/`, más `quality/` (Great Expectations) |
| `ml/` | Componente predictivo (`training/`, `evaluation/`, `inference/`), consume `data/gold/` |
| `apps/` | Capa de consumo final: `dashboards/` (los cinco de Power BI), `chatbot/` (RAG) y `webapp/` |
| `tests/` | Pruebas unitarias e de integración |
| `scripts/` | Utilidades de desarrollo local |
| `.github/workflows/` | Pipelines de CI/CD (build, test, deploy) |

## Estado actual

- Ingesta de INDECI implementada y validada contra la API real de datos abiertos del Perú.
- Resto de fuentes, infraestructura, notebooks, modelos y dashboards en desarrollo activo.
