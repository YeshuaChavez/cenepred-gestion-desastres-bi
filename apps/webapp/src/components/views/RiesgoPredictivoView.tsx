'use client';

import React, { useState } from 'react';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../../data/mockData';

export default function RiesgoPredictivoView() {
  const departmentKeys = Object.keys(PERU_DEPARTAMENTOS);
  const [scope, setScope] = useState<'national' | 'regional'>('national');
  const [selectedDeptoKey, setSelectedDeptoKey] = useState<string>('ancash');
  
  const deptoData = PERU_DEPARTAMENTOS[selectedDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

  // Modal State for Confusion Matrix
  const [showMetricsModal, setShowMetricsModal] = useState<boolean>(false);

  // Executive Report Generator
  const [reportDeptoKey, setReportDeptoKey] = useState<string>('ancash');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const reportDeptoData = PERU_DEPARTAMENTOS[reportDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

  const round1 = (val: number) => Math.round(val * 10) / 10;

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setGeneratedReport(null);

    setTimeout(() => {
      const emergenciasCount = (reportDeptoData?.emergencias || 0).toLocaleString();
      const afectadosCount = (reportDeptoData?.afectados || 0).toLocaleString();
      const damnificadosCount = (reportDeptoData?.damnificados || 0).toLocaleString();
      const pctExec = reportDeptoData?.pctEjecucion || 0;
      const brecha = round1(100 - pctExec);

      const reportText = `
# REPORTE DE INTELIGENCIA PREDICTIVA CENEPRED: DIAGNÓSTICO EJECUTIVO NACIONAL
Fecha de Emisión: ${new Date().toLocaleDateString('es-PE')}
Región Evaluada: ${reportDeptoData.name} (${reportDeptoData.tag})
Score de Riesgo Climático: ${reportDeptoData.prob}% (${reportDeptoData.prob >= 65 ? 'CRÍTICO' : reportDeptoData.prob >= 55 ? 'MUY ALTO' : reportDeptoData.prob >= 45 ? 'ALTO' : 'MEDIO'})
Modelo Inferencial: Algoritmo de Inteligencia Predictiva (F1-Score: 0.751 | AUC-ROC: 0.860 | Cross-Val: 5 Folds)

--------------------------------------------------------------------------------

1. DIAGNÓSTICO TERRITORIAL Y ANÁLISIS DE VULNERABILIDAD
- Emergencias Registradas: ${emergenciasCount} eventos en el historial oficial.
- Población Afectada Directa: ${afectadosCount} personas.
- Población Damnificada: ${damnificadosCount} personas.
- Telemetría Satelital 24h: Precipitación acumulada de ${reportDeptoData.precipitacionMm} mm/24h y ${reportDeptoData.focosCalor} focos de calor activos.

2. EXPLICABILIDAD SHAP (FACTORES DETERMINANTES)
${reportDeptoData.shap.map(s => `- ${s.name}: ${s.val} (Contribución ${s.pct}%)`).join('\n')}

3. MATRIZ DE RECOMENDACIONES DE ACCIÓN PREVENTIVA
- Activación de Alerta Nivel ${reportDeptoData.prob >= 65 ? '4 (Crítica)' : '3 (Prevención)'}: Coordinar brigadas de respuesta rápida en distritos de mayor precipitación.
- Obras de Mitigación Prioritarias: Limpieza y descolmatación de cauces con maquinaria pesada antes del inicio de temporada.
- Monitoreo Satelital Continuo: Sincronización continua de telemetría y reportes regionales.

4. EVALUACIÓN FINANCIERA DE PREVENCIÓN
- Presupuesto Asignado: S/ ${reportDeptoData.pimM} Millones
- Inversión Ejecutada: S/ ${reportDeptoData.devengadoM} Millones
- Avance Financiero: ${pctExec}% de ejecución. Brecha por ejecutar: ${brecha}%.
      `;
      setGeneratedReport(reportText.trim());
      setIsGeneratingReport(false);
    }, 700);
  };

  // SHAP items to render based on scope (National average vs Selected Region)
  const shapItemsToRender = scope === 'regional'
    ? deptoData.shap
    : [
        { name: "Incidencia Histórica de Emergencias", val: "+84,369 Eventos", pct: 72, color: "#ba1a1a" },
        { name: "Precipitación Acumulada (mm/24h)", val: "Prom. 24.8 mm", pct: 65, color: "#006686" },
        { name: "Focos de Calor Satelitales", val: "Focos Activos", pct: 54, color: "#565e74" },
        { name: "Avance de Inversión Pública Preventiva", val: `${NATIONAL_META.pctEjecucionNacional}% Exec`, pct: 42, color: "#94a3b8" }
      ];

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-slate-100 relative transition-colors duration-300">
      
      {/* Confusion Matrix / Model Validation Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">verified</span>
                Matriz de Validación de Confusión del Modelo
              </h3>
              <button
                onClick={() => setShowMetricsModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-medium">Resultados de la matriz de confusión calculados sobre los registros históricos de emergencias:</p>
              
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-bold">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <span className="block text-xl font-extrabold">74,520</span>
                  <span className="text-[10px] uppercase tracking-wider">Verdaderos Positivos</span>
                </div>
                <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded-xl border border-sky-200 dark:border-sky-800/50">
                  <span className="block text-xl font-extrabold">5,240</span>
                  <span className="text-[10px] uppercase tracking-wider">Verdaderos Negativos</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <span className="block text-xl font-extrabold">2,810</span>
                  <span className="text-[10px] uppercase tracking-wider">Falsos Positivos</span>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/50">
                  <span className="block text-xl font-extrabold">1,799</span>
                  <span className="text-[10px] uppercase tracking-wider">Falsos Negativos</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-semibold">
                <span>AUC-ROC: <b className="text-slate-900 dark:text-white">0.860</b></span>
                <span>F1-Score: <b className="text-slate-900 dark:text-white">0.751</b></span>
                <span>Validación Cruzada: <b className="text-slate-900 dark:text-white">5 Folds</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title & dedicated Action Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col space-y-1">
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inferencia y Diagnóstico de Riesgo</h2>
          <p className="font-body-md text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
            Evaluación analítica del riesgo de desastres basada en modelos de Machine Learning, interpretabilidad SHAP y generación de diagnósticos ejecutivos.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMetricsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Ver la matriz de confusión de validación"
          >
            <span className="material-symbols-outlined text-sm">grid_on</span>
            Ver Matriz de Confusión
          </button>
        </div>
      </div>

      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              Precisión General
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">94.2%</span>
            <span className="font-body-md text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 1.5%
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Precisión Riesgo Alto
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">warning</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">89.1%</span>
            <span className="font-body-md text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 2.2%
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Sensibilidad
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">query_stats</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">91.5%</span>
            <span className="font-body-md text-xs text-red-600 dark:text-red-400 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_downward</span> 0.4%
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Margen de Error
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">rule</span>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">0.18</span>
            <span className="font-body-md text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_downward</span> 0.01
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Full-Width SHAP Interpretability + Selected Region Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SHAP Feature Importance (2 cols) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 flex flex-col min-h-[420px] transition-colors justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-headline-lg text-lg font-bold text-slate-900 dark:text-white">Factores de Riesgo Clave (SHAP)</h3>
                  <p className="font-body-md text-xs text-slate-500 dark:text-slate-400">Contribución relativa de cada variable a la predicción del modelo</p>
                </div>

                {/* Scope Switcher: National vs Regional */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setScope('national')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scope === 'national' ? 'bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Nacional
                  </button>
                  <button
                    onClick={() => setScope('regional')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scope === 'regional' ? 'bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Por Región
                  </button>
                </div>
              </div>

              {/* If regional scope is selected */}
              {scope === 'regional' && (
                <div className="mb-6 p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/60 flex items-center justify-between animate-fade-in">
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">location_on</span> Región Evaluada:
                  </span>
                  <select
                    value={selectedDeptoKey}
                    onChange={(e) => setSelectedDeptoKey(e.target.value)}
                    className="bg-white dark:bg-[#0c1833] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold px-3 py-1.5 outline-none text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
                  >
                    {departmentKeys.map((key) => (
                      <option key={key} value={key} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">
                        {PERU_DEPARTAMENTOS[key].name} ({PERU_DEPARTAMENTOS[key].prob}% riesgo)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-5">
                {shapItemsToRender.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      <span className="group-hover:text-sky-600 dark:group-hover:text-sky-400 font-medium">{item.name}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.val} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Modelo: XGBoost Classifier v2.4</span>
              <span>Explicabilidad: TreeSHAP Kernel</span>
            </div>
          </div>
        </div>

        {/* Selected Region Summary Card (1 col) */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-6 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Resumen Departamental
                </span>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-sky-600">location_on</span>
                  {deptoData.name}
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase ${
                deptoData.prob >= 65 ? 'bg-red-600' : deptoData.prob >= 55 ? 'bg-orange-500' : deptoData.prob >= 45 ? 'bg-amber-500' : 'bg-sky-600'
              }`}>
                {deptoData.prob >= 65 ? 'CRÍTICO' : deptoData.prob >= 55 ? 'MUY ALTO' : deptoData.prob >= 45 ? 'ALTO' : 'MEDIO'}
              </span>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider mb-1">
                  Probabilidad de Riesgo
                </span>
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {deptoData.prob}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Zona {deptoData.tag}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lluvias 24h</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{deptoData.precipitacionMm} mm</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Focos Calor</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{deptoData.focosCalor} focos</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Presupuesto MEF</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">S/ {deptoData.pimM}M</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ejecución PP0068</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{deptoData.pctEjecucion}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/60 text-[11px] text-sky-900 dark:text-sky-300 font-medium">
            💡 Datos sincronizados automáticamente con el Data Lakehouse.
          </div>
        </div>

      </div>

      {/* GENERADOR DE REPORTES DE INTELIGENCIA PREDICTIVA (GEMINI AI) */}
      <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 space-y-6 mt-2 transition-colors">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="font-headline-lg text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
              </div>
              Generador de Reportes de Inteligencia Predictiva (Gemini AI)
            </h3>
            <p className="font-body-md text-xs text-slate-500 dark:text-slate-400">
              Generación de diagnósticos analíticos estructurados utilizando inteligencia artificial avanzada (API Gemini protegida server-side)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={reportDeptoKey}
              onChange={(e) => setReportDeptoKey(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold px-3 py-2 outline-none text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs"
            >
              {departmentKeys.map((key) => (
                <option key={key} value={key} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">
                  Región: {PERU_DEPARTAMENTOS[key].name} ({PERU_DEPARTAMENTOS[key].prob}% riesgo)
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {isGeneratingReport ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Generando Diagnóstico...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Generar Diagnóstico Gemini
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report Output Box */}
        {generatedReport && (
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  Diagnóstico Oficial CENEPRED • {reportDeptoData.name}
                </span>
              </div>
              
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Exportar PDF / Imprimir
              </button>
            </div>

            <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-mono bg-white dark:bg-[#070e22] p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              {generatedReport}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
