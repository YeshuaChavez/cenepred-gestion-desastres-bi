# CENEPRED · Sistema de Alerta Temprana de Riesgo Dinámico

El sistema toma emergencias oficiales (INDECI/SINPAD), clima, sismos, focos de calor, el estado de El Niño y la ejecución presupuestal del Estado; los procesa en un Lakehouse en Azure; entrena un modelo que estima el riesgo por región; y lo publica en dashboards de Power BI y en una aplicación web pública. Todo se refresca solo cada mañana.

---

## Contexto y problema

En el Perú, la evaluación del riesgo de desastres (a cargo del CENEPRED, a través del SIGRID) es sobre todo **estructural**: geología, pendientes, zonificación urbana, materiales de construcción. Es información valiosa pero **estática**: describe qué tan vulnerable es un territorio en general, no si el riesgo está subiendo *esta semana* porque lleva cinco días lloviendo, hay focos de calor activos o el índice ENSO entró en fase de El Niño.

Esta plataforma no reemplaza esa mirada estructural: la **complementa con riesgo dinámico**. Cruza el registro histórico de emergencias con la telemetría más reciente para estimar, región por región y a corto plazo, la probabilidad de una emergencia hidrometeorológica severa, señalar los factores que más pesan en esa estimación, y darle seguimiento a si el presupuesto de prevención (Programa Presupuestal 0068, PREVAED) se está ejecutando donde el riesgo lo justifica.

## Funcionalidades principales

- **Un mapa de riesgo vivo** por los 25 departamentos, con el nivel operativo derivado del riesgo real (no de valores fijos).
- **Un modelo predictivo** que responde "¿emergencia climática severa en 7 días?" con explicaciones por región (qué variable empuja el riesgo hacia arriba).
- **Monitoreo diario** de clima, sismos y focos de calor, con la telemetría extendida hasta la fecha de hoy.
- **Seguimiento presupuestal** de la inversión en prevención por gobierno regional.
- **Un asistente analítico** que responde en lenguaje natural sobre regiones, riesgo y presupuesto.
- **Alertas automáticas** por Telegram y correo cuando una región entra en riesgo Alto o Crítico, sin que nadie tenga que apretar un botón.
- **Diagnósticos ejecutivos** generados con IA a partir de datos reales de cada departamento.

---

## Arquitectura

La columna vertebral es un **Lakehouse con arquitectura Medallion** (Bronze, Silver, Gold) sobre Azure Data Lake Storage Gen2. Cada capa tiene una responsabilidad clara y los datos solo avanzan cuando pasan sus controles de calidad.

```
Fuentes externas
  INDECI/SINPAD · Open-Meteo · USGS · NASA FIRMS · NOAA ONI · INEI · MEF PP0068
        │
        ▼
   BRONZE   datos crudos, tal cual los entrega cada API (JSON/CSV/GeoJSON/ZIP)
        │   se conserva la fuente original, sin tocar
        ▼
   SILVER   limpieza y estandarización: nombres de departamento normalizados,
        │   tipado, joins geoespaciales (cada sismo y foco de calor cae en su
        │   departamento) y reglas de calidad validadas con pandera
        ▼
   GOLD     modelo dimensional listo para analítica y para entrenar el modelo,
            en Parquet y en tablas Delta dentro de Unity Catalog
```

### Flujo de datos (Bronze, Silver, Gold)

Un foco de calor detectado por el satélite VIIRS llega a **Bronze** como una fila con latitud y longitud. En **Silver** se le hace un *join* espacial contra los límites departamentales del INEI para saber a qué región pertenece, se descartan coordenadas fuera del país y se agrega a la ventana móvil de 7 días de esa región. En **Gold** termina como una columna (`num_focos_calor_activos`) de `fact_monitoreo_diario`, la tabla que el modelo lee para estimar el riesgo y que Power BI consume para pintar el mapa. El mismo camino recorren la precipitación, los sismos y el índice ENSO.

### Orquestación y automatización diaria

La parte que hace que todo esto sea sostenible es que **se ejecuta solo**. No hay pasos manuales entre que amanece y que los tableros muestran datos nuevos:

| Hora (UTC) | Qué ocurre |
|------------|------------|
| 07:00 | **Azure Data Factory** dispara el job de Databricks (Web activity con identidad administrada, para correr como propietario con acceso a Unity Catalog). |
| ~07:05 | **Databricks** ejecuta el pipeline en modo incremental: recalcula la telemetría reciente hasta hoy, hace `MERGE` sobre la tabla Delta en Unity Catalog y exporta un Gold fresco a ADLS. |
| 07:45 | Una **GitHub Action** descarga ese Gold, regenera el `realData.json` de la web y hace commit; **Vercel** redespliega la app sola. |
| 08:00 | **Power BI Service** refresca su modelo semántico contra Unity Catalog. |

Si algo falla, Azure Monitor (para ADF) y la notificación del job (para Databricks) avisan por correo. El resultado: cada mañana el mapa, los dashboards y las métricas amanecen con datos al día sin intervención humana.

---

## Modelo predictivo

El modelo responde una pregunta concreta y con valor operativo: **¿ocurrirá una emergencia de severidad media o alta, de origen hidrometeorológico u oceanográfico, en esta región dentro de los próximos 7 días?** Ese enunciado no salió a la primera; se afinó siguiendo la evidencia (y está documentado en el código):

1. "Cualquier emergencia en 7 días" daba 72% de positivos porque INDECI registra hasta incidentes menores: casi trivial de predecir, sin valor real.
2. "Solo severidad alta, cualquier causa" mezclaba accidentes de tránsito, incendios urbanos y epidemias con eventos climáticos; el AUC no pasaba de 0.6 porque se le pedía al modelo predecir cosas que el clima no explica.
3. **Media o alta severidad, solo categoría hidrometeorológica y oceanográfica**: aquí la señal se vuelve coherente con lo que las fuentes de monitoreo pueden explicar causalmente, y las métricas suben con sentido.

El entrenamiento usa un **split temporal** (entrena con 2012 a 2020, evalúa con 2021 a 2023) para simular condiciones reales de pronóstico, sin "espiar" el futuro. Las features históricas se calculan solo sobre el tramo de entrenamiento y las ventanas recientes usan `shift(1)` para no filtrar el propio día.

| Modelo | F1 | AUC-ROC | Recall | Rol |
|--------|-----|---------|--------|-----|
| Regresión Logística | 0.560 | 0.650 | - | baseline de referencia |
| **Random Forest** | **0.773** | **0.882** | 0.785 | cumple las tres metas |
| **XGBoost** | **~0.751** | **0.860** | 0.845 | modelo servido en producción |
| LSTM | 0.626 | 0.723 | 0.740 | evaluado; documentado como no superior |

Las metas del proyecto (F1 ≥ 0.75, AUC ≥ 0.80, recall ≥ 0.70) las cumplen Random Forest y XGBoost. Sobre el conjunto de prueba (27,375 filas región-día de 2021 a 2023) la matriz de confusión del modelo servido es 9,531 verdaderos positivos, 11,530 verdaderos negativos, 4,563 falsos positivos y 1,751 falsos negativos: en gestión de desastres se prioriza el recall (no dejar pasar una emergencia real) por encima de la precisión.

Además del clasificador conviven **K-Means** (segmentación de regiones por perfil de riesgo), **Isolation Forest** (detección de anomalías en el monitoreo) y **SHAP nativo de XGBoost** para la explicabilidad: cada predicción viene con el peso de las variables que la empujan. El forecasting con Prophet/SARIMA se evaluó y se descartó por no superar al baseline ingenuo.

El modelo se **sirve** con FastAPI siguiendo el contrato `init()/run()` de Azure ML, a partir de tres artefactos autocontenidos (el modelo `.pkl`, un snapshot de features y su metadata), de modo que el endpoint arranca sin depender de la capa Gold ni del código de entrenamiento en runtime, y sus métricas se **calculan**, no se escriben a mano.

---

## Aplicación web

Construida en **Next.js 14** (App Router) con **Tailwind CSS**, la app tiene seis vistas (Inicio, Monitoreo Diario, Histórico y Tendencias, Riesgo Predictivo, Comparativo Regional y Presupuesto de Prevención) alimentadas por agregados reales del Gold. Detrás de la interfaz corren rutas API propias:

- **Asistente analítico** con guardrails institucionales, acotado al dominio de gestión del riesgo.
- **Generador de diagnósticos ejecutivos** por departamento, con IA, a partir de datos reales.
- **Despacho de alertas** de riesgo Alto y Crítico por Telegram y correo, pensado para ejecutarse de forma automática.
- **Mapa interactivo** (Leaflet) con infraestructura crítica real (hospitales, puentes y albergues verificados), cuyo estado operativo se deriva del riesgo real de cada departamento.

El diseño es responsive: navegación con menú lateral en escritorio y menú desplegable en móvil, sin desbordes horizontales, y sin datos inventados (las series históricas provienen directamente de `fact_emergencias`).

---

## Fuentes de datos

| Fuente | Qué aporta | Cadencia |
|--------|------------|----------|
| **INDECI / SINPAD** | Emergencias oficiales: afectados, damnificados, fallecidos, viviendas (84,369 eventos, 11.1M afectados) | Histórico 2012 a 2023 |
| **Open-Meteo** (ERA5) | Clima diario por región: temperatura máxima/mínima, precipitación | Dinámica, hasta hoy |
| **USGS** | Sismicidad: epicentro, profundidad, magnitud | Dinámica |
| **NASA FIRMS** (VIIRS) | Focos de calor satelitales | Dinámica |
| **NOAA ONI** | Índice El Niño / La Niña (ENSO) | Mensual |
| **INEI** | Límites departamentales para los joins geoespaciales | Estático |
| **MEF PP0068** (PREVAED) | Presupuesto y ejecución de prevención (PIM S/ 31,016M, 71.4% ejecutado) | Anual |

Las emergencias y el gasto son históricos porque ese es el rango real de sus fuentes; solo la telemetría de monitoreo se extiende de forma incremental hasta la fecha actual, que es justo lo que da sentido al "riesgo dinámico".

### Modelo dimensional (capa Gold)

- `DIM_REGION`: 25 departamentos, región natural predominante y cluster de riesgo (K-Means).
- `DIM_TIEMPO`: calendario diario desde 2012 hasta hoy, con temporadas del hemisferio sur.
- `DIM_FENOMENO`: taxonomía de fenómenos, con foco en la categoría hidrometeorológica y oceanográfica.
- `FACT_EMERGENCIAS`: eventos SINPAD con impacto humano y físico (grano de evento).
- `FACT_MONITOREO_DIARIO`: telemetría por región y día (la tabla dinámica que crece cada mañana).
- `FACT_GASTO_PREVAED`: ejecución presupuestal por región y año.

---

## Infraestructura en Azure

Todo vive en el grupo de recursos `rg-cenepred-dev`:

| Recurso | Nombre | Función |
|---------|--------|---------|
| Data Factory | `adf-cenepred-dev` | orquesta el pipeline diario |
| ADLS Gen2 | `stcenepreddev1` | data lake Bronze / Silver / Gold |
| Databricks | `dbw-cenepred-dev` | cómputo del pipeline, Unity Catalog y SQL Warehouse para Power BI |
| Key Vault | `kv-cenepred-dev1` | secretos (integración en curso) |
| Azure OpenAI | recurso dedicado | asistente conversacional |
| Azure Monitor | `alert-adf-daily-failures` | avisa si el pipeline falla |

### Gestión de secretos y seguridad

Ningún secreto vive en el repositorio. En local se cargan desde `apps/webapp/.env.local` (ignorado por git); en Databricks desde el secret scope; en Vercel y GitHub como variables del proyecto. Los artefactos derivados (parquet, modelos `.pkl`, binarios `.pbix`) también están fuera del control de versiones y se regeneran desde el pipeline.

---

## Ejecución local

**Pipeline y modelo (Python):**

```bash
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt      # y requirements-dev.txt para las pruebas
```

```bash
# Pipeline Medallion completo (bronze -> silver -> gold -> export)
python data/pipelines/master_pipeline.py

# Modo incremental diario (el que corre en Databricks)
python data/pipelines/master_pipeline.py --daily

# Regenerar el JSON de la web desde el Gold local
python scripts/export_gold_to_webapp_json.py
```

**Aplicación web (Next.js):**

```bash
cd apps/webapp
npm install
npm run dev        # http://localhost:3000
```

La web necesita un `apps/webapp/.env.local` con las claves del asistente, del generador de diagnósticos y del bot de alertas (ver `.env.example`).

### Pruebas y calidad de código

La misma suite que corre en CI:

```bash
python -m pytest tests/ -q            # 68 pruebas
python -m ruff check . --select F,E9
```

El typecheck de la web se valida con `npx tsc --noEmit` dentro de `apps/webapp`.

---

## Estructura del repositorio

```text
apps/
  webapp/        Next.js 14: mapa, dashboards, asistente, alertas, diagnósticos
  chatbot/       servidor de chat independiente (Express)
  dashboards/    Power BI: .pbids, medidas DAX, especificaciones
data/
  ingestion/     descarga de datos crudos por fuente (Bronze)
  bronze/ silver/ gold/   las tres capas Medallion
  quality/       validación de calidad (pandera)
  pipelines/     master_pipeline.py, el orquestador
  ml/            serving del modelo (FastAPI + contrato Azure ML)
ml/
  training/      LogReg, Random Forest / XGBoost, K-Means, Isolation Forest, LSTM
  evaluation/    explicabilidad (SHAP)
  inference/     generación de predicciones para el dashboard
infra/
  azure_data_factory/   pipeline, trigger y linked service como código
  databricks/    notebook del job diario
  azure_ml/      despliegue del endpoint
scripts/         export a la web, sincronización con ADLS, utilidades
tests/           68 pruebas (pytest)
```
