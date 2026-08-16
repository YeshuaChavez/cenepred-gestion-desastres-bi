import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../../data/mockData';
import { MapLayerMode } from '../PeruInteractiveMap';

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
  const [exportToast, setExportToast] = useState<boolean>(false);
  
  const deptoData = PERU_DEPARTAMENTOS[selectedDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

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

  // Top highest risk departments sorted dynamically
  const sortedDeptos = Object.values(PERU_DEPARTAMENTOS).sort((a, b) => b.prob - a.prob);
  const highRiskDeptos = sortedDeptos.filter(d => d.prob >= 50);

  const handleExportCSV = () => {
    const headers = ["Departamento", "Riesgo SAT (%)", "Categoría", "Emergencias", "Afectados", "Lluvia (mm)", "Focos Calor", "PIM (S/ M)", "Ejecución MEF (%)"];
    const rows = Object.values(PERU_DEPARTAMENTOS).map(d => [
      `"${d.name}"`,
      d.prob,
      `"${d.tag}"`,
      d.emergencias,
      d.afectados,
      d.precipitacionMm,
      d.focosCalor,
      d.pimM,
      d.pctEjecucion
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Nacional_Riesgos_CENEPRED_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800 relative">
      
      {/* Toast Feedback */}
      {exportToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>Reporte descargado correctamente (CSV).</span>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Monitoreo Nacional de Riesgos
          </h2>
          <p className="font-body-md text-sm text-slate-600 max-w-3xl mt-1">
            Explora el mapa interactivo del Perú en tiempo real para consultar las lluvias, el nivel de riesgo y la inversión preventiva en cada región del país.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="px-5 py-2 bg-sky-700 text-white font-label-sm text-xs rounded-xl shadow-xs hover:bg-sky-800 transition-colors flex items-center gap-2 font-semibold cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Reporte CSV
          </button>
        </div>
      </div>

      {/* Macrorregion Filter Bar & Layer Selector */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs text-xs font-semibold">
        
        {/* Macrorregions Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-slate-500 font-bold px-2 flex items-center gap-1 shrink-0">
            <span className="material-symbols-outlined text-sm text-sky-700">filter_alt</span> Macrorregión:
          </span>
          <button
            onClick={() => handleMacroRegionChange('todas')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'todas' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Todas las Regiones (25)
          </button>
          <button
            onClick={() => handleMacroRegionChange('norte')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'norte' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Costa Norte
          </button>
          <button
            onClick={() => handleMacroRegionChange('sierra_sur')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'sierra_sur' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Sierra Centro / Sur
          </button>
          <button
            onClick={() => handleMacroRegionChange('selva')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'selva' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Selva / Amazonía
          </button>
          <button
            onClick={() => handleMacroRegionChange('costa_centro')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${macroRegion === 'costa_centro' ? 'bg-sky-700 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Costa Centro / Sur
          </button>
        </div>

        {/* Dynamic Map Layers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <span className="text-slate-400 font-bold px-2 text-[11px] uppercase tracking-wider">Capa del Mapa:</span>
          <button
            onClick={() => setMapMode('riesgo')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${mapMode === 'riesgo' ? 'bg-white text-red-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Riesgo SAT
          </button>
          <button
            onClick={() => setMapMode('precip')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${mapMode === 'precip' ? 'bg-white text-sky-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Precipitaciones
          </button>
          <button
            onClick={() => setMapMode('focos')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${mapMode === 'focos' ? 'bg-white text-amber-600 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Focos Calor
          </button>
          <button
            onClick={() => setMapMode('mef')}
            className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer ${mapMode === 'mef' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Gasto MEF
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        
        {/* Card 1: High Risk */}
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-red-700 transition-colors">Regiones en Alto Riesgo</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">warning</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-red-600">{highRiskDeptos.length}</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">de 25 Regiones (&gt;50%)</span>
          </div>
          
          {/* Clickable High Risk Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            {highRiskDeptos.slice(0, 6).map((d) => {
              const matchingKey = departmentKeys.find(k => PERU_DEPARTAMENTOS[k].name === d.name);
              const isSelected = matchingKey === selectedDeptoKey;
              return (
                <button
                  key={d.name}
                  onClick={() => matchingKey && setSelectedDeptoKey(matchingKey)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-xs scale-105'
                      : 'bg-red-50 text-red-700 border-l-2 border-red-500 hover:bg-red-100'
                  }`}
                  title={`Seleccionar ${d.name} (${d.prob}%)`}
                >
                  {d.name.substring(0, 5)} {d.prob}%
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2: Precipitation */}
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-sky-700 transition-colors">Lluvia Max 24h — {deptoData.name}</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-700 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">water_drop</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">{deptoData.precipitacionMm}</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">mm en 24h</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined text-[14px] text-sky-600">cloud</span>
            <span className="font-label-sm text-xs text-slate-500">Servicio Meteorológico • Temp Máx {deptoData.tempMax}°C</span>
          </div>
        </div>

        {/* Card 3: Heat Spots */}
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-amber-700 transition-colors">Focos Calor — {deptoData.name}</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">local_fire_department</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">{deptoData.focosCalor}</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">Focos Activos</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="font-label-sm text-xs text-slate-500">Telemetría NASA FIRMS • Sismos {deptoData.sismos7d}</span>
          </div>
        </div>

        {/* Card 4: MEF Execution */}
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-slate-200/90 shadow-2xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-emerald-700 transition-colors">Ejecución MEF — {deptoData.name}</h3>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </div>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">{deptoData.pctEjecucion}<span className="text-2xl text-slate-400">%</span></span>
            <span className="font-body-md text-xs text-slate-500 mb-1">S/ {deptoData.devengadoM}M de S/ {deptoData.pimM}M</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${deptoData.pctEjecucion}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-2">
        
        {/* Left Side: Department Detail Panel with 1 Clean Single Gauge */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex-1 relative z-10 flex flex-col">
            
            {/* Department Selector Dropdown */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Análisis Regional</h3>
              <div className="relative">
                <select
                  value={selectedDeptoKey}
                  onChange={(e) => setSelectedDeptoKey(e.target.value)}
                  className="appearance-none bg-slate-100 text-slate-800 font-label-sm px-4 py-2 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer w-48 truncate border border-slate-200 font-bold text-xs"
                >
                  {filteredKeys.map(k => (
                    <option key={k} value={k}>
                      {PERU_DEPARTAMENTOS[k].name} ({PERU_DEPARTAMENTOS[k].prob}%)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
              </div>
            </div>

            {/* SINGLE CLEAN PROMINENT DEPARTMENT GAUGE */}
            <div className="flex flex-col items-center justify-center py-4 border-b border-slate-200">
              <div className="relative w-48 h-24 overflow-hidden mb-2">
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-slate-100"></div>
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-transparent border-t-red-500 border-l-red-500 border-r-slate-100 border-b-slate-100 rotate-45 transform origin-center opacity-90" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' }}></div>
                <div className="absolute bottom-0 left-1/2 w-1.5 h-20 bg-slate-800 origin-bottom -translate-x-1/2 rounded-t-full shadow-md transition-transform duration-700" style={{ transform: `translate(-50%, 0) rotate(${deptoData.needleDeg}deg)` }}></div>
              </div>
              <div className="text-center">
                <span className="font-display-lg text-3xl font-bold text-red-600 block leading-none mb-1">{deptoData.prob}%</span>
                <span className="font-label-sm text-xs text-slate-500 uppercase tracking-widest font-semibold">Nivel de Riesgo — {deptoData.name} ({deptoData.tag})</span>
              </div>
            </div>

            {/* Quick Metrics Box */}
            <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Emergencias Registradas:</span>
                <span className="font-bold text-slate-800 text-sm">{deptoData.emergencias?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Población Afectada:</span>
                <span className="font-bold text-slate-800 text-sm">{deptoData.afectados?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Presupuesto Asignado:</span>
                <span className="font-bold text-slate-800 text-sm">S/ {deptoData.pimM}M</span>
              </div>
              <div>
                <span className="text-slate-500 block">Inversión Ejecutada:</span>
                <span className="font-bold text-slate-800 text-sm">{deptoData.pctEjecucion}%</span>
              </div>
            </div>

            {/* SHAP Factors */}
            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-label-sm text-xs text-slate-700 uppercase font-bold tracking-wider">Factores Determinantes ({deptoData.name})</h4>
                <span className="material-symbols-outlined text-[16px] text-sky-600 cursor-help">info</span>
              </div>
              <div className="flex flex-col gap-3">
                {deptoData.shap.map((item, idx) => (
                  <div key={idx} className="group cursor-pointer">
                    <div className="flex justify-between font-label-sm text-xs mb-1 text-slate-700">
                      <span className="group-hover:text-sky-700 font-medium">{item.name}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Interactive Map */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200 flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Visor Cartográfico Nacional
              </h3>
              <span className="text-[10px] text-slate-500">Haz clic en los marcadores del mapa para seleccionar una región</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="px-3 py-1 bg-sky-100 text-sky-900 rounded-full font-bold text-[11px] border border-sky-200">
                {MACRO_LABELS[macroRegion]}
              </span>
              <span className="text-sky-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">map</span> Capa: <strong className="uppercase">{mapMode}</strong>
              </span>
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[420px] relative rounded-xl overflow-hidden">
            <PeruInteractiveMap
              departamentos={PERU_DEPARTAMENTOS}
              selectedDeptoKey={selectedDeptoKey}
              onSelectDepto={(key) => setSelectedDeptoKey(key)}
              mapMode={mapMode}
              macroRegion={macroRegion}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
