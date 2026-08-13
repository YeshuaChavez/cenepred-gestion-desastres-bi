import React from 'react';
import { TABLAS_MEF_DEPARTAMENTO, PLIEGOS_EJECUTORES, NATIONAL_META } from '../../data/mockData';

export default function PresupuestoMEFView() {
  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-3">
        <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Presupuesto MEF PP 0068 (PREVAED)</h2>
        <p className="font-body-md text-sm text-slate-600 max-w-3xl">
          Análisis de ejecución presupuestal del Programa Presupuestal 0068: Reducción de Vulnerabilidad y Atención de Emergencias por Desastres para las 25 regiones del Perú.
        </p>
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
                {TABLAS_MEF_DEPARTAMENTO.map((row, idx) => (
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
          <div className="flex flex-col gap-4">
            {PLIEGOS_EJECUTORES.map((pliego, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={pliego.isAlert ? 'text-red-600 font-bold' : 'text-slate-700'}>{pliego.nombre}</span>
                  <span className="text-slate-500">{pliego.monto}</span>
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
