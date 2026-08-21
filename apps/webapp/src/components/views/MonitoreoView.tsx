import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PERU_DEPARTAMENTOS } from '../../data/mockData';
import { MapLayerMode, TimeWindow } from '../PeruInteractiveMap';

const PeruInteractiveMap = dynamic(() => import('../PeruInteractiveMap'), {
  ssr: false,
});

type MacroRegion = 'todas' | 'norte' | 'sierra_sur' | 'selva' | 'costa_centro';

const MACRO_REGIONS: Record<string, string[]> = {
  norte: ['piura', 'tumbes', 'lambayeque', 'la_libertad', 'cajamarca'],
  sierra_sur: ['arequipa', 'cusco', 'apurimac', 'ayacucho', 'puno', 'huancavelica', 'junin', 'pasco', 'huanuco'],
  selva: ['loreto', 'ucayali', 'san_martin', 'amazonas', 'madre_de_dios'],
  costa_centro: ['lima', 'callao', 'ica', 'moquegua', 'tacna', 'ancash']
};

const MACRO_LABELS: Record<MacroRegion, string> = {
  todas: 'Nacional (25 Regiones)',
  norte: 'Costa Norte (5 Regiones)',
  sierra_sur: 'Sierra Centro / Sur (9 Regiones)',
  selva: 'Selva / Amazonía (5 Regiones)',
  costa_centro: 'Costa Centro / Sur (6 Regiones)'
};

export default function MonitoreoView() {
  const departmentKeys = Object.keys(PERU_DEPARTAMENTOS);
  const [selectedDeptoKey, setSelectedDeptoKey] = useState<string>(departmentKeys[0] || 'piura');
  const [macroRegion, setMacroRegion] = useState<MacroRegion>('todas');
  const [mapMode, setMapMode] = useState<MapLayerMode>('riesgo');
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
  const [forecast48h, setForecast48h] = useState<boolean>(false);
  const [showHospitals, setShowHospitals] = useState<boolean>(false);
  const [showBridges, setShowBridges] = useState<boolean>(false);
  const [showShelters, setShowShelters] = useState<boolean>(false);
  const [exportToast, setExportToast] = useState<boolean>(false);
  
  const rawDeptoData = PERU_DEPARTAMENTOS[selectedDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

  // Factores temporales multiplicadores
  const timeFactorPrecip = timeWindow === '30d' ? 14.8 : timeWindow === '7d' ? 4.2 : 1.0;
  const timeFactorFocos = timeWindow === '30d' ? 19.2 : timeWindow === '7d' ? 5.5 : 1.0;
  const timeFactorSismos = timeWindow === '30d' ? 3.8 : timeWindow === '7d' ? 1.0 : 0.25;

  // Cálculo de valores según ventana temporal y pronóstico 48h
  let currentProb = rawDeptoData.prob;
  let forecastDelta = 0;
  if (forecast48h) {
    if (['piura', 'tumbes', 'lambayeque', 'loreto', 'san_martin', 'amazonas'].includes(selectedDeptoKey)) {
      forecastDelta = 12;
    } else if (['arequipa', 'cusco', 'puno', 'ancash'].includes(selectedDeptoKey)) {
      forecastDelta = 6;
    } else {
      forecastDelta = -3;
    }
    currentProb = Math.min(99, Math.max(10, currentProb + forecastDelta));
  }

  const currentPrecip = Math.round((rawDeptoData.precipitacionMm || 0) * timeFactorPrecip);
  const currentFocos = Math.round((rawDeptoData.focosCalor || 0) * timeFactorFocos);
  const currentSismos = Math.round((rawDeptoData.sismos7d || 0) * timeFactorSismos);

  // Filter department keys by macro-region
  const filteredKeys = departmentKeys.filter(key => {
    if (macroRegion === 'todas') return true;
    return MACRO_REGIONS[macroRegion]?.includes(key);
  });

  const handleMacroRegionChange = (newMacro: MacroRegion) => {
    setMacroRegion(newMacro);
    const newFilteredKeys = departmentKeys.filter(key => {
      if (newMacro === 'todas') return true;
      return MACRO_REGIONS[newMacro]?.includes(key);
    });

    if (newFilteredKeys.length > 0 && !newFilteredKeys.includes(selectedDeptoKey)) {
      setSelectedDeptoKey(newFilteredKeys[0]);
    }
  };

  // High risk departments calculation
  const sortedDeptos = Object.entries(PERU_DEPARTAMENTOS).map(([k, d]) => {
    let p = d.prob;
    if (forecast48h) {
      const delta = ['piura', 'tumbes', 'lambayeque', 'loreto', 'san_martin', 'amazonas'].includes(k) ? 12 : ['arequipa', 'cusco', 'puno', 'ancash'].includes(k) ? 6 : -3;
      p = Math.min(99, Math.max(10, p + delta));
    }
    return { ...d, key: k, computedProb: p };
  }).sort((a, b) => b.computedProb - a.computedProb);

  const highRiskDeptos = sortedDeptos.filter(d => d.computedProb >= 50);

  const handleExportCSV = () => {
    const headers = ["Departamento", "Riesgo SAT (%)", "Categoría", "Ventana Temporal", "Lluvia (mm)", "Focos Calor", "PIM (S/ M)", "Ejecución MEF (%)"];
    const rows = sortedDeptos.map(d => [
      `"${d.name}"`,
      d.computedProb,
      `"${d.computedProb >= 65 ? 'Muy Alto' : d.computedProb >= 50 ? 'Alto' : 'Moderado'}"`,
      `"${timeWindow}"`,
      Math.round((d.precipitacionMm || 0) * timeFactorPrecip),
      Math.round((d.focosCalor || 0) * timeFactorFocos),
      d.pimM,
      d.pctEjecucion
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Monitoreo_CENEPRED_${timeWindow}_${forecast48h ? 'Pronostico48h_' : ''}${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-slate-100 relative transition-colors duration-300">
      
      {/* Toast Feedback */}
      {exportToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>Reporte descargado correctamente (CSV).</span>
        </div>
      )}

      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Monitoreo Nacional de Riesgos
            {forecast48h && (
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs animate-pulse">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                Pronóstico 48h Activo
              </span>
            )}
          </h2>
          <p className="font-body-md text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1">
            Explora el mapa interactivo del Perú en tiempo real para consultar las lluvias, el nivel de riesgo y la inversión preventiva en cada región del país.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-sky-600 dark:bg-sky-500 text-white font-label-sm text-xs rounded-xl shadow-xs hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors flex items-center gap-2 font-bold cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Reporte CSV
          </button>
        </div>
      </div>

      {/* Control Bar: Ventana Temporal + Pronóstico 48h + Capas del Mapa */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white dark:bg-[#0c1833] p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs text-xs font-semibold transition-colors duration-300">
        
        {/* Left: Ventana Temporal Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-slate-500 dark:text-slate-400 font-bold px-1 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-sm text-sky-600 dark:text-sky-400">history_toggle_off</span> Ventana:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              onClick={() => setTimeWindow('24h')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${timeWindow === '24h' ? 'bg-white dark:bg-[#0c1833] text-sky-700 dark:text-sky-300 font-extrabold shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Últimas 24 Horas
            </button>
            <button
              onClick={() => setTimeWindow('7d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${timeWindow === '7d' ? 'bg-white dark:bg-[#0c1833] text-sky-700 dark:text-sky-300 font-extrabold shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Últimos 7 Días
            </button>
            <button
              onClick={() => setTimeWindow('30d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${timeWindow === '30d' ? 'bg-white dark:bg-[#0c1833] text-sky-700 dark:text-sky-300 font-extrabold shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Últimos 30 Días
            </button>
          </div>
        </div>

        {/* Center: Pronóstico Predictivo 48h Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForecast48h(!forecast48h)}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 border ${
              forecast48h
                ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:text-purple-600'
            }`}
            title="Activar o desactivar proyección inferencial a 48 horas"
          >
            <span className="material-symbols-outlined text-base">{forecast48h ? 'online_prediction' : 'query_stats'}</span>
            <span>Pronóstico Predictivo 48h</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${forecast48h ? 'bg-white text-purple-900' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'}`}>
              {forecast48h ? 'ON' : 'IA'}
            </span>
          </button>
        </div>

        {/* Right: Map Layers */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl shrink-0 transition-colors">
          <span className="text-slate-500 dark:text-slate-400 font-bold px-2 text-[11px] uppercase tracking-wider">Capa:</span>
          <button
            onClick={() => setMapMode('riesgo')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer ${mapMode === 'riesgo' ? 'bg-white dark:bg-[#0c1833] text-red-600 dark:text-red-400 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Riesgo SAT
          </button>
          <button
            onClick={() => setMapMode('precip')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer ${mapMode === 'precip' ? 'bg-white dark:bg-[#0c1833] text-sky-700 dark:text-sky-400 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Lluvias
          </button>
          <button
            onClick={() => setMapMode('focos')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer ${mapMode === 'focos' ? 'bg-white dark:bg-[#0c1833] text-amber-600 dark:text-amber-400 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Focos Calor
          </button>
          <button
            onClick={() => setMapMode('mef')}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all cursor-pointer ${mapMode === 'mef' ? 'bg-white dark:bg-[#0c1833] text-emerald-700 dark:text-emerald-400 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Gasto MEF
          </button>
        </div>

      </div>

      {/* Macrorregion Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <span className="text-slate-500 dark:text-slate-400 font-bold px-2 flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-sm text-sky-600 dark:text-sky-400">filter_alt</span> Macrorregión:
        </span>
        <button
          onClick={() => handleMacroRegionChange('todas')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'todas' ? 'bg-sky-600 dark:bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Todas las Regiones (25)
        </button>
        <button
          onClick={() => handleMacroRegionChange('norte')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'norte' ? 'bg-sky-600 dark:bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Costa Norte
        </button>
        <button
          onClick={() => handleMacroRegionChange('sierra_sur')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'sierra_sur' ? 'bg-sky-600 dark:bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Sierra Centro / Sur
        </button>
        <button
          onClick={() => handleMacroRegionChange('selva')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'selva' ? 'bg-sky-600 dark:bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Selva / Amazonía
        </button>
        <button
          onClick={() => handleMacroRegionChange('costa_centro')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'costa_centro' ? 'bg-sky-600 dark:bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
        >
          Costa Centro / Lima
        </button>
      </div>

      {/* Infrastructure & Shelter Layer Controls */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-bold px-2 flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">domain</span> Infraestructura Crítica:
          </span>
          <button
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
              showHospitals
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            <span>Hospitales (MINSA/EsSalud)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${showHospitals ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {showHospitals ? 'ON' : 'OFF'}
            </span>
          </button>
          <button
            onClick={() => setShowBridges(!showBridges)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
              showBridges
                ? 'bg-amber-600 text-white border-amber-500 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
            }`}
          >
            <span>Puentes Críticos (MTC)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${showBridges ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {showBridges ? 'ON' : 'OFF'}
            </span>
          </button>
          <button
            onClick={() => setShowShelters(!showShelters)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
              showShelters
                ? 'bg-purple-600 text-white border-purple-500 shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            <span>Albergues Oficiales (INDECI)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${showShelters ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
              {showShelters ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {(showHospitals || showBridges || showShelters) && (
          <button
            onClick={() => { setShowHospitals(false); setShowBridges(false); setShowShelters(false); }}
            className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 underline cursor-pointer shrink-0"
          >
            Ocultar Capas GIS
          </button>
        )}
      </div>

      {/* 4 Dynamic Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        
        {/* Card 1: High Risk */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 relative overflow-hidden group hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {forecast48h ? 'Proyección Riesgo 48h' : 'Regiones en Alto Riesgo'}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">warning</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-red-600 dark:text-red-400">{highRiskDeptos.length}</span>
            <span className="font-body-md text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">de 25 Regiones (&gt;50%)</span>
          </div>
          
          {/* Clickable High Risk Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            {highRiskDeptos.slice(0, 6).map((d) => {
              const isSelected = d.key === selectedDeptoKey;
              return (
                <button
                  key={d.name}
                  onClick={() => setSelectedDeptoKey(d.key)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs scale-105'
                      : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-l-2 border-red-500 hover:bg-red-100 dark:hover:bg-red-900'
                  }`}
                  title={`Seleccionar ${d.name} (${d.computedProb}%)`}
                >
                  {d.name.substring(0, 5)} {d.computedProb}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Precipitation */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 relative overflow-hidden group hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Lluvia ({timeWindow}) • {rawDeptoData.name}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">water_drop</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900 dark:text-white">{currentPrecip}</span>
            <span className="font-body-md text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">mm ({timeWindow})</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined text-[14px] text-sky-600 dark:text-sky-400">cloud</span>
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400">Servicio Meteorológico • Temp Máx {rawDeptoData.tempMax}°C</span>
          </div>
        </div>

        {/* Card 3: Heat Spots */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 relative overflow-hidden group hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Focos Calor ({timeWindow}) • {rawDeptoData.name}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">local_fire_department</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900 dark:text-white">{currentFocos}</span>
            <span className="font-body-md text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">Focos Detectados</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400">Telemetría NASA FIRMS • Sismos ({timeWindow}) {currentSismos}</span>
          </div>
        </div>

        {/* Card 4: MEF Execution */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 dark:border-slate-800/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Ejecución MEF • {rawDeptoData.name}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900 dark:text-white">{rawDeptoData.pctEjecucion}<span className="text-2xl text-slate-400">%</span></span>
            <span className="font-body-md text-xs text-slate-500 dark:text-slate-400 mb-1">S/ {rawDeptoData.devengadoM}M de S/ {rawDeptoData.pimM}M</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${rawDeptoData.pctEjecucion}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-2">
        
        {/* Left Side: Department Detail Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 shadow-sm border border-slate-200/90 dark:border-slate-800/90 flex-1 relative z-10 flex flex-col transition-colors duration-300">
            
            {/* Department Selector Dropdown */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Diagnóstico</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{rawDeptoData.name}</h3>
              </div>
              <div className="relative">
                <select
                  value={selectedDeptoKey}
                  onChange={(e) => setSelectedDeptoKey(e.target.value)}
                  className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-label-sm px-4 py-2 pr-8 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer w-44 truncate border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-2xs"
                >
                  {filteredKeys.map(k => (
                    <option key={k} value={k} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">
                      {PERU_DEPARTAMENTOS[k].name} ({PERU_DEPARTAMENTOS[k].prob}%)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none text-sm">expand_more</span>
              </div>
            </div>

            {/* If 48h forecast active, show delta forecast alert */}
            {forecast48h && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/60 rounded-2xl border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-base">auto_awesome</span>
                  <span className="font-bold text-purple-900 dark:text-purple-200">Pronóstico Satelital 48h</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${forecastDelta > 0 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                  {forecastDelta > 0 ? `▲ +${forecastDelta}% Alza` : '▼ Descenso'}
                </span>
              </div>
            )}

            {/* Department Gauge */}
            <div className="flex flex-col items-center justify-center py-2 border-b border-slate-200 dark:border-slate-800">
              <div className="relative w-48 h-24 overflow-hidden mb-2">
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-transparent border-t-red-500 border-l-red-500 border-r-slate-100 dark:border-r-slate-800 border-b-slate-100 dark:border-b-slate-800 rotate-45 transform origin-center opacity-90" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' }}></div>
                <div className="absolute bottom-0 left-1/2 w-1.5 h-20 bg-slate-800 dark:bg-white origin-bottom -translate-x-1/2 rounded-t-full shadow-md transition-transform duration-700" style={{ transform: `translate(-50%, 0) rotate(${rawDeptoData.needleDeg}deg)` }}></div>
              </div>
              <div className="text-center">
                <span className="font-display-lg text-3xl font-extrabold text-red-600 dark:text-red-400 block leading-none mb-1">{currentProb}%</span>
                <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                  {forecast48h ? `Riesgo Proyectado a 48h` : `Nivel de Riesgo (${timeWindow})`}
                </span>
              </div>
            </div>

            {/* Quick Metrics Box */}
            <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Emergencias:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rawDeptoData.emergencias?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Población Afectada:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rawDeptoData.afectados?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">PIM Asignado:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">S/ {rawDeptoData.pimM}M</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Inversión Ejecutada:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rawDeptoData.pctEjecucion}%</span>
              </div>
            </div>

            {/* SHAP Factors */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-label-sm text-xs text-slate-700 dark:text-slate-300 uppercase font-bold tracking-wider">Factores Clave ({rawDeptoData.name})</h4>
                <span className="material-symbols-outlined text-[16px] text-sky-600 dark:text-sky-400 cursor-help">info</span>
              </div>
              <div className="flex flex-col gap-3">
                {rawDeptoData.shap.map((item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="flex justify-between font-label-sm text-xs mb-1 text-slate-700 dark:text-slate-300">
                      <span className="group-hover:text-sky-600 dark:group-hover:text-sky-400 font-medium">{item.name}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Interactive Map */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0c1833] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-4 shadow-sm relative overflow-hidden flex flex-col min-h-[540px] transition-colors duration-300">
          <div className="flex justify-between items-center mb-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${forecast48h ? 'bg-purple-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
                Visor Cartográfico GIS Nacional
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {forecast48h ? 'Modo Pronóstico 48h con simulación satelital activa' : 'Haz clic en los marcadores del mapa para seleccionar una región'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-3 py-1 bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-300 rounded-full font-bold text-[11px] border border-sky-200 dark:border-sky-800">
                {MACRO_LABELS[macroRegion]}
              </span>
              <span className="px-2.5 py-1 bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-bold">
                {timeWindow === '24h' ? '24h' : timeWindow === '7d' ? '7 Días' : '30 Días'}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[460px] relative rounded-2xl overflow-hidden">
            <PeruInteractiveMap
              departamentos={PERU_DEPARTAMENTOS}
              selectedDeptoKey={selectedDeptoKey}
              onSelectDepto={(key) => setSelectedDeptoKey(key)}
              mapMode={mapMode}
              macroRegion={macroRegion}
              timeWindow={timeWindow}
              forecast48h={forecast48h}
              showHospitals={showHospitals}
              showBridges={showBridges}
              showShelters={showShelters}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
