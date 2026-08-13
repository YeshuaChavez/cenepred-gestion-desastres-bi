import React, { useState } from 'react';
import { MATRIZ_ESTACIONAL } from '../../data/mockData';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface CellDetail {
  depto: string;
  month: string;
  intensity: number;
}

export default function ComparativoRegionalView() {
  const [selectedCell, setSelectedCell] = useState<CellDetail | null>(null);

  const getColorClass = (val: number): string => {
    if (val >= 8) return 'bg-red-500 text-white font-bold cursor-pointer hover:scale-110 transition-transform shadow-xs';
    if (val >= 5) return 'bg-amber-400 text-slate-900 font-semibold cursor-pointer hover:scale-110 transition-transform';
    if (val >= 3) return 'bg-sky-200 text-slate-800 font-medium cursor-pointer hover:scale-110 transition-transform';
    return 'bg-slate-100 text-slate-600 cursor-pointer hover:bg-slate-200';
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700">calendar_month</span>
                {selectedCell.depto} — {selectedCell.month}
              </h3>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nivel de Recurrencia Histórica</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {selectedCell.intensity >= 8 ? 'Intensidad Crítica (Pico Anual)' : selectedCell.intensity >= 5 ? 'Intensidad Moderada - Alta' : 'Intensidad Baja / Normal'}
                </span>
                <span className="block text-sky-700 font-semibold">Índice relativo: {selectedCell.intensity} / 10</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Fenómenos Recurrentes en este mes:</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {selectedCell.month === 'Enero' || selectedCell.month === 'Febrero' || selectedCell.month === 'Marzo'
                    ? 'Precipitaciones intensas por temporada de lluvias en la sierra y costa norte. Riesgo de inundaciones y desbordes de ríos.'
                    : selectedCell.month === 'Junio' || selectedCell.month === 'Julio' || selectedCell.month === 'Agosto'
                    ? 'Temporada de heladas en zonas sobre los 3,500 m s. n. m. e incremento de friajes en la selva sur.'
                    : 'Transición estacional con eventos focalizados de vientos fuertes y lluvias moderadas.'}
                </p>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-4 py-2 bg-sky-700 text-white rounded-lg font-bold text-xs hover:bg-sky-800 transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 border-b border-slate-200 pb-3">
        <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Comparativo Regional y Matriz Estacional</h2>
        <p className="font-body-md text-sm text-slate-600 max-w-3xl">
          Matriz de recurrencia e intensidad de emergencias climáticas por departamento y mes basada en 84,369 eventos históricos. Haz clic en cualquier celda para consultar la ficha mensual.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
        <h3 className="font-title-md text-base font-bold text-slate-900">Recurrencia e Intensidad Mensual por Departamento</h3>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-center border-collapse min-w-[750px]">
            <thead className="sticky top-0 bg-slate-100 shadow-xs z-10">
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4 text-left">Departamento</th>
                {MONTH_NAMES.map((m, i) => (
                  <th key={i} className="py-3 px-2">{m.substring(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {MATRIZ_ESTACIONAL.map((row: any, idx: number) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
