# Sistema de Alerta Temprana y Gestión del Riesgo de Desastres

Sistema informático para el monitoreo dinámico y la evaluación predictiva del riesgo de emergencias hidrometeorológicas y naturales en el Perú. El sistema integra telemetría sísmica, meteorológica, térmica y datos de ejecución presupuestal sobre el historial nacional de desastres, procesándolos mediante una arquitectura de datos Medallón en Azure y proporcionando interfaces analíticas y asistivas para la toma de decisiones.

## Descripción General

CENEPRED evalúa la vulnerabilidad territorial principalmente mediante factores estáticos como topografía, zonificación urbana y geología. Este sistema complementa dicha evaluación incorporando indicadores climáticos y sísmicos observados en tiempo real, cruzados con el historial oficial de emergencias.

El objetivo principal es estimar la probabilidad relativa de ocurrencia de emergencias por departamento en horizontes de corto plazo, identificar los factores determinantes de dicho riesgo y dar seguimiento a la asignación de recursos del Programa Presupuestal 0068 (PREVAED).

## Arquitectura de Datos

El flujo de información utiliza el patrón Medallion Lakehouse (Bronze, Silver, Gold) sobre Microsoft Azure Data Lake Storage Gen2 (ADLS Gen2). La orquestación y el agendamiento diario están a cargo de Azure Data Factory (ADF).

```
[SINPAD / INDECI]  [MEF PP0068]  [NASA FIRMS]  [USGS / Open-Meteo]
       │                 │             │                 │
       └─────────────────┴──────┬──────┴─────────────────┘
                                │
                     Azure Data Factory (ADF)
                                │
               Azure Data Lake Storage Gen2 (ADLS)
                 ├── /bronze  (JSON / CSV crudo)
                 ├── /silver  (Parquet limpio y estandarizado)
                 └── /gold    (Modelo Estrella Parquet)
                                │
      ┌─────────────────────────┼─────────────────────────┐
      │                         │                         │
Plataforma Web             Modelos ML              Asistente IA RAG
(Next.js / React)      (XGBoost / SHAP)          (Azure OpenAI / Search)
```

- **Bronze**: Almacenamiento de archivos crudos sin modificar tal como son entregados por las APIs de origen.
- **Silver**: Normalización de nombres departamentales, limpieza de caracteres, validación espacial de coordenadas y aplicación de reglas de calidad.
- **Gold**: Estructuración dimensional Star Schema optimizada para consumo analítico y entrenamiento de modelos.

## Fuentes de Datos

- **SINPAD / INDECI**: Registro histórico oficial de emergencias, personas afectadas, damnificadas, fallecidas y daños en infraestructura.
- **MEF (PP 0068 PREVAED)**: Presupuesto Institucional Modificado (PIM) y Devengado ejecutado por departamentos y pliegos ministeriales.
- **NASA FIRMS**: Detección satelital de focos de calor activos mediante sensores MODIS y VIIRS.
- **USGS**: Registro continuo de sismicidad (epicentro, profundidad y magnitud).
- **Open-Meteo & NOAA**: Telemetría hidrometeorológica diaria (precipitación acumulada y rangos de temperatura).

## Modelo Dimensional

La capa Gold organiza la información en un modelo estrella compuesto por dimensiones y tablas de hechos:

- `DIM_REGION`: Catálogo departamental con división por regiones naturales (Costa, Sierra, Selva) y clusters de riesgo.
- `DIM_FENOMENO`: Clasificación jerárquica de eventos (lluvias intensas, inundaciones, heladas, friajes, sismos, incendios forestales).
- `DIM_TIEMPO`: Dimensión temporal continua con atributos astronómicos y marcadores de variabilidad climática (El Niño / La Niña ONI).
- `FACT_EMERGENCIAS`: Consolidado de eventos históricos y métricas de impacto humano y físico.
- `FACT_MONITOREO_DIARIO`: Matriz departamental diaria con métricas meteorológicas, sísmicas y térmicas en ventanas móviles de 7 días.
- `FACT_GASTO_PREVAED`: Ejecución financiera de recursos asignados a la gestión del riesgo de desastres.

## Componentes Predictivos y Asistenciales

- **Clasificación de Riesgo**: Modelos XGBoost y LightGBM entrenados para clasificar el nivel de riesgo por departamento.
- **Modelado Temporal**: Redes neuronales recurrentes (LSTM) para la evaluación de series temporales de precipitación y actividad sísmica.
- **Explicabilidad**: Cálculo de valores SHAP (SHapley Additive exPlanations) para identificar el peso específico de cada variable en las predicciones generadas.
- **Asistente Conversacional**: Integración de Azure OpenAI y Azure AI Search (arquitectura RAG) para consultar el estado del sistema y los factores de riesgo mediante lenguaje natural.

## Aplicación Web

La interfaz de usuario está desarrollada en Next.js con TailwindCSS y provee:

- Mapa dinámico de riesgo por departamento.
- Cuadros de mando para monitoreo meteorológico, sísmico y térmico.
- Módulo de seguimiento presupuestal MEF por pliego ejecutor.
- Tablas comparativas y filtros por región, periodo y tipo de fenómeno.

## Ejecución y Pruebas

### Entorno Python

```bash
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Orquestación de Datos

```bash
# Ejecutar pipeline Medallón completo (Bronze, Silver, Gold, Export)
python data/pipelines/master_pipeline.py --stage all

# Exportar dataset consolidado para la aplicación web
python scripts/export_gold_to_webapp_json.py
```

### Pruebas Unitarias y Calidad

```bash
# Suite de pruebas unitarias
python -m pytest tests/ -v

# Validación de código
python -m ruff check . --select F,E9
```

### Aplicación Web

```bash
cd apps/webapp
npm install
npm run dev
```

## Infraestructura en la Nube

La infraestructura en Microsoft Azure está definida mediante Terraform (`infra/environments/prod`) e incluye:

- Grupo de Recursos: `rg-cenepred-dev`
- Data Factory: `adf-cenepred-dev`
- Storage Account (ADLS Gen2): `stcenepreddev1`
- Databricks Workspace: `dbw-cenepred-dev`
- Key Vault: `kv-cenepred-dev1`
- Azure OpenAI: `oai-cenepred-dev`

## Estructura del Proyecto

```text
.
├── .github/
│   └── workflows/              # Workflows de CI/CD para GitHub Actions
├── apps/
│   └── webapp/                 # Aplicación Web (Next.js 14, React 18, TailwindCSS)
├── data/
│   ├── bronze/                 # Capa Bronze: Datos crudos (JSON/CSV)
│   ├── silver/                 # Capa Silver: Datos limpios y estandarizados (Parquet)
│   ├── gold/                   # Capa Gold: Modelo dimensional Star Schema (Parquet)
│   └── pipelines/              # Scripts orquestadores del pipeline
├── docs/                       # Documentación técnica y manuales
├── infra/
│   ├── azure_data_factory/     # Definiciones JSON de pipelines y triggers ADF
│   └── environments/           # Infraestructura como Código (Terraform)
├── notebooks/                  # Cuadernos de análisis y modelado ML
├── scripts/                    # Scripts de exportación y utilerías
├── tests/                      # Pruebas unitarias (Pytest)
├── requirements.txt            # Dependencias de Python
└── README.md                   # Documentación principal
```
