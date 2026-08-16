'use client';

import React, { useState } from 'react';
import { MATRIZ_ESTACIONAL, PERU_DEPARTAMENTOS } from '../../data/mockData';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface CellDetail {
  depto: string;
  month: string;
  intensity: number;
}

export default function ComparativoRegionalView() {
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);

  const deptosKeys = Object.keys(PERU_DEPARTAMENTOS);
  const [depto1Key, setDepto1Key] = useState<string>('piura');
  const [depto2Key, setDepto2Key] = useState<string>('cusco');

  const depto1 = PERU_DEPARTAMENTOS[depto1Key] || PERU_DEPARTAMENTOS['piura'];
  const depto2 = PERU_DEPARTAMENTOS[depto2Key] || PERU_DEPARTAMENTOS['cusco'];

  const getColorClass = (val: number): string => {
    if (val >= 8) return 'bg-red-500 text-white font-bold cursor-pointer hover:scale-115 hover:shadow-lg transition-all';
    if (val >= 5) return 'bg-amber-400 text-slate-900 font-bold cursor-pointer hover:scale-115 hover:shadow-md transition-all';
    if (val >= 3) return 'bg-sky-200 text-slate-800 font-semibold cursor-pointer hover:scale-115 hover:shadow-sm transition-all';
    return 'bg-slate-100 text-slate-600 font-medium cursor-pointer hover:bg-slate-200 hover:scale-110 transition-all';
  };

  const handleCellClick = (depto: string, monthIdx: number, val: number) => {
    setSelectedCell({
      depto,
      month: MONTH_NAMES[monthIdx] || 'Mes',
      intensity: val
    });
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto relative text-slate-800">
      
      {/* Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700">calendar_month</span>
                {selectedCell.depto} — {selectedCell.month}
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel de Incidencia Histórica</span>
                <span className="text-lg font-extrabold text-slate-900">
                  {selectedCell.intensity >= 8 ? 'Alta Incidencia (Temporada de Riesgo)' : selectedCell.intensity >= 5 ? 'Incidencia Moderada' : 'Incidencia Baja / Normal'}
                </span>
                <span className="block text-sky-700 font-semibold">Índice relativo: {selectedCell.intensity} / 10</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Características Estacionales del Mes:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                  {selectedCell.month === 'Enero' || selectedCell.month === 'Febrero' || selectedCell.month === 'Marzo'
                    ? 'Temporada de lluvias intensas en la sierra y costa norte. Incremento de caudales y monitoreo preventivo de riadas.'
                    : selectedCell.month === 'Junio' || selectedCell.month === 'Julio' || selectedCell.month === 'Agosto'
                    ? 'Descenso de temperaturas y heladas en zonas altas sobre 3,500 m s. n. m., y friajes estacionales en la selva.'
                    : 'Periodo de transición estacional con precipitaciones moderadas y monitoreo continuo.'}
                </p>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-2 bg-sky-700 text-white rounded-xl font-bold text-xs hover:bg-sky-800 transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 border-b border-slate-200 pb-3">
        <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Comparativo Regional y Matriz Estacional</h2>
        <p className="font-body-md text-sm text-slate-600 max-w-3xl">
          Confrontación directa de indicadores clímaticos y presupuestales entre departamentos, junto a la matriz de recurrencia estacional por mes.
        </p>
      </div>

      {/* Side-by-Side Executive Comparator Tool */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">compare_arrows</span>
              </div>
              Comparador Lado a Lado de Departamentos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Selecciona dos regiones para comparar sus datos en tiempo real</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Department 1 Card */}
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/90 hover:border-sky-300 transition-all space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Región A</span>
              <select
                value={depto1Key}
                onChange={(e) => setDepto1Key(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-sky-800 shadow-2xs cursor-pointer outline-none"
              >
                {deptosKeys.map(k => (
                  <option key={k} value={k}>{PERU_DEPARTAMENTOS[k].name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-3">
              <span className="text-2xl font-extrabold text-slate-900">{depto1.name}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${depto1.prob >= 65 ? 'bg-red-600' : 'bg-sky-600'}`}>
                Riesgo {depto1.prob}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergencias Atendidas</span>
                <span className="font-extrabold text-slate-900 text-base">{(depto1.emergencias ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Precipitación 24h</span>
                <span className="font-extrabold text-sky-700 text-base">{depto1.precipitacionMm} mm</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Presupuesto Asignado</span>
                <span className="font-extrabold text-slate-900 text-base">S/ {depto1.pimM}M</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Inversión Ejecutada</span>
                <span className="font-extrabold text-emerald-600 text-base">{depto1.pctEjecucion}%</span>
              </div>
            </div>
          </div>

          {/* Department 2 Card */}
          <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/90 hover:border-sky-300 transition-all space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Región B</span>
              <select
                value={depto2Key}
                onChange={(e) => setDepto2Key(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-sky-800 shadow-2xs cursor-pointer outline-none"
              >
                {deptosKeys.map(k => (
                  <option key={k} value={k}>{PERU_DEPARTAMENTOS[k].name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-baseline justify-between border-b border-slate-200/80 pb-3">
              <span className="text-2xl font-extrabold text-slate-900">{depto2.name}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white uppercase ${depto2.prob >= 65 ? 'bg-red-600' : 'bg-sky-600'}`}>
                Riesgo {depto2.prob}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergencias Atendidas</span>
                <span className="font-extrabold text-slate-900 text-base">{(depto2.emergencias ?? 0).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Precipitación 24h</span>
                <span className="font-extrabold text-sky-700 text-base">{depto2.precipitacionMm} mm</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Presupuesto Asignado</span>
                <span className="font-extrabold text-slate-900 text-base">S/ {depto2.pimM}M</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Inversión Ejecutada</span>
                <span className="font-extrabold text-emerald-600 text-base">{depto2.pctEjecucion}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 flex flex-col gap-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-700">grid_on</span>
          Matriz de Recurrencia e Intensidad Mensual por Departamento
        </h3>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-center border-collapse min-w-[750px]">
            <thead className="sticky top-0 bg-slate-100 shadow-2xs z-10">
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4 text-left">Departamento</th>
                {MONTH_NAMES.map((m, i) => (
                  <th key={i} className="py-3 px-2">{m.substring(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {MATRIZ_ESTACIONAL.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-sky-50/50 transition-colors">
                  <td className="py-2.5 px-4 text-left font-bold text-slate-800">{row.depto}</td>
                  {[row.ene, row.feb, row.mar, row.abr, row.may, row.jun, row.jul, row.ago, row.sep, row.oct, row.nov, row.dic].map((val, mIdx) => (
                    <td key={mIdx} className="py-1.5 px-2">
                      <span
                        onClick={() => handleCellClick(row.depto, mIdx, val)}
                        className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(val)}`}
                        title={`Ver detalle de ${row.depto} en ${MONTH_NAMES[mIdx]}`}
                      >
                        {val}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
