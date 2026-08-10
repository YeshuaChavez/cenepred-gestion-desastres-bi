import React from 'react';

interface RegionMatrixRow {
  depto: string;
  ene: number;
  feb: number;
  mar: number;
  abr: number;
  may: number;
  jun: number;
  jul: number;
  ago: number;
  sep: number;
  oct: number;
  nov: number;
  dic: number;
}

export default function ComparativoRegionalView() {
  const REGIONES_MATRIX: RegionMatrixRow[] = [
    { depto: "Piura", ene: 8, feb: 9, mar: 10, abr: 7, may: 4, jun: 2, jul: 1, ago: 2, sep: 3, oct: 5, nov: 6, dic: 8 },
    { depto: "Tumbes", ene: 9, feb: 10, mar: 9, abr: 6, may: 3, jun: 1, jul: 1, ago: 1, sep: 2, oct: 4, nov: 5, dic: 7 },
    { depto: "Lambayeque", ene: 7, feb: 8, mar: 9, abr: 6, may: 3, jun: 2, jul: 1, ago: 1, sep: 2, oct: 4, nov: 5, dic: 6 },
    { depto: "Apurímac", ene: 4, feb: 5, mar: 6, abr: 5, may: 7, jun: 8, jul: 9, ago: 10, sep: 8, oct: 6, nov: 5, dic: 4 },
    { depto: "Cusco", ene: 5, feb: 6, mar: 6, abr: 4, may: 6, jun: 8, jul: 9, ago: 9, sep: 7, oct: 5, nov: 4, dic: 5 },
    { depto: "Lima", ene: 6, feb: 7, mar: 8, abr: 5, may: 3, jun: 2, jul: 2, ago: 2, sep: 3, oct: 4, nov: 4, dic: 5 }
  ];

  const getColorClass = (val: number): string => {
    if (val >= 8) return 'bg-red-500 text-white font-bold';
    if (val >= 5) return 'bg-amber-400 text-slate-900 font-semibold';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Comparativo Regional & Heatmap Estacional</h2>
        <p className="font-body-md text-sm text-slate-600 max-w-3xl">
          Matriz de recurrencia e intensidad de emergencias climáticas por Departamento × Mes (2012-2023).
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
        <h3 className="font-title-md text-base font-bold text-slate-900">Heatmap: Recurrencia e Intensidad Mensual (1 a 10)</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-4 text-left">Departamento</th>
                <th className="py-3 px-2">Ene</th>
                <th className="py-3 px-2">Feb</th>
                <th className="py-3 px-2">Mar</th>
                <th className="py-3 px-2">Abr</th>
                <th className="py-3 px-2">May</th>
                <th className="py-3 px-2">Jun</th>
                <th className="py-3 px-2">Jul</th>
                <th className="py-3 px-2">Ago</th>
                <th className="py-3 px-2">Sep</th>
                <th className="py-3 px-2">Oct</th>
                <th className="py-3 px-2">Nov</th>
                <th className="py-3 px-2">Dic</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {REGIONES_MATRIX.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-left font-bold text-slate-800">{row.depto}</td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.ene)}`}>{row.ene}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.feb)}`}>{row.feb}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.mar)}`}>{row.mar}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.abr)}`}>{row.abr}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.may)}`}>{row.may}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.jun)}`}>{row.jun}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.jul)}`}>{row.jul}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.ago)}`}>{row.ago}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.sep)}`}>{row.sep}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.oct)}`}>{row.oct}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.nov)}`}>{row.nov}</span></td>
                  <td className="py-2 px-2"><span className={`inline-block w-8 py-1 rounded text-xs ${getColorClass(row.dic)}`}>{row.dic}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
