# Aplicación Web Final — CENEPRED SAT Riesgo Dinámico

Esta carpeta contiene la **aplicación web unificada (Portal Ejecutivo)** del Sistema de Alerta Temprana de CENEPRED, construida bajo el estándar **Vanilla HTML5 / CSS3 Dark Glassmorphism / JavaScript (ES6+)**.

---

## 🚀 Características de la Aplicación Web

1. **Header & Navigation Bar:** Estado de conexión en tiempo real a Azure Databricks SQL Warehouse Serverless (`dbw_cenepred_dev`).
2. **5 Dashboards Tab System:** Navegación fluida entre los 5 dashboards de Power BI:
   * 🌤️ *Monitoreo Diario*
   * 📈 *Histórico & Tendencias (2012-2023)*
   * 🤖 *Riesgo Predictivo (XGBoost) & Explicabilidad SHAP*
   * 📊 *Comparativo Regional (Heatmap)*
   * 💰 *Impacto Socioeconómico y Presupuestal MEF (PP 0068)*
3. **Panel Interactivo de Explicabilidad SHAP:**
   * Selector dinámico para las **25 regiones del Perú**.
   * Medidor de nivel de riesgo predictivo (Gauge Meter con etiquetas de riesgo ALTO 🔴, MODERADO 🟡, BAJO 🟢).
   * Desglose visual interactivo de los factores explicativos SHAP en porcentaje (Precipitación Open-Meteo, Focos de Calor NASA FIRMS, Sismos 7d USGS, Histórico INDECI SINPAD).
4. **Chatbot Conversacional RAG Flotante (Widget AI):**
   * Asistente virtual embebido en la esquina inferior derecha.
   * Responde preguntas en lenguaje natural traduciendo las explicaciones SHAP y datos del Lakehouse a un lenguaje comprensible para tomadores de decisión del SINAGERD.

---

## 💻 Ejecución Local

Para previsualizar la aplicación web localmente en cualquier navegador:

```bash
# Opción 1: Abrir directamente el archivo index.html en tu navegador
# C:\Users\yeshu\Documents\Inteligencia de Negocios\Proyecto\apps\webapp\index.html

# Opción 2: Usar un servidor HTTP simple con Python
cd "C:\Users\yeshu\Documents\Inteligencia de Negocios\Proyecto\apps\webapp"
python -m http.server 8000
```
Luego entra a `http://localhost:8000` en tu navegador.

---

## ☁️ Despliegue en Azure (Azure Static Web Apps)

La aplicación está lista para ser desplegada en **Azure Static Web Apps**:

1. En Azure Portal → Crear **Static Web App**.
2. Vincular el repositorio GitHub (`YeshuaChavez/cenepred-gestion-desastres-bi`).
3. App location: `apps/webapp`
4. Output location: `` (raíz de `apps/webapp`).
