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

  // Métricas del comparador. `higherIsWorse` solo se usa para el texto del resumen.
  const metrics: { label: string; a: number; b: number; fmt: (v: number) => string; higherIsWorse: boolean }[] = [
    { label: 'Riesgo predictivo', a: depto1.prob, b: depto2.prob, fmt: v => `${v}%`, higherIsWorse: true },
    { label: 'Emergencias históricas', a: depto1.emergencias ?? 0, b: depto2.emergencias ?? 0, fmt: v => v.toLocaleString(), higherIsWorse: true },
    { label: 'Precipitación 24h', a: depto1.precipitacionMm ?? 0, b: depto2.precipitacionMm ?? 0, fmt: v => `${v} mm`, higherIsWorse: true },
    { label: 'Focos de calor', a: depto1.focosCalor ?? 0, b: depto2.focosCalor ?? 0, fmt: v => v.toLocaleString(), higherIsWorse: true },
    { label: 'Sismos (7 días)', a: depto1.sismos7d ?? 0, b: depto2.sismos7d ?? 0, fmt: v => `${v}`, higherIsWorse: true },
    { label: 'Presupuesto asignado', a: depto1.pimM ?? 0, b: depto2.pimM ?? 0, fmt: v => `S/ ${v}M`, higherIsWorse: false },
    { label: 'Avance de ejecución', a: depto1.pctEjecucion ?? 0, b: depto2.pctEjecucion ?? 0, fmt: v => `${v}%`, higherIsWorse: false },
  ];

  const riskBadgeClass = (prob: number): string =>
    prob >= 55 ? 'bg-red-600' : prob >= 45 ? 'bg-amber-500' : 'bg-emerald-600';

  const getColorClass = (val: number): string => {
    if (val >= 8) return 'bg-red-500 text-white font-bold cursor-pointer hover:scale-115 hover:shadow-lg transition-all';
    if (val >= 5) return 'bg-amber-400 text-slate-900 font-bold cursor-pointer hover:scale-115 hover:shadow-md transition-all';
    if (val >= 3) return 'bg-sky-200 dark:bg-sky-900 dark:text-sky-200 text-slate-800 font-semibold cursor-pointer hover:scale-115 hover:shadow-sm transition-all';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-110 transition-all';
  };

  const handleCellClick = (depto: string, monthIdx: number, val: number) => {
    setSelectedCell({
      depto,
      month: MONTH_NAMES[monthIdx] || 'Mes',
      intensity: val
    });
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto relative text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">calendar_month</span>
                {selectedCell.depto} • {selectedCell.month}
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Nivel de Incidencia Histórica</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedCell.intensity >= 8 ? 'Alta Incidencia (Temporada de Riesgo)' : selectedCell.intensity >= 5 ? 'Incidencia Moderada' : 'Incidencia Baja / Normal'}
                </span>
                <span className="block text-sky-600 dark:text-sky-400 font-semibold">Índice relativo: {selectedCell.intensity} / 10</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-white block">Características Estacionales del Mes:</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed font-medium">
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
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 transition-colors">
        <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Comparativo Regional y Matriz Estacional</h2>
        <p className="font-body-md text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1">
          Compara lado a lado dos departamentos para evaluar su nivel de riesgo, lluvias registradas y el uso del presupuesto preventivo.
        </p>
      </div>

      {/* Side-by-Side Executive Comparator Tool */}
      <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 flex flex-col gap-6 transition-colors">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">compare_arrows</span>
              </div>
              Comparador Lado a Lado de Departamentos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Selecciona dos regiones para comparar sus datos en tiempo real</p>
          </div>
        </div>

        {/* Selectores A / B con acento por región */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 sm:gap-4">
          <div className="rounded-2xl border-2 border-sky-200 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/30 p-3 sm:p-4 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">Región A</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${riskBadgeClass(depto1.prob)}`}>Riesgo {depto1.prob}%</span>
            </div>
            <select
              value={depto1Key}
              onChange={(e) => setDepto1Key(e.target.value)}
              className="w-full bg-white dark:bg-[#0c1833] border border-sky-300 dark:border-sky-800 rounded-xl px-2 sm:px-3 py-2 text-sm font-extrabold text-sky-900 dark:text-sky-200 shadow-2xs cursor-pointer outline-none truncate"
            >
              {deptosKeys.map(k => (
                <option key={k} value={k} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">{PERU_DEPARTAMENTOS[k].name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[11px] font-extrabold shadow-md shrink-0">VS</div>
          </div>

          <div className="rounded-2xl border-2 border-violet-200 dark:border-violet-900/70 bg-violet-50/60 dark:bg-violet-950/30 p-3 sm:p-4 flex flex-col gap-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">Región B</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0 ${riskBadgeClass(depto2.prob)}`}>Riesgo {depto2.prob}%</span>
            </div>
            <select
              value={depto2Key}
              onChange={(e) => setDepto2Key(e.target.value)}
              className="w-full bg-white dark:bg-[#0c1833] border border-violet-300 dark:border-violet-800 rounded-xl px-2 sm:px-3 py-2 text-sm font-extrabold text-violet-900 dark:text-violet-200 shadow-2xs cursor-pointer outline-none truncate"
            >
              {deptosKeys.map(k => (
                <option key={k} value={k} className="bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white">{PERU_DEPARTAMENTOS[k].name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filas de comparación con barras divergentes (la barra más larga = valor mayor) */}
        <div className="flex flex-col gap-3.5 mt-1">
          {metrics.map((m, i) => {
            const max = Math.max(m.a, m.b) || 1;
            const aPct = m.a > 0 ? Math.max(3, (m.a / max) * 100) : 0;
            const bPct = m.b > 0 ? Math.max(3, (m.b / max) * 100) : 0;
            const aLead = m.a > m.b;
            const bLead = m.b > m.a;
            return (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-center text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{m.label}</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`w-14 sm:w-24 text-right text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${aLead ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`}>{m.fmt(m.a)}</span>
                  <div className="flex-1 flex justify-end min-w-0">
                    <div className={`h-2.5 rounded-l-full transition-all duration-500 ${aLead ? 'bg-sky-500' : 'bg-sky-500/40'}`} style={{ width: `${aPct}%` }}></div>
                  </div>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                  <div className="flex-1 flex justify-start min-w-0">
                    <div className={`h-2.5 rounded-r-full transition-all duration-500 ${bLead ? 'bg-violet-500' : 'bg-violet-500/40'}`} style={{ width: `${bPct}%` }}></div>
                  </div>
                  <span className={`w-14 sm:w-24 text-left text-xs sm:text-sm font-extrabold tabular-nums shrink-0 ${bLead ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}>{m.fmt(m.b)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl py-2.5 px-3 border border-slate-100 dark:border-slate-800">
          <span className="font-bold text-sky-600 dark:text-sky-400">{depto1.name}</span> tiene {depto1.prob >= depto2.prob ? 'mayor' : 'menor'} riesgo predictivo que <span className="font-bold text-violet-600 dark:text-violet-400">{depto2.name}</span> ({depto1.prob}% vs {depto2.prob}%). Cada barra es proporcional al valor más alto de su fila.
        </div>
      </div>

      <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 flex flex-col gap-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">grid_on</span>
              Matriz de Recurrencia e Intensidad Mensual por Departamento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Índice relativo 1 a 10 de emergencias por mes (respecto al mes pico de cada departamento). Toca una celda para el detalle.</p>
          </div>
          {/* Leyenda de la escala de color */}
          <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></span>1-2</span>
            <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-sky-200 dark:bg-sky-900"></span>3-4</span>
            <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-amber-400"></span>5-7</span>
            <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded bg-red-500"></span>8-10</span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-center border-collapse min-w-[750px]">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 shadow-2xs z-10">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                <th className="py-3 px-4 text-left">Departamento</th>
                {MONTH_NAMES.map((m, i) => (
                  <th key={i} className="py-3 px-2">{m.substring(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {MATRIZ_ESTACIONAL.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors">
                  <td className="py-2.5 px-4 text-left font-bold text-slate-800 dark:text-slate-200">{row.depto}</td>
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
