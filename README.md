# Sistema de Alerta Temprana de Riesgo Dinámico ante Emergencias Climáticas - Perú

Plataforma de **Business Intelligence + Machine Learning** que estima y comunica el **riesgo dinámico** de emergencias hidrometeorológicas por departamento en el Perú, sobre una **arquitectura Lakehouse (Medallion) en Azure**, con dashboards en Power BI y una aplicación web pública.

---

## 1. Problema y propuesta

El **SIGRID (CENEPRED)** evalúa el riesgo de forma **estructural/estática** (geología, pendientes, zonificación). Este sistema **complementa** esa visión con **riesgo dinámico**: cruza el historial oficial de emergencias (INDECI/SINPAD, 2012-2023) con **telemetría actual** (clima, sismos, focos de calor, El Niño/ONI) para estimar, por departamento y a corto plazo, la probabilidad de una emergencia hidrometeorológica severa y sus **factores determinantes** (SHAP), además de dar seguimiento a la ejecución del **Programa Presupuestal 0068 (PREVAED)** del MEF.

---

## 2. Arquitectura general (automatizada de punta a punta)

```
Fuentes externas (APIs)
  INDECI/SINPAD · Open-Meteo · USGS · NASA FIRMS · NOAA ONI · INEI · MEF PP0068
        │
        ▼
Azure Data Factory (trigger diario 07:00 UTC)
        │  run-now (MSI)
        ▼
Azure Databricks (job diario, cluster single-node)
   master_pipeline.py --daily  →  Bronze → Silver → Gold (ventana incremental a HOY)
        ├──►  MERGE en tabla Delta Unity Catalog  (dbw_cenepred_dev.default.fact_monitoreo_diario)
        └──►  export Gold fresco a ADLS Gen2  (stcenepreddev1 / gold / *.parquet)
        │
        ├──►  Power BI  (modelo semántico sobre Unity Catalog · refresh programado 08:00 UTC)
        │
        └──►  GitHub Action (07:45 UTC)  →  regenera realData.json  →  commit
                     │
                     ▼
              Vercel  (redeploy automático del WebApp Next.js)
```

Cada mañana, sin intervención manual: el pipeline refresca los datos, Power BI y el WebApp se actualizan solos.

### Capas Medallion (Lakehouse en ADLS Gen2)
- **Bronze** - datos crudos tal cual los entregan las APIs (JSON/CSV/GeoJSON/ZIP).
- **Silver** - limpieza, tipado, normalización de nombres departamentales, join geoespacial (focos/sismos → departamento) y reglas de calidad (**pandera**).
- **Gold** - modelo dimensional (galaxy schema) en Parquet + tablas Delta en Unity Catalog para Power BI.

---

## 3. Fuentes de datos (reales)

| Fuente | Contenido | Cadencia |
|---|---|---|
| **INDECI / SINPAD** (CKAN datosabiertos) | Emergencias históricas: afectados, damnificados, fallecidos, viviendas | Histórico 2012-2023 |
| **Open-Meteo** (ERA5 archive) | Clima diario por región (temp máx/mín, precipitación) | Dinámica (a hoy) |
| **USGS** | Sismicidad (epicentro, profundidad, magnitud); join costa `sjoin_nearest` | Dinámica |
| **NASA FIRMS** (VIIRS) | Focos de calor satelitales; join geoespacial por departamento | Dinámica |
| **NOAA ONI** | Índice El Niño/La Niña (ENSO) | Mensual |
| **INEI** | Límites departamentales (shapefile) para los joins geoespaciales | Estático |
| **MEF PP0068 (PREVAED)** | PIM y devengado por departamento (Consulta Amigable, export manual) | Anual |

> La **ventana etiquetada del modelo** es 2012-2023 (rango real de INDECI). La telemetría (`fact_monitoreo_diario`) se extiende **hasta hoy** de forma incremental para el monitoreo dinámico; emergencias y gasto se mantienen históricos.

---

## 4. Modelo dimensional (Gold)

- `DIM_REGION` - 25 departamentos, región natural predominante y `cluster_riesgo` (K-Means).
- `DIM_TIEMPO` - calendario diario (2012 → hoy), con temporadas del hemisferio sur.
- `DIM_FENOMENO` - categorías de fenómenos (con foco en Hidrometeorológico y Oceanográfico).
- `FACT_EMERGENCIAS` - eventos SINPAD con impacto humano y físico (grano evento).
- `FACT_MONITOREO_DIARIO` - telemetría por región×día (clima, sismos 7d, focos, ONI). **Tabla dinámica**.
- `FACT_GASTO_PREVAED` - ejecución MEF PP0068 por región×año.

---

## 5. Machine Learning (`ml/`)

Target real: **¿ocurrirá una emergencia MEDIO/ALTO de origen Hidrometeorológico y Oceanográfico en la región dentro de los próximos 7 días?** Split **temporal** (train 2012-2020 / test 2021-2023), sin fuga de datos (features históricas calculadas solo sobre train; ventanas `reciente_Xd` con `shift(1)`).

| Modelo | F1 | AUC-ROC | Recall | Notas |
|---|---|---|---|---|
| Regresión Logística (baseline) | 0.560 | 0.650 | - | referencia |
| **Random Forest** | **0.773** | **0.882** | 0.785 | cumple las 3 metas |
| **XGBoost** | **~0.751** | **0.860** | 0.845 | modelo servido |
| LSTM (comparación) | 0.626 | 0.723 | 0.740 | documentado: no supera a XGBoost/RF |

Metas (sección 11.1 del informe): F1 ≥ 0.75, AUC ≥ 0.80, recall ≥ 0.70 - **cumplidas** por RF y XGBoost.

Además: **K-Means** (segmentación regional), **Isolation Forest** (anomalías de monitoreo), **SHAP nativo de XGBoost** (explicabilidad, `pred_contribs`). *(El forecasting Prophet/SARIMA fue evaluado y descartado por no superar al baseline naive.)*

- **Serving** (`data/ml/`): FastAPI + contrato Azure ML `init()/run()`; predice por región desde 3 artefactos autocontenidos (modelo `.pkl` + snapshot de features + metadata), sin depender de la capa Gold ni del módulo de training en runtime. Métricas **calculadas**, no hardcodeadas.

---

## 6. Aplicación web (`apps/webapp/`) - Next.js 14

Seis vistas (Home, Monitoreo Diario, Histórico y Tendencias, Riesgo Predictivo, Comparativo Regional, Presupuesto MEF) alimentadas por `realData.json` (agregados reales del Gold). Rutas API reales:

- **`/api/chat`** - Asistente analítico con **Azure OpenAI (GPT-4o)** y guardrails institucionales.
- **`/api/report`** - Generador de diagnóstico ejecutivo con **Google Gemini** (`gemini-3.6-flash`), a partir de datos reales del departamento.
- **`/api/alerts`** - Alertas de riesgo Alto/Crítico por **Telegram** (bot `@Cenepred_bot`) y correo (SMTP opcional).
- **Mapa interactivo** (Leaflet) con infraestructura crítica **real** (hospitales, puentes, albergues verificados); el `estado` operativo se **deriva del riesgo real** del departamento.

Stack: Next.js App Router, React 18, **Tailwind CSS** (build real con PostCSS, no CDN), Leaflet, Recharts. Diseño responsive; sin datos inventados (las series históricas provienen de `fact_emergencias`).

---

## 7. Automatización (schedules)

| Hora (UTC) | Componente | Acción |
|---|---|---|
| 07:00 | **ADF** `tr_daily_0700utc` | dispara el job de Databricks (Web activity, auth MSI) |
| ~07:05 | **Databricks** `cenepred-daily-medallion` | pipeline incremental → MERGE Delta (UC) + export Gold a ADLS |
| 07:45 | **GitHub Action** `daily_pipeline_sync` | baja Gold de ADLS → regenera `realData.json` → commit → Vercel redeploy |
| 08:00 | **Power BI Service** | refresh programado del modelo semántico |

Alertas de fallo por email vía **Azure Monitor** (ADF) y notificación del job (Databricks).

---

## 8. Ejecución local

### Python (pipeline / ML)
```bash
python -m venv venv
venv\Scripts\Activate.ps1        # Windows PowerShell
pip install -r requirements.txt   # + requirements-dev.txt para tests
```

```bash
# Pipeline Medallion completo (bronze → silver → gold → export → alertas)
python data/pipelines/master_pipeline.py

# Modo diario incremental (telemetría reciente → Gold, para el job de Databricks)
python data/pipelines/master_pipeline.py --daily

# Regenerar el JSON del webapp desde el Gold local
python scripts/export_gold_to_webapp_json.py
```

### Tests y linting (lo que corre CI)
```bash
python -m pytest tests/ -q            # 68 tests
python -m ruff check . --select F,E9
```

### WebApp
```bash
cd apps/webapp
npm install
npm run dev        # http://localhost:3000
```
Requiere `apps/webapp/.env.local` con `AZURE_OPENAI_*`, `GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (ver `.env.example`).

---

## 9. Infraestructura Azure (`rg-cenepred-dev`)

| Recurso | Nombre | Uso |
|---|---|---|
| Data Factory | `adf-cenepred-dev` | orquestación diaria (trigger + Web activity MSI) |
| ADLS Gen2 | `stcenepreddev1` | data lake bronze/silver/gold |
| Databricks | `dbw-cenepred-dev` | cómputo del pipeline + Unity Catalog + SQL Warehouse (Power BI) |
| Key Vault | `kv-cenepred-dev1` | secretos (pendiente de integración completa) |
| Azure OpenAI | `yeshuachavezlozano-8430-resource` | chatbot GPT-4o |
| Azure Monitor | `alert-adf-daily-failures` | alerta de fallo del pipeline |

> Secretos: nunca en el repo. En local viven en `apps/webapp/.env.local` (gitignored); en Databricks en el secret scope `cenepred`; en Vercel/GitHub como variables/secrets del proyecto. Los artefactos derivados (parquet, modelos `.pkl`, `.pbix`) están gitignored.

---

## 10. CI/CD (`.github/workflows/`)

- **`ci.yml`** - lint (ruff) + `py_compile` + `pytest` + smoke import, en cada push/PR.
- **`azure_adf_ci_cd.yml`** - tests + despliegue ADF (opt-in vía `vars.DEPLOY_ADF`).
- **`daily_pipeline_sync.yml`** - regeneración diaria de `realData.json` desde ADLS (requiere secret `AZURE_STORAGE_KEY`).

---

## 11. Estructura del repositorio

```text
.
├── .github/workflows/          # CI/CD (tests, sync diario webapp, deploy ADF)
├── apps/
│   ├── webapp/                 # Next.js 14 (chat, alertas, reportes, mapa, dashboards)
│   ├── chatbot/                # Servidor de chat standalone (Express)
│   └── dashboards/             # Power BI: .pbids, medidas DAX, specs, guía ADLS
├── data/
│   ├── ingestion/              # Fetchers Bronze por fuente
│   ├── bronze/ silver/ gold/   # Capas Medallion (local_data gitignored)
│   ├── quality/                # Validación (pandera)
│   ├── pipelines/              # master_pipeline.py (orquestador)
│   └── ml/                     # Serving del modelo (FastAPI + contrato Azure ML)
├── ml/
│   ├── training/               # LogReg, RandomForest/XGBoost, K-Means, IsolationForest, LSTM
│   ├── evaluation/             # SHAP
│   └── inference/              # generación de predicciones para el dashboard
├── infra/
│   ├── azure_data_factory/     # IaC ADF (linked service, pipeline, trigger)
│   ├── azure_ml/               # despliegue del endpoint Azure ML
│   ├── databricks/             # notebook del job diario
│   └── environments/ modules/  # Terraform (parcial)
├── scripts/                    # export webapp, sync/descarga ADLS, utilidades
├── tests/                      # 68 tests (pytest)
├── requirements.txt / -dev.txt
└── README.md
```

---

## 12. Estado y limitaciones (honesto)

- **Operativo y verificado:** pipeline diario ADF→Databricks→ADLS+Unity Catalog, Power BI (refresh programado), WebApp en producción (chat/alertas/reportes probados en vivo), 68 tests en verde.
- **Pendiente:** integración completa de Key Vault (requiere rol de secretos); el despliegue de Azure ML necesita empaquetar el snapshot junto al modelo; módulos Terraform parciales.
- **Alcance de datos:** emergencias y gasto MEF son históricos (2012-2023, límites reales de las fuentes); solo la telemetría de monitoreo es dinámica hasta hoy.
```
