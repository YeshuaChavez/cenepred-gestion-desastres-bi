import React from 'react';
import { TABLAS_MEF_DEPARTAMENTO, PLIEGOS_EJECUTORES } from '../../data/mockData';

export default function PresupuestoMEFView() {
  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Presupuesto MEF PP 0068 (PREVAED)</h2>
        <p className="font-body-md text-sm text-slate-600 max-w-3xl">
          Análisis de ejecución presupuestal del Programa Presupuestal 0068: Reducción de Vulnerabilidad y Atención de Emergencias por Desastres. Identificación de brechas entre riesgo y ejecución.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">PIM Total Asignado</span>
            <span className="material-symbols-outlined text-primary">account_balance</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ 2.4B</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> +5.2% vs PIA
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Ejecución Acumulada</span>
            <span className="material-symbols-outlined text-secondary">trending_up</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ 1.1B</span>
            <span className="text-xs font-semibold text-slate-600">45.8% Avance</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
            <div className="bg-secondary h-full rounded-full" style={{ width: '45.8%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Brecha Meta Anual</span>
            <span className="material-symbols-outlined text-red-600">warning</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-red-600">S/ 850M</span>
            <span className="text-xs font-medium text-slate-500">Para alcanzar meta 80%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Proyección Cierre</span>
            <span className="material-symbols-outlined text-primary">analytics</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">72%</span>
            <span className="text-xs font-semibold text-primary">Basado en ritmo actual</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="font-title-md text-base font-bold text-slate-900">Ejecución vs Riesgo por Departamento</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 rounded-full font-label-sm text-xs text-slate-600 font-semibold hover:bg-slate-200">Gobierno Regional</button>
              <button className="px-3 py-1 bg-primary text-white rounded-full font-label-sm text-xs font-semibold">Gobierno Local</button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Departamento</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">PIM (Millones S/)</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Ejecución (%)</th>
                  <th className="py-3 px-4 font-label-sm text-xs text-slate-500 uppercase font-semibold">Nivel Riesgo SAT</th>
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
                          <div className={`h-full rounded-full ${row.pct < 30 ? 'bg-red-500' : row.pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${row.pct}%` }}></div>
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

          <div className="mt-2 p-4 bg-red-50 text-red-900 rounded-xl flex gap-3 items-start border border-red-200 shadow-sm">
            <span className="material-symbols-outlined text-red-600 mt-0.5">notification_important</span>
            <div>
              <h4 className="font-title-md text-sm font-bold text-red-900">Alerta de Desempeño Crítico</h4>
              <p className="font-body-md text-xs text-red-800 mt-1">
                3 regiones del norte (Piura, Lambayeque, Tumbes) concentran el 40% del riesgo proyectado para el próximo trimestre, pero muestran una ejecución promedio inferior al 25% del PIM asignado para emergencias.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-6">
          <h3 className="font-title-md text-base font-bold text-slate-900">Top Ejecutores (Pliego)</h3>
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

          <div className="mt-auto pt-4">
            <button className="w-full py-2.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-label-sm text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">download</span> Descargar Reporte Completo (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
