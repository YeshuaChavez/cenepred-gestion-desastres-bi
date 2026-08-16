'use client';

import React, { useState } from 'react';
import { TABLAS_MEF_DEPARTAMENTO, PLIEGOS_EJECUTORES, NATIONAL_META } from '../../data/mockData';

export default function PresupuestoMEFView() {
  const [selectedPliego, setSelectedPliego] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<boolean>(false);

  const filteredTabla = selectedPliego
    ? TABLAS_MEF_DEPARTAMENTO.filter(r => r.depto.toLowerCase().includes(selectedPliego.toLowerCase()))
    : TABLAS_MEF_DEPARTAMENTO;

  const handleExportMEFCSV = () => {
    const headers = ["Departamento", "Presupuesto Asignado (S/ Millones)", "Inversión Ejecutada (S/ Millones)", "Avance (%)", "Nivel Riesgo"];
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
    link.setAttribute("download", `Reporte_Presupuesto_Prevencion_CENEPRED_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto relative text-slate-800">
      
      {/* Toast Feedback */}
      {exportToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>Reporte presupuestal descargado correctamente (CSV).</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-2">
        <div>
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Presupuesto de Prevención de Desastres</h2>
          <p className="font-body-md text-sm text-slate-600 max-w-3xl mt-1">
            Consulta la transparencia en la asignación y ejecución del presupuesto estatal destinado a proteger a la población ante emergencias.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportMEFCSV}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-label-sm text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 font-semibold cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Presupuesto CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Presupuesto Asignado</span>
            <span className="material-symbols-outlined text-sky-700">account_balance</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ {NATIONAL_META.totalPimMillones}M</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> Fondos de Prevención Nacional
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Inversión Ejecutada</span>
            <span className="material-symbols-outlined text-emerald-600">trending_up</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ {NATIONAL_META.totalDevengadoMillones}M</span>
            <span className="text-xs font-semibold text-slate-600">{NATIONAL_META.pctEjecucionNacional}% Avance Nacional</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200/90 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Fondo Pendiente</span>
            <span className="material-symbols-outlined text-red-600">warning</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-red-600">
              S/ {roundNum(NATIONAL_META.totalPimMillones - NATIONAL_META.totalDevengadoMillones)}M
            </span>
            <span className="text-xs font-medium text-slate-500">Saldo por invertir antes de fin de año</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xs border border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Regiones Monitoreadas</span>
            <span className="material-symbols-outlined text-sky-700">analytics</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">{NATIONAL_META.totalDepartamentos}</span>
            <span className="text-xs font-semibold text-sky-700">Cobertura Nacional 100%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 flex flex-col gap-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600">payments</span>
              Ejecución Presupuestal por Departamento
            </h3>
            {selectedPliego && (
              <button
                onClick={() => setSelectedPliego(null)}
                className="text-xs font-bold text-sky-700 hover:underline cursor-pointer"
              >
                Limpiar filtro regional
              </button>
            )}
          </div>

          <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-slate-100 shadow-2xs z-10">
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4 font-semibold">Departamento</th>
                  <th className="py-3 px-4 font-semibold">Asignado (Millones)</th>
                  <th className="py-3 px-4 font-semibold">Avance (%)</th>
                  <th className="py-3 px-4 font-semibold">Nivel Riesgo</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-800 font-medium">
                {filteredTabla.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.depto}</td>
                    <td className="py-3.5 px-4 font-semibold">{row.pim}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold w-12">{row.ejec}</span>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${row.pct < 30 ? 'bg-red-500' : row.pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, row.pct)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.riesgo === 'Muy Alto' ? 'bg-red-100 text-red-700' : row.riesgo === 'Alto' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
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

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 flex flex-col gap-6">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-700">stars</span>
            Principales Gobiernos Regionales Ejecutores
          </h3>
          <p className="text-xs text-slate-500 font-medium">Haz clic en un gobierno regional para filtrar la tabla de departamentos:</p>
          <div className="flex flex-col gap-3">
            {PLIEGOS_EJECUTORES.map((pliego, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPliego(pliego.nombre.replace("GOBIERNO REGIONAL DE ", ""))}
                className="flex flex-col gap-1.5 p-3 rounded-2xl border border-slate-100 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={pliego.isAlert ? 'text-red-600 font-bold group-hover:underline' : 'text-slate-700 group-hover:text-sky-800'}>{pliego.nombre}</span>
                  <span className="text-slate-900 font-extrabold">{pliego.monto}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-500 ${pliego.color}`} style={{ width: `${pliego.pct}%` }}></div>
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
