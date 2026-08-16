# 🚨 Sistema de Alerta Temprana (SAT) y Gestión Integral del Riesgo de Desastres - CENEPRED

[![Azure Data Factory & ETL Pipeline CI/CD](https://github.com/YeshuaChavez/cenepred-gestion-desastres-bi/actions/workflows/azure_adf_ci_cd.yml/badge.svg)](https://github.com/YeshuaChavez/cenepred-gestion-desastres-bi/actions/workflows/azure_adf_ci_cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Azure ADLS Gen2](https://img.shields.io/badge/Azure-ADLS%20Gen2-0089D6.svg)](https://azure.microsoft.com/)
[![Azure Data Factory](https://img.shields.io/badge/Azure-Data%20Factory-0089D6.svg)](https://azure.microsoft.com/)

> **Plataforma Integral de Monitoreo en Tiempo Real, Evaluación Predictiva de Riesgo y Asistencia Conversacional IA** para la prevención, reducción y atención de emergencias por fenómenos climáticos y desastres naturales en el territorio nacional peruano.

---

## 📌 1. Visión General del Sistema

El **Sistema de Alerta Temprana (SAT) CENEPRED** es una plataforma tecnológica avanzada diseñada para complementar la evaluación de riesgo estático tradicional (como geología, pendientes o zonificación) con un enfoque de **riesgo dinámico en tiempo real y capacidad predictiva**.

El sistema procesa e integra continuas transmisiones de datos satelitales, hidrometeorológicos, actividad sísmica y presupuestos de emergencia del Estado, combinándolos con el historial oficial de emergencias de las últimas décadas. Mediante modelos de **Machine Learning explicable (SHAP)** y un **Asistente Virtual basado en Inteligencia Artificial Generativa (RAG con Azure OpenAI)**, el SAT CENEPRED permite a las autoridades, brigadistas y analistas de gestión de riesgos anticipar eventos críticos, priorizar la asignación de recursos presupuestales y tomar decisiones operativas oportunas para salvar vidas.

---

## 🏗️ 2. Arquitectura del Sistema & Flujo de Datos (Capa Medallón)

La arquitectura de datos está construida siguiendo el patrón **Medallion Lakehouse (Bronze → Silver → Gold)** alojada en **Microsoft Azure Data Lake Storage Gen2 (ADLS Gen2)**, orquestada de forma automática mediante **Azure Data Factory** y ejecutada en entornos distribuidos.

```
       FUENTES DE DATOS EXTERNAS E INTERNAS EN TIEMPO REAL
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ INDECI/SINPAD│   │ MEF (PP0068) │   │ NASA FIRMS   │   │ Open-Meteo   │
│ (Emergencias)│   │ (Presupuesto)│   │ (Focos Calor)│   │  (Sismos/Clima)
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │                  │
       └──────────────────┴────────┬─────────┴──────────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │  Azure Data Factory (ADF)    │
                   │ (Trigger Diario Automatizado) │
                   └───────────────┬───────────────┘
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       │     MICROSOFT AZURE DATA LAKE STORAGE GEN2 (ADLS)      │
       │                                                       │
       │  ┌─────────────────────────────────────────────────┐  │
       │  │ Capa BRONZE: Datos Crudos en Formato JSON/CSV   │  │
       │  └────────────────────────┬────────────────────────┘  │
       │                           │ (Limpieza, Deduplicación,  │
       │                           │  Normalización, Validaciones QA)
       │  ┌────────────────────────▼────────────────────────┐  │
       │  │ Capa SILVER: Datos Estandarizados (Parquet)     │  │
       │  └────────────────────────┬────────────────────────┘  │
       │                           │ (Modelado Estrella Star Schema,│
       │                           │  Feature Engineering & ML) │
       │  ┌────────────────────────▼────────────────────────┐  │
       │  │ Capa GOLD: Tablas Dimensionales y Hechos Parquet│  │
       │  └────────────────────────┬────────────────────────┘  │
       └───────────────────────────┼───────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
┌────────▼────────┐       ┌────────▼────────┐       ┌────────▼────────┐
│  Plataforma Web │       │  Modelos ML     │       │ Assistant AI    │
│  Next.js (SAT)  │       │  Predictivos    │       │  (RAG OpenAI)   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Descripción de las Capas Medallón:
- **Capa Bronze (`adls://bronze/`)**: Almacena las extracciones crudas e inmutables obtenidas directamente desde las APIs oficiales de SINPAD, MEF, NASA FIRMS, USGS y Open-Meteo, preservando el trazado histórico original.
- **Capa Silver (`adls://silver/`)**: Limpia, enriquece y estandariza los datos. Aplica normalización de nombres de departamentos, limpieza de caracteres corruptos, resolución espacial de coordenadas a departamentos (geofencing) y pasa por la suite automatizada de validaciones de calidad (`validar_silver.py`).
- **Capa Gold (`adls://gold/`)**: Estructura los datos en un **Modelo Dimensional Estrella (Star Schema)** optimizado para análisis analítico de alto rendimiento, consulta rápida desde la aplicación web y alimentación del motor predictivo.

---

## 🌐 3. Fuentes de Datos Oficiales Integradas

| Fuente | Tipo de Datos | Frecuencia de Actualización | Función en el Sistema |
| :--- | :--- | :--- | :--- |
| **INDECI / SINPAD** | Histórico Oficial de Emergencias | Continua / Diaria | Registro de eventos, fallecidos, damnificados, afectados y viviendas destruidas. |
| **MEF (PP 0068 PREVAED)** | Presupuesto Institucional Modificado (PIM) y Devengado | Diaria | Seguimiento a la ejecución presupuestal para reducción de la vulnerabilidad y atención de emergencias. |
| **NASA FIRMS (Satelital)** | Detección de Focos de Calor Activos | ~Cada 3 horas (VIIRS/MODIS) | Identificación satelital inmediata de incendios forestales y anomalías térmicas. |
| **USGS Earthquake Catalog** | Telemetría Sísmica Global | Tiempo Real | Monitoreo de magnitud, profundidad y epicentros de sismos en el territorio nacional y mar peruano. |
| **Open-Meteo & NOAA** | Variables Hidrometeorológicas | Diaria / Horaria | Medición de precipitaciones acumuladas (24h), temperaturas máximas/mínimas y anomalías climáticas. |

---

## 📊 4. Modelo de Datos Dimensional (Star Schema - Capa Gold)

La capa Gold organiza la información estratégica mediante las siguientes tablas dimensionales y hechos:

### Tablas Dimensionales (`DIM_*`):
- **`DIM_REGION`**: Catálogo único de los 24 departamentos de la República del Perú y la Provincia Constitucional del Callao, agrupados por regiones naturales (Costa, Sierra, Selva) y clusters de vulnerabilidad.
- **`DIM_FENOMENO`**: Clasificación jerárquica de fenómenos climáticos y físicos (Lluvias Intensas, Inundaciones, Heladas, Sismos, Incendios Forestales, Friajes, Deslizamientos/Huaicos).
- **`DIM_TIEMPO`**: Dimensión temporal continua (2012–2023+) con atributos de año, mes, trimestre, día, estación astronómica y banderas de eventos climáticos globales (El Niño / La Niña ONI).

### Tablas de Hechos (`FACT_*`):
- **`FACT_EMERGENCIAS`**: Registro consolidado de eventos históricos con métricas de impacto socioeconómico (fallecidos, heridos, damnificados, viviendas destruidas, nivel de severidad).
- **`FACT_MONITOREO_DIARIO`**: Matriz de telemetría diaria que combina precipitaciones acumuladas, temperaturas, número de focos de calor activos y sismos en ventana móvil de 7 días por departamento.
- **`FACT_GASTO_PREVAED`**: Seguimiento financiero detallado por departamento y pliego ejecutor (MINDEF, MINSA, MTC, ANA, INDECI) sobre el Programa Presupuestal 0068.

---

## 🤖 5. Motor Predictivo de Machine Learning & Explicabilidad SHAP

El componente predictivo evalúa constantemente el riesgo relativo de cada departamento para los siguientes 7 días:

1. **Modelos de Clasificación de Riesgo**:
   - **XGBoost & LightGBM**: Modelos principales entrenados sobre el historial de telemetría climática y registros de emergencias para clasificar el nivel de riesgo (Bajo, Medio, Alto, Crítico).
   - **Random Forest**: Modelo de ensamble alternativo para validación cruzada.
2. **Deep Learning Temporal**:
   - **Redes Neuronal LSTM (Long Short-Term Memory)**: Captura dependencias secuenciales multivariadas en las series temporales de precipitación y actividad sísmica.
3. **Clustering y Detección de Anomalías**:
   - **K-Means Clustering**: Segmentación no supervisada de departamentos según perfiles de vulnerabilidad estructural y climática.
   - **Isolation Forest**: Identificación en tiempo real de anomalías atípicas en sensores meteorológicos y sísmicos.
4. **Explicabilidad con SHAP (SHapley Additive exPlanations)**:
   - Cada predicción de riesgo generada por el sistema incluye el desglose exacto de los factores determinantes (ej. *"+42% debido a lluvias acumuladas > 85mm en 24h", "+28% por focos de calor activos en la última semana"*), permitiendo una auditoría transparente del algoritmo.

---

## 💬 6. Asistente Conversacional Inteligente (IA RAG)

El SAT CENEPRED integra un **Asistente Virtual interactivo** basado en arquitectura **RAG (Retrieval-Augmented Generation)**:
- **Tecnología**: Azure OpenAI Service (GPT-4o) integrado con Azure AI Search.
- **Capacidades**:
  - Responde consultas en lenguaje natural formuladas por autoridades y analistas sobre el estado de riesgo de cualquier región.
  - Ofrece sugerencias inmediatas con accesos directos (*Regiones en Riesgo*, *Presupuesto MEF*, *Lluvia Máx 24h*, *Riesgo Predictivo*).
  - Explica las causas subyacentes del nivel de alerta combinando el modelo SHAP con los informes oficiales de CENEPRED e INDECI.

---

## 💻 7. Plataforma Web Interactiva (Next.js 14)

La aplicación web ofrece una experiencia de usuario fluida, moderna y responsiva construida con **Next.js 14, React 18 y TailwindCSS**:

- **Visor Geográfico de Riesgo**: Mapa interactivo del Perú teñido por niveles de riesgo actualizados en tiempo real.
- **Tablero de Monitoreo Meteorológico y Sísmico**: Métricas diarias de precipitación, focos de calor activos y registro sismológico.
- **Monitor de Ejecución Presupuestal MEF**: Cuadro comparativo de PIM vs. Devengado por departamento y pliegos ejecutores claves.
- **Filtros Dinámicos**: Exploración personalizada por departamento, fenómeno natural y ventana temporal.
- **Modo Oscuro / Claro & Paleta Sky**: Interfaz diseñada para salas de control de mando operativas 24/7.

---

## ⚙️ 8. Instalación y Configuración Local

### Requisitos Previos:
- **Python**: Version 3.11 o superior.
- **Node.js**: Version 18.0 o superior (con `npm`).
- **Azure CLI**: Para despliegue de infraestructura y ejecución remota.

### 1. Clonar el Repositorio:
```bash
git clone https://github.com/YeshuaChavez/cenepred-gestion-desastres-bi.git
cd cenepred-gestion-desastres-bi
```

### 2. Configurar Entorno Virtual de Python e Instalación de Dependencias:
```bash
# Crear entorno virtual
python -m venv venv

# Activar en Windows PowerShell
.\venv\Scripts\Activate.ps1

# Instalación de librerías
pip install --upgrade pip
pip install -r requirements.txt
pip install pytest ruff
```

### 3. Ejecución del Pipeline Medallón Localmente:
```bash
# Ejecutar todas las etapas del pipeline maestro (Bronze -> Silver -> QA -> Gold -> Export)
python data/pipelines/master_pipeline.py --stage all

# Generar el archivo realData.json sincronizado para la WebApp
python scripts/export_gold_to_webapp_json.py
```

### 4. Ejecución de Pruebas Unitarias y Calidad:
```bash
# Ejecutar la suite completa de 59 pruebas unitarias
python -m pytest tests/ -v

# Verificar linting y calidad de código con Ruff
python -m ruff check . --select F,E9
```

### 5. Iniciar la Aplicación Web Localmente:
```bash
cd apps/webapp
npm install
npm run dev
```
Accede a la aplicación en tu navegador ingresando a `http://localhost:3000`.

---

## ☁️ 9. Infraestructura en la Nube (Microsoft Azure & Terraform)

El proyecto utiliza **Terraform** para aprovisionar y gestionar la infraestructura como código (IaC) de forma repetible y segura:

- **Grupo de Recursos**: `rg-cenepred-dev`
- **Data Factory**: `adf-cenepred-dev` (Pipeline `adf_pipeline_etl_cenepred` y Trigger Diario `trigger_diario_cenepred`)
- **Data Lake Storage Gen2**: `stcenepreddev1` (Contenedores `/bronze`, `/silver`, `/gold`, `/synapsefs`)
- **Databricks Workspace**: `dbw-cenepred-dev`
- **Key Vault**: `kv-cenepred-dev1`
- **Azure OpenAI**: `oai-cenepred-dev`

### Despliegue de Infraestructura con Terraform:
```bash
cd infra/environments/prod
terraform init
terraform plan
terraform apply
```

---

## 🧪 10. Integración y Despliegue Continuo (CI/CD)

El repositorio cuenta con flujos de trabajo automatizados en **GitHub Actions** (`.github/workflows/azure_adf_ci_cd.yml`):
- **Calidad de Código y Pruebas**: Ejecución automatizada de Ruff y Pytest en cada Pull Request y Push a `main`.
- **Despliegue Automático en Azure**: Validación de plantillas ARM y despliegue del pipeline e infraestructura en Azure Data Factory mediante Azure Service Principal.

---

## 📄 11. Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para obtener más detalles.
