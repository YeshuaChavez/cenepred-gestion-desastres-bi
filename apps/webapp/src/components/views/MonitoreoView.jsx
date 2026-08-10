import React, { useState } from 'react';
import { PERU_DEPARTAMENTOS } from '../../data/mockData';

export default function MonitoreoView() {
  const [selectedDeptoKey, setSelectedDeptoKey] = useState('piura');
  const deptoData = PERU_DEPARTAMENTOS[selectedDeptoKey] || PERU_DEPARTAMENTOS['piura'];

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex items-end justify-between w-full mb-2">
        <div>
          <h2 className="font-headline-lg text-2xl font-bold text-slate-900 mb-1">
            Monitoreo Diario de Riesgos
          </h2>
          <p className="font-body-md text-sm text-slate-600 max-w-2xl">
            Vista unificada de indicadores meteorológicos, eventos activos y capacidad presupuestal a nivel nacional. Datos actualizados en tiempo real mediante arquitectura Medallion en Azure Databricks.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-white border border-outline-variant/20 rounded-full font-label-sm text-xs text-slate-700 flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">update</span> Última act: 10:45 AM
          </span>
          <button className="px-5 py-2 bg-primary text-on-primary font-label-sm text-xs rounded-lg shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {/* KPI 1: Alto Riesgo */}
        <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow shadow-sm">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-error rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Regiones Alto Riesgo</h3>
            </div>
            <span className="material-symbols-outlined text-error">warning</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-error">5</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">Regiones</span>
          </div>
          <div className="mt-4 flex gap-2 relative z-10">
            <span className="px-2 py-1 bg-error/10 text-error rounded-md text-[10px] font-bold border-l-2 border-error">PIU</span>
            <span className="px-2 py-1 bg-error/10 text-error rounded-md text-[10px] font-bold border-l-2 border-error">TUM</span>
            <span className="px-2 py-1 bg-error/10 text-error rounded-md text-[10px] font-bold border-l-2 border-error">LAM</span>
          </div>
        </div>

        {/* KPI 2: Precipitación */}
        <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow shadow-sm">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Precipitación 7d</h3>
            </div>
            <span className="material-symbols-outlined text-secondary">water_drop</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">42.8</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">mm prom.</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined text-[14px] text-error">trending_up</span>
            <span className="font-label-sm text-xs text-slate-500">Open-Meteo API • +12% vs hist.</span>
          </div>
        </div>

        {/* KPI 3: Focos Calor */}
        <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow shadow-sm">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-tertiary rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Focos Calor Activos</h3>
            </div>
            <span className="material-symbols-outlined text-tertiary">local_fire_department</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">128</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">Focos</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse"></span>
            <span className="font-label-sm text-xs text-slate-500">NASA FIRMS • Satélite VIIRS</span>
          </div>
        </div>

        {/* KPI 4: Presupuesto */}
        <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow shadow-sm">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Ejecución PP 0068</h3>
            </div>
            <span className="material-symbols-outlined text-primary">account_balance</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">84.5<span className="text-2xl text-slate-500">%</span></span>
          </div>
          <div className="mt-4 w-full bg-surface-container-low rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '84.5%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-2">
        {/* Region Analysis Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-6 shadow-sm flex-1 relative z-10 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
              <h3 className="font-title-md text-base font-bold text-slate-900">Análisis Regional</h3>
              <div className="relative">
                <select
                  value={selectedDeptoKey}
                  onChange={(e) => setSelectedDeptoKey(e.target.value)}
                  className="appearance-none bg-surface-container-low text-slate-700 font-label-sm px-4 py-2 pr-8 rounded-lg outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer w-40 truncate border border-outline-variant/20 font-semibold"
                >
                  <option value="piura">Piura</option>
                  <option value="tumbes">Tumbes</option>
                  <option value="lambayeque">Lambayeque</option>
                  <option value="apurimac">Apurímac</option>
                  <option value="lima">Lima</option>
                  <option value="arequipa">Arequipa</option>
                  <option value="cajamarca">Cajamarca</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
              </div>
            </div>

            {/* Gauge Meter */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-48 h-24 overflow-hidden mb-2">
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-surface-container-low"></div>
                <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-transparent border-t-error border-l-error border-r-surface-container-low border-b-surface-container-low rotate-45 transform origin-center opacity-90" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 50%, 0 50%)' }}></div>
                <div className="absolute bottom-0 left-1/2 w-1.5 h-20 bg-slate-800 origin-bottom -translate-x-1/2 rounded-t-full shadow-md transition-transform duration-700" style={{ transform: `translate(-50%, 0) rotate(${deptoData.needleDeg}deg)` }}></div>
              </div>
              <div className="text-center">
                <span className="font-display-lg text-3xl font-bold text-error block leading-none mb-1">{deptoData.prob}%</span>
                <span className="font-label-sm text-xs text-slate-500 uppercase tracking-widest font-semibold">Riesgo Predictivo ({deptoData.tag})</span>
              </div>
            </div>

            {/* SHAP Values Breakdown */}
            <div className="mt-auto pt-6 border-t border-outline-variant/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-label-sm text-xs text-slate-700 uppercase font-bold tracking-wider">SHAP Value Explainability</h4>
                <span className="material-symbols-outlined text-[16px] text-primary cursor-help">info</span>
              </div>
              <div className="flex flex-col gap-4">
                {deptoData.shap.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-label-sm text-xs mb-1 text-slate-700">
                      <span>{item.name}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.val}</span>
                    </div>
                    <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Geospatial Dashboard */}
        <div className="lg:col-span-8 bg-white/80 backdrop-blur border border-white/40 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex justify-between items-start mb-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20">
            <div>
              <h3 className="font-label-sm text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Dashboard Operativo Geospacial
              </h3>
              <span className="text-[10px] text-slate-500">dbw_cenepred_dev.default.fact_monitoreo_diario</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-white rounded border border-outline-variant/20 text-slate-700 hover:bg-slate-50 font-medium">Capas Satelitales</button>
              <button className="px-3 py-1 text-xs bg-primary text-white rounded font-medium shadow-sm">DirectQuery</button>
            </div>
          </div>

          <div className="flex-1 bg-slate-900 rounded-xl relative flex items-center justify-center overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 opacity-95"></div>
            <div className="relative z-10 text-center p-6 max-w-md">
              <span className="material-symbols-outlined text-5xl text-primary mb-3">public</span>
              <h4 className="text-white font-bold text-lg mb-2">Visor Geocartográfico Nacional</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Visualizador de polígonos de riesgo por departamento, integración de focos de calor satelitales NASA FIRMS y estaciones meteorológicas Open-Meteo.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-xs font-semibold">
                <span>Power BI DirectQuery Connected</span>
              </div>
            </div>

            {/* Map Risk Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-md border border-outline-variant/20 text-left">
              <h4 className="font-label-sm text-xs font-bold text-slate-900 mb-2">Leyenda de Riesgo</h4>
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-600"></span><span>Crítico (&gt;80%)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span>Alto (60-80%)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span>Moderado (&lt;60%)</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
