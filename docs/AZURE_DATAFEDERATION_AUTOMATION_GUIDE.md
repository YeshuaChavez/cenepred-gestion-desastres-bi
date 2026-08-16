# ⚙️ GUÍA DE AUTOMATIZACIÓN E2E CON AZURE DATA FACTORY (ADF) & MEDALLION ETL

Esta guía documenta la arquitectura automatizada del proyecto de Inteligencia de Negocios para **CENEPRED**, utilizando **Azure Data Factory (ADF)**, **Azure Data Lake Storage Gen2 (ADLS Gen2)**, **Terraform** y **GitHub Actions**.

---

## 📐 1. Estructura de la Canalización Medallón

El flujo procesa diariamente los datos en 4 capas secuenciales:

```
[Fuentes de Datos]
  ├── SINPAD / INDECI (Emergencias)
  ├── MEF PP 0068 (Presupuesto)
  ├── NASA FIRMS (Focos de Calor)
  ├── NOAA ONI (El Niño SST)
  ├── Open-Meteo (Telemetría Lluvia/Temp)
  └── USGS (Terremotos/Sismicidad)
         │
         ▼
[1. Bronze Layer]  ---> Storage: adls://bronze/ (JSON / CSV crudos)
         │
         ▼
[2. Silver Layer]  ---> Storage: adls://silver/ (Limpieza, Deduplicación, QA Quality Checks)
         │
         ▼
[3. Gold Layer]    ---> Storage: adls://gold/ (Modelo Estrella Star Schema - Parquet/JSON)
         │
         ▼
[4. Publicación]   ---> Exportador JSON (apps/webapp/src/data/realData.json) + Power BI Dashboard
```

---

## 🛠️ 2. Ejecución Local del Pipeline Orquestador Master

Para ejecutar manualmente todo el proceso de ingesta, limpieza, validación de calidad y modelado dimensional en un solo comando:

```bash
# Iniciar sesión y ejecutar orquestador master
python data/pipelines/master_pipeline.py
```

### Salida Esperada:
```text
================================================================================
🔥 CENEPRED BI DATA PIPELINE — EJECUCIÓN AUTOMATIZADA MASTER 🔥
================================================================================

--- 1. INGESTA BRONZE ---
✅ Bronze: Ingesta INDECI/SINPAD completado con éxito.
✅ Bronze: Ingesta NASA FIRMS completado con éxito.
✅ Bronze: Ingesta NOAA ONI completado with éxito.
✅ Bronze: Ingesta Open-Meteo completado con éxito.
✅ Bronze: Ingesta USGS completado con éxito.
✅ Bronze: Ingesta INEI Límites completado con éxito.

--- 2. TRANSFORMACIÓN & LIMPIEZA SILVER ---
✅ Silver: Limpieza INDECI completado con éxito.
✅ Silver: Limpieza MEF PP 0068 completado con éxito.
✅ Silver: Limpieza NASA FIRMS completado con éxito.
✅ Silver: Limpieza NOAA ONI completado con éxito.
✅ Silver: Limpieza Open-Meteo completado con éxito.
✅ Silver: Limpieza USGS completado con éxito.
✅ Silver QA: Control de Calidad de Datos completado con éxito.

--- 3. MODELADO GOLD (STAR SCHEMA) ---
✅ Gold: Dimensión Región completado con éxito.
✅ Gold: Dimensión Tiempo completado con éxito.
✅ Gold: Dimensión Fenómeno completado con éxito.
✅ Gold: Hechos Emergencias SINPAD completado con éxito.
✅ Gold: Hechos Gasto PREVAED MEF completado con éxito.
✅ Gold: Hechos Monitoreo Diario Satelital completado con éxito.

--- 4. PUBLICACIÓN WEBAPP & POWER BI ---
✅ Export: Consolidado Gold a WebApp JSON completado con éxito.

================================================================================
🎉 PIPELINE AUTOMATIZADO COMPLETADO CON ÉXITO CERO ERRORES 🎉
================================================================================
```

---

## ☁️ 3. Configuración del Pipeline en Azure Data Factory (ADF)

1. **Ingresar a Azure Data Factory Studio**:
   - URL: [adf.azure.com](https://adf.azure.com)
   - Seleccionar el Data Factory `adf-cenepred-prod`.

2. **Importar el Pipeline JSON**:
   - Ir a la pestaña **Author (Lápiz)** > **Pipelines** > **+** > **Import Pipeline Template**.
   - Cargar el archivo `infra/azure_data_factory/adf_pipeline_etl_cenepred.json`.

3. **Configurar el Scheduled Trigger**:
   - Ir a **Triggers** > **+ New/Edit**.
   - Tipo: **Schedule**.
   - Recurrencia: **Diaria a las 02:00 UTC** (07:00 p.m. hora de Lima).
   - Estado: **Activated**.

---

## 🚀 4. Despliegue de Infraestructura con Terraform

Para desplegar los contenedores de almacenamiento ADLS Gen2, Azure Data Factory y Key Vault automáticamente:

```bash
cd infra/environments/prod

# 1. Inicializar Terraform
terraform init

# 2. Planificar cambios
terraform plan

# 3. Aplicar infraestructura en Azure
terraform apply -auto-approve
```

---

## 🔄 5. Monitoreo y Diagnóstico

- **Azure Monitor Alerts**: Se encuentra configurado para enviar alertas por correo si alguna actividad en ADF expira o falla.
- **Data Factory Monitoring**: Puedes inspeccionar las métricas de rendimiento y logs en la pestaña **Monitor** de Azure Data Factory.
