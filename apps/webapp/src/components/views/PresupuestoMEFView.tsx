import React, { useState } from 'react';
import { TABLAS_MEF_DEPARTAMENTO, PLIEGOS_EJECUTORES, NATIONAL_META } from '../../data/mockData';

export default function PresupuestoMEFView() {
  const [selectedPliego, setSelectedPliego] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<boolean>(false);

  const filteredTabla = selectedPliego
    ? TABLAS_MEF_DEPARTAMENTO.filter(r => r.depto.toLowerCase().includes(selectedPliego.toLowerCase()))
    : TABLAS_MEF_DEPARTAMENTO;

  const handleExportMEFCSV = () => {
    const headers = ["Departamento", "PIM (S/ Millones)", "Devengado (S/ Millones)", "Ejecución (%)", "Nivel Riesgo"];
    const rows = TABLAS_MEF_DEPARTAMENTO.map(r => [
      `"${r.depto}"`,
      r.pim,
      r.ejec,
      r.pct,
      `"${r.riesgo}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Ejecucion_MEF_PP0068_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto relative">
      
      {/* Toast Feedback */}
      {exportToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>Reporte Presupuestal MEF descargado (CSV).</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Presupuesto MEF PP 0068 (PREVAED)</h2>
          <p className="font-body-md text-sm text-slate-600 max-w-3xl">
            Análisis de ejecución presupuestal del Programa Presupuestal 0068: Reducción de Vulnerabilidad y Atención de Emergencias por Desastres para las 25 regiones del Perú.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportMEFCSV}
            className="px-5 py-2 bg-emerald-700 text-white font-label-sm text-xs rounded-lg shadow-xs hover:bg-emerald-800 transition-colors flex items-center gap-2 font-semibold cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Presupuesto CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">PIM Total Asignado</span>
            <span className="material-symbols-outlined text-sky-700">account_balance</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ {NATIONAL_META.totalPimMillones}M</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> Programa Presupuestal MEF
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Ejecución Acumulada</span>
            <span className="material-symbols-outlined text-sky-700">trending_up</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ {NATIONAL_META.totalDevengadoMillones}M</span>
            <span className="text-xs font-semibold text-slate-600">{NATIONAL_META.pctEjecucionNacional}% Avance Global</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Brecha por Ejecutar</span>
            <span className="material-symbols-outlined text-red-600">warning</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-red-600">
              S/ {roundNum(NATIONAL_META.totalPimMillones - NATIONAL_META.totalDevengadoMillones)}M
            </span>
            <span className="text-xs font-medium text-slate-500">Pendiente de devengado</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Regiones Atendidas</span>
            <span className="material-symbols-outlined text-sky-700">analytics</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">{NATIONAL_META.totalDepartamentos}</span>
            <span className="text-xs font-semibold text-sky-700">Departamentos Monitoreados</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-title-md text-base font-bold text-slate-900">Ejecución Presupuestal por Departamento</h3>
            {selectedPliego && (
              <button
                onClick={() => setSelectedPliego(null)}
                className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
              >
                Limpiar filtro de pliego
              </button>
            )}
          </div>

          <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-slate-100 shadow-xs z-10">
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Departamento</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">PIM (Millones)</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Ejecución (%)</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Nivel Riesgo</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-sm text-slate-800">
                {filteredTabla.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold">{row.depto}</td>
                    <td className="py-3.5 px-4 font-medium">{row.pim}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold w-12">{row.ejec}</span>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5">
                          <div className={`h-full rounded-full ${row.pct < 30 ? 'bg-red-500' : row.pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, row.pct)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-semibold ${row.riesgo === 'Muy Alto' ? 'bg-red-100 text-red-700' : row.riesgo === 'Alto' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {row.riesgo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="material-symbols-outlined text-sm" style={{ color: row.pct < 30 ? '#ef4444' : '#10b981' }}>{row.estado}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-6">
          <h3 className="font-title-md text-base font-bold text-slate-900">Top Pliegos Ejecutores</h3>
          <p className="text-xs text-slate-500 font-medium">Haz clic en un pliego para filtrar los departamentos asociados:</p>
          <div className="flex flex-col gap-4">
            {PLIEGOS_EJECUTORES.map((pliego, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPliego(pliego.nombre.replace("GOBIERNO REGIONAL DE ", ""))}
                className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={pliego.isAlert ? 'text-red-600 font-bold' : 'text-slate-700'}>{pliego.nombre}</span>
                  <span className="text-slate-500 font-bold">{pliego.monto}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${pliego.color}`} style={{ width: `${pliego.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function roundNum(num: number): string {
  return (Math.round(num * 10) / 10).toFixed(1);
}
