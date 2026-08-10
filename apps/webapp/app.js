/* ==========================================================================
   CENEPRED - SISTEMA DE ALERTA TEMPRANA DE RIESGO DINÁMICO
   Lógica JavaScript (ES6+)
   ========================================================================== */

// Base de datos de riesgo y explicación SHAP por departamento (Datos de Inferencia XGBoost)
const REGIONES_DATA = {
  "PIURA": { prob: 0.94, cluster: "Riesgo Muy Alto", shap: [
    { name: "Precipitación 7d (mm)", pct: 45, color: "#EF4444" },
    { name: "Anomalía Clima (Open-Meteo)", pct: 30, color: "#F59E0B" },
    { name: "Histórico Emergencias (SINPAD)", pct: 15, color: "#38BDF8" },
    { name: "Detección Focos Calor (FIRMS)", pct: 10, color: "#10B981" }
  ]},
  "APURIMAC": { prob: 0.88, cluster: "Riesgo Alto", shap: [
    { name: "Histórico Emergencias (SINPAD)", pct: 40, color: "#EF4444" },
    { name: "Focos de Calor Activos", pct: 35, color: "#F59E0B" },
    { name: "Racha Precipitación Reciente", pct: 15, color: "#38BDF8" },
    { name: "Actividad Sísmica 7d", pct: 10, color: "#10B981" }
  ]},
  "LIMA": { prob: 0.76, cluster: "Riesgo Alto", shap: [
    { name: "Densidad Poblacional Impactada", pct: 50, color: "#EF4444" },
    { name: "Lluvias en Cuenca Alta", pct: 25, color: "#F59E0B" },
    { name: "Histórico Huaycos / Desbordes", pct: 15, color: "#38BDF8" },
    { name: "Focos de Calor", pct: 10, color: "#10B981" }
  ]},
  "CUSCO": { prob: 0.65, cluster: "Riesgo Moderado", shap: [
    { name: "Incendios Forestales / Focos", pct: 45, color: "#F59E0B" },
    { name: "Heladas / Friajes", pct: 30, color: "#38BDF8" },
    { name: "Histórico Emergencias", pct: 15, color: "#10B981" },
    { name: "Precipitación Acumulada", pct: 10, color: "#818CF8" }
  ]},
  "AREQUIPA": { prob: 0.52, cluster: "Riesgo Moderado", shap: [
    { name: "Actividad Sísmica 7d (USGS)", pct: 40, color: "#F59E0B" },
    { name: "Precipitación Escasa / Sequías", pct: 30, color: "#38BDF8" },
    { name: "Focos de Calor", pct: 20, color: "#10B981" },
    { name: "Anomalía Térmica", pct: 10, color: "#818CF8" }
  ]},
  "MOQUEGUA": { prob: 0.32, cluster: "Riesgo Bajo", shap: [
    { name: "Baja Tasa Histórica Reciente", pct: 60, color: "#10B981" },
    { name: "Precipitación Normal", pct: 20, color: "#38BDF8" },
    { name: "Cero Focos Activos", pct: 12, color: "#818CF8" },
    { name: "Sin Anomalias Sísmicas", pct: 8, color: "#94A3B8" }
  ]},
  "TACNA": { prob: 0.24, cluster: "Riesgo Bajo", shap: [
    { name: "Monitoreo Estable", pct: 65, color: "#10B981" },
    { name: "Precipitación Bajo Promedio", pct: 20, color: "#38BDF8" },
    { name: "Bajo Registro SINPAD", pct: 15, color: "#94A3B8" }
  ]}
};

// URLs o configuraciones de los 5 Dashboards de Power BI
const DASHBOARDS_TITLES = {
  "monitoreo": "Dashboard 9.1 — Monitoreo Diario de Clima, Sismos y Focos de Calor",
  "historico": "Dashboard 9.2 — Histórico de Emergencias y Tendencias Multianuales (2012-2023)",
  "riesgo": "Dashboard 9.3 — Riesgo Dinámico Predictivo (XGBoost) y Explicabilidad SHAP",
  "comparativo": "Dashboard 9.4 — Comparativo Regional y Matriz Estacional (Heatmap)",
  "presupuesto": "Dashboard 9.5 — Impacto Socioeconómico y Ejecución Presupuestal MEF (PP 0068)"
};

document.addEventListener("DOMContentLoaded", () => {
  initRegionSelector();
  initTabs();
  initChatbot();
});

function initRegionSelector() {
  const select = document.getElementById("regionSelect");
  if (!select) return;

  // Llenar selector con regiones disponibles
  Object.keys(REGIONES_DATA).forEach(reg => {
    const opt = document.createElement("option");
    opt.value = reg;
    opt.textContent = reg;
    select.appendChild(opt);
  });

  select.addEventListener("change", (e) => {
    updateRegionPanel(e.target.value);
  });

  // Cargar por defecto la primera región (PIURA)
  updateRegionPanel("PIURA");
}

function updateRegionPanel(regionKey) {
  const data = REGIONES_DATA[regionKey] || REGIONES_DATA["PIURA"];
  
  // Actualizar prob y gauge
  const gaugeVal = document.getElementById("gaugeValue");
  const gaugeTag = document.getElementById("gaugeTag");
  const probPct = Math.round(data.prob * 100);

  gaugeVal.textContent = `${probPct}%`;

  if (probPct >= 70) {
    gaugeVal.style.color = "#EF4444";
    gaugeTag.className = "gauge-tag tag-high";
    gaugeTag.textContent = "ALTO RIESGO (🔴)";
  } else if (probPct >= 40) {
    gaugeVal.style.color = "#F59E0B";
    gaugeTag.className = "gauge-tag tag-medium";
    gaugeTag.textContent = "RIESGO MODERADO (🟡)";
  } else {
    gaugeVal.style.color = "#10B981";
    gaugeTag.className = "gauge-tag tag-low";
    gaugeTag.textContent = "RIESGO BAJO (🟢)";
  }

  // Renderizar Barras SHAP
  const shapContainer = document.getElementById("shapContainer");
  shapContainer.innerHTML = "";

  data.shap.forEach(item => {
    const div = document.createElement("div");
    div.className = "shap-item";
    div.innerHTML = `
      <div class="shap-label-row">
        <span>${item.name}</span>
        <span style="font-weight:600; color:${item.color}">${item.pct}%</span>
      </div>
      <div class="shap-bar-bg">
        <div class="shap-bar-fill" style="width: ${item.pct}%; background-color: ${item.color};"></div>
      </div>
    `;
    shapContainer.appendChild(div);
  });
}

function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const embedTitle = document.getElementById("embedTitle");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tabKey = btn.getAttribute("data-tab");
      if (embedTitle && DASHBOARDS_TITLES[tabKey]) {
        embedTitle.textContent = DASHBOARDS_TITLES[tabKey];
      }
    });
  });
}

function initChatbot() {
  const fab = document.getElementById("aiFab");
  const modal = document.getElementById("aiModal");
  const closeBtn = document.getElementById("closeChatBtn");
  const sendBtn = document.getElementById("sendChatBtn");
  const chatInput = document.getElementById("chatInput");
  const messagesContainer = document.getElementById("chatMessages");

  if (!fab || !modal) return;

  fab.addEventListener("click", () => {
    modal.classList.toggle("open");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
  });

  sendBtn.addEventListener("click", () => {
    sendMessage();
  });

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const text = chatInput.value.strip ? chatInput.value.strip() : chatInput.value.trim();
    if (!text) return;

    // Agregar mensaje del usuario
    appendMessage(text, "user");
    chatInput.value = "";

    // Simular respuesta del Asistente RAG CENEPRED
    setTimeout(() => {
      const response = generateAIResponse(text);
      appendMessage(response, "bot");
    }, 600);
  }

  function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();
    if (q.includes("piura") || q.includes("lluvias")) {
      return "Para Piura, el modelo XGBoost estima una probabilidad de riesgo del 94% (Alto Riesgo). La explicación SHAP indica que el 45% del riesgo se debe a la precipitación acumulada de 7d (Open-Meteo) y el 30% a la anomalía climática.";
    } else if (q.includes("apurimac") || q.includes("focos")) {
      return "Apurímac presenta una probabilidad de riesgo del 88%. Los factores SHAP determinantes son el historial de emergencias SINPAD (40%) y la concentración reciente de focos de calor detectados por satélite NASA FIRMS (35%).";
    } else if (q.includes("presupuesto") || q.includes("mef")) {
      return "En el Programa Presupuestal PP 0068 (PREVAED), el presupuesto ejecutado nacional asciende al 84.5% del PIM total asignado. Las regiones con mayor severidad histórica muestran un costo promedio de S/. 450 por persona afectada.";
    } else {
      return `Analizando la capa Gold del Lakehouse: la consulta sobre '${query}' muestra que el sistema actualiza diariamente los datos de Open-Meteo, sismos de USGS y focos de calor satelitales. ¿Deseas detalles sobre una región en particular?`;
    }
  }
}
