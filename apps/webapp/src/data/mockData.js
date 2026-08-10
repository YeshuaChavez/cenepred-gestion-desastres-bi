export const PERU_REGIONS_DATA = {
  "PIURA": { prob: 0.94, cluster: "Riesgo Muy Alto", shap: [
    { name: "Precipitación Acumulada 7d (Open-Meteo)", pct: 45, color: "#EF4444" },
    { name: "Anomalía Climatológica vs Histórico", pct: 30, color: "#F59E0B" },
    { name: "Histórico Emergencias (INDECI SINPAD)", pct: 15, color: "#38BDF8" },
    { name: "Focos de Calor Satelitales (NASA FIRMS)", pct: 10, color: "#10B981" }
  ]},
  "APURIMAC": { prob: 0.88, cluster: "Riesgo Alto", shap: [
    { name: "Histórico Emergencias (SINPAD)", pct: 40, color: "#EF4444" },
    { name: "Focos de Calor Activos (FIRMS)", pct: 35, color: "#F59E0B" },
    { name: "Racha Precipitación Reciente", pct: 15, color: "#38BDF8" },
    { name: "Sismos Cercanos (USGS 7d)", pct: 10, color: "#10B981" }
  ]},
  "LIMA": { prob: 0.76, cluster: "Riesgo Alto", shap: [
    { name: "Vulnerabilidad Poblacional", pct: 50, color: "#EF4444" },
    { name: "Lluvias en Cuenca Alta", pct: 25, color: "#F59E0B" },
    { name: "Histórico de Huaycos / Desbordes", pct: 15, color: "#38BDF8" },
    { name: "Detección Focos de Calor", pct: 10, color: "#10B981" }
  ]},
  "CUSCO": { prob: 0.65, cluster: "Riesgo Moderado", shap: [
    { name: "Incendios Forestales / Focos", pct: 45, color: "#F59E0B" },
    { name: "Heladas / Friajes Estacionales", pct: 30, color: "#38BDF8" },
    { name: "Frecuencia Histórica SINPAD", pct: 15, color: "#10B981" },
    { name: "Precipitación Acumulada", pct: 10, color: "#818CF8" }
  ]},
  "AREQUIPA": { prob: 0.52, cluster: "Riesgo Moderado", shap: [
    { name: "Actividad Sísmica 7d (USGS)", pct: 40, color: "#F59E0B" },
    { name: "Secuencia de Lluvias Escasas", pct: 30, color: "#38BDF8" },
    { name: "Focos de Calor Activos", pct: 20, color: "#10B981" },
    { name: "Anomalía Térmica", pct: 10, color: "#818CF8" }
  ]},
  "MOQUEGUA": { prob: 0.32, cluster: "Riesgo Bajo", shap: [
    { name: "Baja Tasa Histórica Reciente", pct: 60, color: "#10B981" },
    { name: "Precipitación Normal", pct: 20, color: "#38BDF8" },
    { name: "Cero Focos Activos", pct: 12, color: "#818CF8" },
    { name: "Sin Anomalías Sísmicas", pct: 8, color: "#94A3B8" }
  ]},
  "TACNA": { prob: 0.24, cluster: "Riesgo Bajo", shap: [
    { name: "Monitoreo Estable", pct: 65, color: "#10B981" },
    { name: "Precipitación Bajo Promedio", pct: 20, color: "#38BDF8" },
    { name: "Bajo Registro SINPAD", pct: 15, color: "#94A3B8" }
  ]}
};

export const DASHBOARDS_METADATA = {
  monitoreo: {
    title: "Dashboard 9.1 — Monitoreo Diario de Clima, Sismos y Focos de Calor",
    badge: "Open-Meteo • USGS • NASA FIRMS",
    description: "Visualización activa en tiempo real del clima diario, sismos en los últimos 7 días y detecciones satelitales de focos de calor por departamento."
  },
  historico: {
    title: "Dashboard 9.2 — Histórico de Emergencias y Tendencias Multianuales (2012-2023)",
    badge: "INDECI SINPAD • DAX Time Intelligence",
    description: "Análisis temporal multianual con métricas YoY y YTD de personas afectadas, damnificadas y viviendas destruidas."
  },
  riesgo: {
    title: "Dashboard 9.3 — Riesgo Dinámico Predictivo (XGBoost) & Explicabilidad SHAP",
    badge: "Machine Learning • SHAP Explainability",
    description: "Mapa de probabilidad de riesgo estimado por el modelo XGBoost y desglose de los factores explicativos SHAP por región."
  },
  comparativo: {
    title: "Dashboard 9.4 — Comparativo Regional y Matriz Estacional (Heatmap)",
    badge: "Heatmap Región × Mes • Index Severity",
    description: "Matriz comparativa de la recurrencia estacional por departamento y ranking ponderado de severidad."
  },
  presupuesto: {
    title: "Dashboard 9.5 — Impacto Socioeconómico y Ejecución Presupuestal MEF (PP 0068)",
    badge: "MEF PREVAED • Daño vs Gasto",
    description: "Evaluación del Presupuesto PIM y Devengado en reducción de vulnerabilidad frente a las emergencias sufridas por región."
  }
};
