import React, { useState } from 'react';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../../data/mockData';
import PeruInteractiveMap from '../PeruInteractiveMap';

export default function MonitoreoView() {
  const departmentKeys = Object.keys(PERU_DEPARTAMENTOS);
  const [selectedDeptoKey, setSelectedDeptoKey] = useState<string>(departmentKeys[0] || 'piura');
  const [exportToast, setExportToast] = useState<boolean>(false);
  
  const deptoData = PERU_DEPARTAMENTOS[selectedDeptoKey] || PERU_DEPARTAMENTOS[departmentKeys[0]];

  // Calculate top high risk regions
  const highRiskDeptos = Object.values(PERU_DEPARTAMENTOS).filter(d => d.prob >= 65);

  const handleExportCSV = () => {
    // Generate real CSV from PERU_DEPARTAMENTOS data
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

      <div className="flex items-end justify-between w-full mb-2">
        <div>
          <h2 className="font-headline-lg text-2xl font-bold text-slate-900 mb-1">
            Monitoreo Nacional de Riesgos de Desastres
          </h2>
          <p className="font-body-md text-sm text-slate-600 max-w-3xl">
            Visor geocartográfico para la supervisión del riesgo climático y presupuestal por región. Selecciona cualquiera de las 25 regiones en el mapa para explorar el informe detallado.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportCSV}
            className="px-5 py-2 bg-sky-700 text-white font-label-sm text-xs rounded-lg shadow-xs hover:bg-sky-800 transition-colors flex items-center gap-2 font-semibold cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Reporte CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Regiones en Alto Riesgo</h3>
            </div>
            <span className="material-symbols-outlined text-red-500">warning</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-red-600">{highRiskDeptos.length}</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">de 25 Regiones</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            {highRiskDeptos.slice(0, 4).map((d, i) => (
              <span key={i} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold border-l-2 border-red-500 uppercase">
                {d.name.substring(0, 3)}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-sky-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Precipitación {deptoData.name}</h3>
            </div>
            <span className="material-symbols-outlined text-sky-600">water_drop</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">{deptoData.precipitacionMm}</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">mm acum.</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="material-symbols-outlined text-[14px] text-sky-600">cloud</span>
            <span className="font-label-sm text-xs text-slate-500">Servicio Meteorológico • Temp máx {deptoData.tempMax}°C</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Focos Calor {deptoData.name}</h3>
            </div>
            <span className="material-symbols-outlined text-amber-500">local_fire_department</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">{deptoData.focosCalor}</span>
            <span className="font-body-md text-sm text-slate-600 mb-1 font-medium">Focos</span>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="font-label-sm text-xs text-slate-500">Monitoreo Térmico Satelital</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 relative overflow-hidden group hover:shadow-md transition-shadow border border-slate-200/80 shadow-xs">
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Ejecución PP0068 Nac.</h3>
            </div>
            <span className="material-symbols-outlined text-emerald-600">account_balance</span>
          </div>
          <div className="flex items-end gap-3 relative z-10">
            <span className="font-display-lg text-4xl font-extrabold text-slate-900">{NATIONAL_META.pctEjecucionNacional}<span className="text-2xl text-slate-400">%</span></span>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-2">
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex-1 relative z-10 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Análisis Regional</h3>
              <div className="relative">
                <select
                  value={selectedDeptoKey}
                  onChange={(e) => setSelectedDeptoKey(e.target.value)}
                  className="appearance-none bg-slate-100 text-slate-700 font-label-sm px-4 py-2 pr-8 rounded-lg outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer w-48 truncate border border-slate-200 font-semibold"
                >
                  {departmentKeys.map(k => (
                    <option key={k} value={k}>
                      {PERU_DEPARTAMENTOS[k].name} ({PERU_DEPARTAMENTOS[k].prob}%)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-sm">expand_more</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4">
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

            <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Emergencias SINPAD:</span>
                <span className="font-bold text-slate-800 text-sm">{deptoData.emergencias}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Afectados Totales:</span>
                <span className="font-bold text-slate-800 text-sm">{deptoData.afectados?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">PIM MEF (Millones):</span>
                <span className="font-bold text-slate-800 text-sm">S/ {deptoData.pimM}M</span>
              </div>
              <div>
                <span className="text-slate-500 block">Avance Presupuestal:</span>
                <span className="font-bold text-slate-800 text-sm">{deptoData.pctEjecucion}%</span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-label-sm text-xs text-slate-700 uppercase font-bold tracking-wider">Factores Determinantes del Riesgo</h4>
                <span className="material-symbols-outlined text-[16px] text-sky-600 cursor-help">info</span>
              </div>
              <div className="flex flex-col gap-3">
                {deptoData.shap.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between font-label-sm text-xs mb-1 text-slate-700">
                      <span>{item.name}</span>
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

        {/* Mapa Interactivo */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Visor Cartográfico Nacional
              </h3>
              <span className="text-[10px] text-slate-500">Haz clic en los marcadores regionales para consultar el informe dinámico</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <span className="material-symbols-outlined text-sm">map</span> Visualización Satelital
            </div>
          </div>

          <div className="flex-1 w-full h-full min-h-[420px] relative rounded-xl overflow-hidden">
            <PeruInteractiveMap
              departamentos={PERU_DEPARTAMENTOS}
              selectedDeptoKey={selectedDeptoKey}
              onSelectDepto={(key) => setSelectedDeptoKey(key)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
