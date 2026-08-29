'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PERU_DEPARTAMENTOS } from '../../data/mockData';
import regionFeaturesData from '../../data/regionFeatures.json';
import { loadModel, predictProba, FeatureVector } from '../../lib/xgbModel';

const REGION_FEATURES = regionFeaturesData as Record<string, FeatureVector>;

// Features del modelo que el usuario puede ajustar en el simulador (las demás -temp_min,
// tasa histórica, ONI, ventanas recientes- se toman del contexto real de la región).
const SIM_FIELDS = [
  { key: 'precipitacion_mm', label: 'Precipitación 24h', unit: 'mm', min: 0, max: 200, step: 1 },
  { key: 'precipitacion_acumulada_15d', label: 'Precipitación 15 días', unit: 'mm', min: 0, max: 600, step: 5 },
  { key: 'temp_max', label: 'Temperatura máxima', unit: '°C', min: 0, max: 45, step: 0.5 },
  { key: 'temp_min', label: 'Temperatura mínima', unit: '°C', min: -10, max: 30, step: 0.5 },
  { key: 'num_sismos_7d', label: 'Sismos (7 días)', unit: '', min: 0, max: 15, step: 1 },
  { key: 'magnitud_max_7d', label: 'Magnitud máx (7d)', unit: '', min: 0, max: 8, step: 0.1 },
  { key: 'num_focos_calor_activos', label: 'Focos de calor', unit: '', min: 0, max: 1000, step: 5 },
  { key: 'oni', label: 'Índice El Niño (ONI)', unit: '', min: -2.5, max: 3, step: 0.1 },
];

// Mapa localizador (Leaflet) cargado solo en cliente (usa window).
const RegionLocatorMap = dynamic(() => import('../RegionLocatorMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Cargando mapa…</div>,
});

// Coordenadas y región natural por departamento (capa Gold, dim_region). Se usan para el
// mapa localizador de la región. Claves sin tildes en mayúsculas.
const REGION_GEO: Record<string, { lat: number; lng: number; reg: string }> = {
  'AMAZONAS': { lat: -6.232, lng: -77.869, reg: 'Sierra' },
  'ANCASH': { lat: -9.526, lng: -77.529, reg: 'Sierra' },
  'APURIMAC': { lat: -13.634, lng: -72.884, reg: 'Sierra' },
  'AREQUIPA': { lat: -16.399, lng: -71.537, reg: 'Sierra' },
  'AYACUCHO': { lat: -13.164, lng: -74.223, reg: 'Sierra' },
  'CAJAMARCA': { lat: -7.164, lng: -78.5, reg: 'Sierra' },
  'CALLAO': { lat: -12.052, lng: -77.135, reg: 'Costa' },
  'CUSCO': { lat: -13.532, lng: -71.967, reg: 'Sierra' },
  'HUANCAVELICA': { lat: -12.787, lng: -74.973, reg: 'Sierra' },
  'HUANUCO': { lat: -9.929, lng: -76.24, reg: 'Sierra' },
  'ICA': { lat: -14.075, lng: -75.734, reg: 'Costa' },
  'JUNIN': { lat: -12.069, lng: -75.21, reg: 'Sierra' },
  'LA LIBERTAD': { lat: -8.116, lng: -79.03, reg: 'Sierra' },
  'LAMBAYEQUE': { lat: -6.77, lng: -79.855, reg: 'Costa' },
  'LIMA': { lat: -12.043, lng: -77.028, reg: 'Costa' },
  'LORETO': { lat: -3.748, lng: -73.253, reg: 'Selva' },
  'MADRE DE DIOS': { lat: -12.589, lng: -69.199, reg: 'Selva' },
  'MOQUEGUA': { lat: -17.197, lng: -70.936, reg: 'Sierra' },
  'PASCO': { lat: -10.666, lng: -76.253, reg: 'Sierra' },
  'PIURA': { lat: -5.182, lng: -80.657, reg: 'Costa' },
  'PUNO': { lat: -15.84, lng: -70.022, reg: 'Sierra' },
  'SAN MARTIN': { lat: -6.034, lng: -76.974, reg: 'Selva' },
  'TACNA': { lat: -18.015, lng: -70.254, reg: 'Sierra' },
  'TUMBES': { lat: -3.556, lng: -80.443, reg: 'Costa' },
  'UCAYALI': { lat: -8.379, lng: -74.554, reg: 'Selva' },
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

// Nivel de riesgo y color a partir de la probabilidad.
const riskLevel = (p: number) =>
  p >= 65 ? { label: 'CRÍTICO', color: '#dc2626' } :
  p >= 55 ? { label: 'MUY ALTO', color: '#ea580c' } :
  p >= 45 ? { label: 'ALTO', color: '#d97706' } :
  { label: 'MEDIO', color: '#0284c7' };

// Render ligero de Markdown (encabezados, viñetas, negrita, párrafos) para el diagnóstico.
function DiagnosticoRender({ text }: { text: string }) {
  type Block = { type: 'h' | 'p'; text: string; num?: string } | { type: 'ul'; items: string[] };
  const blocks: Block[] = [];
  let list: string[] | null = null;
  const flush = () => { if (list) { blocks.push({ type: 'ul', items: list }); list = null; } };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^#{1,6}\s+(.*)/))) { flush(); blocks.push({ type: 'h', text: m[1] }); continue; }
    if ((m = line.match(/^\*\*(\d+)[).]?\s*(.+?)\*\*:?$/))) { flush(); blocks.push({ type: 'h', text: m[2], num: m[1] }); continue; }
    if ((m = line.match(/^(\d+)[).]\s+(.*)/)) && m[2].length < 90) { flush(); blocks.push({ type: 'h', text: m[2].replace(/\*\*/g, ''), num: m[1] }); continue; }
    if ((m = line.match(/^[-*•]\s+(.*)/))) { if (!list) list = []; list.push(m[1]); continue; }
    flush(); blocks.push({ type: 'p', text: line });
  }
  flush();
  const inline = (t: string) =>
    t.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} className="font-bold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{p}</React.Fragment>);
  return (
    <div className="space-y-3.5">
      {blocks.map((b, i) =>
        b.type === 'h' ? (
          <h4 key={i} className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white pt-1">
            {b.num && <span className="flex items-center justify-center w-5 h-5 rounded-md bg-sky-600 text-white text-[10px] font-extrabold shrink-0">{b.num}</span>}
            <span>{inline(b.text)}</span>
          </h4>
        ) : b.type === 'ul' ? (
          <ul key={i} className="space-y-1.5 pl-1">
            {b.items.map((it, j) => (
              <li key={j} className="flex items-start gap-2 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="material-symbols-outlined text-sky-500 dark:text-sky-400 text-sm mt-0.5 shrink-0">chevron_right</span>
                <span>{inline(it)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">{inline(b.text)}</p>
        )
      )}
    </div>
  );
}

const MODEL_METRICS = [
  { label: 'Precisión General', value: '76.9%', icon: 'verified', color: 'sky', meta: 'Exactitud sobre el test 2021-2023' },
  { label: 'Sensibilidad (Recall)', value: '84.5%', icon: 'query_stats', color: 'emerald', meta: 'Meta ≥ 70% · cumplida' },
  { label: 'F1-Score', value: '0.751', icon: 'balance', color: 'purple', meta: 'Meta ≥ 0.75 · cumplida' },
  { label: 'AUC-ROC', value: '0.860', icon: 'insights', color: 'amber', meta: 'Meta ≥ 0.80 · cumplida' },
];
const COLOR_MAP: Record<string, string> = {
  sky: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 group-hover:bg-sky-600',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600',
  purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 group-hover:bg-purple-600',
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 group-hover:bg-amber-600',
};
const HOVER_BORDER: Record<string, string> = {
  sky: 'hover:border-sky-400 dark:hover:border-sky-400', emerald: 'hover:border-emerald-400 dark:hover:border-emerald-400', purple: 'hover:border-purple-400 dark:hover:border-purple-400', amber: 'hover:border-amber-400 dark:hover:border-amber-400',
};
const TEXT_COLOR: Record<string, string> = {
  sky: 'text-sky-600 dark:text-sky-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  purple: 'text-purple-600 dark:text-purple-400',
  amber: 'text-amber-600 dark:text-amber-400',
};

const MESES_SIM = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function RiesgoPredictivoView() {
  const departmentKeys = Object.keys(PERU_DEPARTAMENTOS);
  const [scope, setScope] = useState<'national' | 'regional'>('national');
  const [selectedDeptoKey, setSelectedDeptoKey] = useState<string>('ancash');
  const deptoData = PERU_DEPARTAMENTOS[selectedDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

  const [showMetricsModal, setShowMetricsModal] = useState<boolean>(false);

  // Generador de diagnóstico
  const [reportDeptoKey, setReportDeptoKey] = useState<string>('ancash');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const reportDeptoData = PERU_DEPARTAMENTOS[reportDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

  // Simulador de riesgo por características
  // Simulador: usa el modelo XGBoost real. El vector base es el contexto real de la región
  // (14 features); el usuario ajusta un subconjunto y el resto se toma del contexto.
  const modelFeats: FeatureVector = REGION_FEATURES[norm(deptoData.name)] || {};
  const seedVals = () => {
    const v: Record<string, number> = {};
    SIM_FIELDS.forEach((f) => { v[f.key] = Number(modelFeats[f.key] ?? 0); });
    return v;
  };
  const [simVals, setSimVals] = useState<Record<string, number>>(seedVals);
  const [simMes, setSimMes] = useState<number>(Number(modelFeats.mes ?? new Date().getMonth() + 1));
  const [simResult, setSimResult] = useState<{ prob: number } | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [simError, setSimError] = useState<boolean>(false);
  const [displayProb, setDisplayProb] = useState<number>(0); // % animado (count-up)

  // Anima el % del resultado de 0 al valor predicho (easeOutCubic).
  useEffect(() => {
    if (!simResult) { setDisplayProb(0); return; }
    const target = simResult.prob;
    const dur = 900;
    let raf = 0;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / dur);
      setDisplayProb(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // Garantiza el valor final aunque rAF esté pausado (pestaña en segundo plano).
    const fallback = setTimeout(() => setDisplayProb(target), dur + 150);
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [simResult]);

  // Reseed cuando cambia la región seleccionada.
  useEffect(() => {
    setSimVals(seedVals());
    setSimMes(Number(modelFeats.mes ?? new Date().getMonth() + 1));
    setSimResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeptoKey]);

  const cargarValoresReales = () => {
    setSimVals(seedVals());
    setSimMes(Number(modelFeats.mes ?? new Date().getMonth() + 1));
    setSimResult(null);
  };

  const predecirConModelo = async () => {
    setSimLoading(true);
    setSimError(false);
    try {
      const model = await loadModel();
      const fv: FeatureVector = { ...modelFeats, ...simVals, mes: simMes };
      setSimResult({ prob: Math.round(predictProba(model, fv) * 100) });
    } catch {
      setSimError(true);
    } finally {
      setSimLoading(false);
    }
  };

  const geo = REGION_GEO[norm(deptoData.name)];
  const rl = riskLevel(deptoData.prob);

  // SHAP: regional usa los factores reales de la región; nacional = promedio real de todas.
  const nationalShap = deptoData.shap.map((_, i) => {
    const pcts = departmentKeys.map((k) => PERU_DEPARTAMENTOS[k].shap[i]?.pct ?? 0);
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
    const ref = PERU_DEPARTAMENTOS[departmentKeys[0]].shap[i];
    return { name: ref.name, val: 'Promedio nacional', pct: avg, color: ref.color };
  });
  const shapItemsToRender = scope === 'regional' ? deptoData.shap : nationalShap;

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setGeneratedReport(null);
    setReportError(null);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reportDeptoData.name, tag: reportDeptoData.tag, prob: reportDeptoData.prob,
          emergencias: reportDeptoData.emergencias, afectados: reportDeptoData.afectados,
          damnificados: reportDeptoData.damnificados, precipitacionMm: reportDeptoData.precipitacionMm,
          focosCalor: reportDeptoData.focosCalor, sismos7d: reportDeptoData.sismos7d,
          shap: reportDeptoData.shap, pimM: reportDeptoData.pimM,
          devengadoM: reportDeptoData.devengadoM, pctEjecucion: reportDeptoData.pctEjecucion,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.report) setGeneratedReport(data.report);
      else setReportError('El servicio de diagnóstico con IA no está disponible en este momento. El resto de la plataforma sigue operativa; vuelve a intentarlo más tarde.');
    } catch {
      setReportError('El servicio de diagnóstico con IA no está disponible en este momento. El resto de la plataforma sigue operativa; vuelve a intentarlo más tarde.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-slate-100 relative transition-colors duration-300">

      {/* Confusion Matrix Modal */}
      {showMetricsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">verified</span>
                Matriz de Validación de Confusión del Modelo
              </h3>
              <button onClick={() => setShowMetricsModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-medium">Resultados sobre el conjunto de prueba (2021-2023, 27,375 registros región-día):</p>
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-bold">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <span className="block text-xl font-extrabold">9,531</span><span className="text-[10px] uppercase tracking-wider">Verdaderos Positivos</span>
                </div>
                <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded-xl border border-sky-200 dark:border-sky-800/50">
                  <span className="block text-xl font-extrabold">11,530</span><span className="text-[10px] uppercase tracking-wider">Verdaderos Negativos</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <span className="block text-xl font-extrabold">4,563</span><span className="text-[10px] uppercase tracking-wider">Falsos Positivos</span>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-800/50">
                  <span className="block text-xl font-extrabold">1,751</span><span className="text-[10px] uppercase tracking-wider">Falsos Negativos</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between font-semibold">
                <span>AUC-ROC: <b className="text-slate-900 dark:text-white">0.860</b></span>
                <span>F1-Score: <b className="text-slate-900 dark:text-white">0.751</b></span>
                <span>Validación: <b className="text-slate-900 dark:text-white">Split temporal 2012-20 / 21-23</b></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col space-y-1">
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Inferencia y Diagnóstico de Riesgo</h2>
          <p className="font-body-md text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
            Evaluación del riesgo de desastres por región, con los factores que lo explican, un simulador de escenarios y diagnósticos ejecutivos.
          </p>
        </div>
        <button onClick={() => setShowMetricsModal(true)} className="flex items-center gap-2 px-4 py-2 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0" title="Ver la matriz de confusión de validación">
          <span className="material-symbols-outlined text-sm">grid_on</span>
          Ver Matriz de Confusión
        </button>
      </div>

      {/* Model metric cards (REAL, from the confusion matrix) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {MODEL_METRICS.map((m, i) => (
          <div key={m.label} style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }} className={`bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 ${HOVER_BORDER[m.color]} hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col gap-3 animate-fade-in-up`}>
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">{m.label}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:text-white group-hover:scale-110 ${COLOR_MAP[m.color]}`}>
                <span className="material-symbols-outlined text-base">{m.icon}</span>
              </div>
            </div>
            <div>
              <span className={`font-display-lg text-3xl font-extrabold ${TEXT_COLOR[m.color]}`}>{m.value}</span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1">{m.meta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid: factors (2 cols) + region detail with locator map (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Factores de Riesgo Clave */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-headline-lg text-lg font-bold text-slate-900 dark:text-white">Factores de Riesgo Clave</h3>
              <p className="font-body-md text-xs text-slate-500 dark:text-slate-400">Contribución relativa de cada variable al nivel de riesgo estimado</p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setScope('national')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${scope === 'national' ? 'bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Nacional</button>
              <button onClick={() => setScope('regional')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${scope === 'regional' ? 'bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Por Región</button>
            </div>
          </div>

          {scope === 'regional' && (
            <div className="mb-6 p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/60 flex items-center justify-between animate-fade-in">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">location_on</span> Región Evaluada:
              </span>
              <select value={selectedDeptoKey} onChange={(e) => { setSelectedDeptoKey(e.target.value); setSimResult(null); }} className="bg-white dark:bg-[#0c1833] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold px-3 py-1.5 outline-none text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs">
                {departmentKeys.map((key) => (
                  <option key={key} value={key} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">{PERU_DEPARTAMENTOS[key].name} ({PERU_DEPARTAMENTOS[key].prob}% riesgo)</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center gap-6 min-h-0 py-2">
            {shapItemsToRender.map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  <span className="group-hover:text-sky-600 dark:group-hover:text-sky-400 font-medium">{item.name}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.val} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>

          {(() => {
            const top = [...shapItemsToRender].sort((a, b) => b.pct - a.pct)[0];
            return (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-slate-50 dark:from-sky-950/30 dark:to-slate-900/40 border border-sky-100 dark:border-sky-900/50 flex items-start gap-3">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-lg mt-0.5 shrink-0">lightbulb</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <b className="text-slate-900 dark:text-white">{top.name}</b> es el factor de mayor peso ({top.pct}%) en {scope === 'national' ? 'el promedio nacional de los 25 departamentos' : `el riesgo estimado de ${deptoData.name}`}. Reducir su exposición es la palanca más efectiva para bajar el nivel de riesgo.
                </p>
              </div>
            );
          })()}

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>{scope === 'national' ? 'Promedio de los 25 departamentos' : `Región: ${deptoData.name}`}</span>
            <span>Factores explicativos del modelo</span>
          </div>
        </div>

        {/* Region detail with locator map */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-5 transition-colors">
          {/* Locator map (Leaflet, real Peru tiles) */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-[210px] bg-slate-100 dark:bg-slate-900">
            <div className="absolute top-2 left-3 z-[1000] pointer-events-none flex flex-col items-start gap-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white/85 dark:bg-slate-900/85 px-1.5 py-0.5 rounded">Ubicación</span>
              {geo && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/85 dark:bg-slate-900/85 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">{geo.reg}</span>}
            </div>
            {geo && <RegionLocatorMap lat={geo.lat} lng={geo.lng} name={deptoData.name} color={rl.color} />}
          </div>

          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Resumen Departamental</span>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <span className="material-symbols-outlined text-sky-600">location_on</span>{deptoData.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase" style={{ backgroundColor: rl.color }}>{rl.label}</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider mb-1">Probabilidad de Riesgo</span>
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{deptoData.prob}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Zona {deptoData.tag}</span>
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
      </div>

      {/* Simulador de riesgo por características */}
      <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="space-y-1">
            <h3 className="font-headline-lg text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">tune</span>
              </div>
              Simulador de Riesgo por Características
            </h3>
            <p className="font-body-md text-xs text-slate-500 dark:text-slate-400">Ajusta las condiciones y el <b className="text-slate-700 dark:text-slate-300">modelo predictivo entrenado</b> calcula el riesgo a 7 días para la región (el resto del contexto se toma de sus datos reales).</p>
          </div>
          <button onClick={cargarValoresReales} className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0">
            <span className="material-symbols-outlined text-sm">restart_alt</span> Cargar valores reales de {deptoData.name}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {SIM_FIELDS.map((c) => (
              <div key={c.key}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">{c.label}</label>
                  <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300 tabular-nums">{simVals[c.key] ?? 0}{c.unit && ` ${c.unit}`}</span>
                </div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={simVals[c.key] ?? 0} onChange={(e) => { setSimVals((s) => ({ ...s, [c.key]: Number(e.target.value) })); setSimResult(null); }} className="w-full accent-sky-600 dark:accent-sky-400 cursor-pointer" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1.5">Mes del año</label>
              <select value={simMes} onChange={(e) => { setSimMes(Number(e.target.value)); setSimResult(null); }} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold px-3 py-2 outline-none text-slate-800 dark:text-slate-200 cursor-pointer">
                {MESES_SIM.map((mes, i) => <option key={i} value={i + 1} className="bg-white dark:bg-[#0c1833]">{mes}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button onClick={predecirConModelo} disabled={simLoading} className="w-full px-5 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {simLoading
                  ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Ejecutando modelo…</>)
                  : (<><span className="material-symbols-outlined text-base">bolt</span> Predecir riesgo</>)}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-6 text-center">
            {simError ? (
              <div className="flex flex-col items-center gap-2 text-red-500">
                <span className="material-symbols-outlined text-3xl">error</span>
                <p className="text-xs font-medium">No se pudo cargar el modelo. Reintenta.</p>
              </div>
            ) : simResult ? (
              <div key={simResult.prob} className="animate-fade-in-up flex flex-col items-center gap-3 w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Riesgo predicho a 7 días</span>
                {(() => {
                  const rl2 = riskLevel(simResult.prob);
                  const R = 42, C = 2 * Math.PI * R;
                  return (
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r={R} fill="none" strokeWidth="9" className="stroke-slate-200 dark:stroke-slate-800" />
                        <circle
                          cx="50" cy="50" r={R} fill="none" strokeWidth="9" strokeLinecap="round"
                          stroke={rl2.color}
                          strokeDasharray={C}
                          strokeDashoffset={C * (1 - displayProb / 100)}
                          style={{ transition: 'stroke-dashoffset 90ms linear', filter: `drop-shadow(0 0 4px ${rl2.color}66)` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold tabular-nums" style={{ color: rl2.color }}>{displayProb}%</span>
                        <span className="px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold text-white uppercase" style={{ backgroundColor: rl2.color }}>{rl2.label}</span>
                      </div>
                    </div>
                  );
                })()}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">Predicción del <b className="text-slate-700 dark:text-slate-200">modelo entrenado</b> (AUC-ROC 0.86) para {deptoData.name}.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                <span className="material-symbols-outlined text-4xl">neurology</span>
                <p className="text-xs font-medium">Ajusta las condiciones y pulsa <b>Predecir riesgo</b> para calcular el riesgo.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnóstico ejecutivo generado */}
      <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 md:p-8 shadow-2xs border border-slate-200/80 dark:border-slate-800/80 space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <h3 className="font-headline-lg text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-lg">description</span>
              </div>
              Diagnóstico Ejecutivo por Región
            </h3>
            <p className="font-body-md text-xs text-slate-500 dark:text-slate-400">Informe estructurado con recomendaciones de prevención, a partir de los datos reales del departamento.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={reportDeptoKey} onChange={(e) => setReportDeptoKey(e.target.value)} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold px-3 py-2 outline-none text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs">
              {departmentKeys.map((key) => (
                <option key={key} value={key} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">{PERU_DEPARTAMENTOS[key].name} ({PERU_DEPARTAMENTOS[key].prob}% riesgo)</option>
              ))}
            </select>
            <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
              {isGeneratingReport ? (<><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Generando...</>) : (<><span className="material-symbols-outlined text-sm">auto_awesome</span>Generar Diagnóstico</>)}
            </button>
          </div>
        </div>

        {reportError && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">cloud_off</span>{reportError}
          </div>
        )}

        {isGeneratingReport && !generatedReport && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/70 rounded"></div>
            <div className="h-3 w-11/12 bg-slate-100 dark:bg-slate-800/70 rounded"></div>
            <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-800/70 rounded"></div>
          </div>
        )}

        {generatedReport && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center px-5 py-3 bg-slate-50 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-base">verified</span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Diagnóstico Oficial CENEPRED · {reportDeptoData.name}</span>
              </div>
              <button onClick={() => window.print()} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-sm">print</span>Exportar PDF
              </button>
            </div>
            <div className="p-6 bg-white dark:bg-[#0a1122]">
              <DiagnosticoRender text={generatedReport} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
