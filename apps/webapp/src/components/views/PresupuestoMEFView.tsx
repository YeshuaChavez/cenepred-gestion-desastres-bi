'use client';

import React, { useState } from 'react';
import { TABLAS_MEF_DEPARTAMENTO, PLIEGOS_EJECUTORES, NATIONAL_META, PERU_DEPARTAMENTOS } from '../../data/mockData';

export default function PresupuestoMEFView() {
  const [selectedPliego, setSelectedPliego] = useState<string | null>(null);
  const [executionFilter, setExecutionFilter] = useState<'all' | 'high' | 'low' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegionDetail, setSelectedRegionDetail] = useState<typeof TABLAS_MEF_DEPARTAMENTO[0] | null>(null);
  const [exportToast, setExportToast] = useState<boolean>(false);

  // Filter Table Data dynamically by Search Term, Pliego, and Execution Status
  const filteredTabla = TABLAS_MEF_DEPARTAMENTO.filter(r => {
    // 1. Pliego filter
    if (selectedPliego && !r.depto.toLowerCase().includes(selectedPliego.toLowerCase())) {
      return false;
    }
    // 2. Search term filter
    if (searchTerm && !r.depto.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // 3. Execution / Risk status filter
    if (executionFilter === 'high' && r.pct < 50) return false;
    if (executionFilter === 'low' && r.pct >= 50) return false;
    if (executionFilter === 'critical' && r.riesgo !== 'Muy Alto') return false;

    return true;
  });

  const handleExportMEFCSV = () => {
    const headers = ["Departamento", "Presupuesto Asignado (S/ Millones)", "Inversión Ejecutada (S/ Millones)", "Avance (%)", "Nivel Riesgo"];
    const rows = filteredTabla.map(r => [
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

  const clearAllFilters = () => {
    setSelectedPliego(null);
    setExecutionFilter('all');
    setSearchTerm('');
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

      {/* Region Budget Detail Modal */}
      {selectedRegionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 w-full max-w-xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest block">Detalle Presupuestal Oficial</span>
                <h3 className="font-display-lg text-2xl font-extrabold text-slate-900">{selectedRegionDetail.depto}</h3>
              </div>
              <button
                onClick={() => setSelectedRegionDetail(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-3 py-1.5 bg-slate-100 rounded-xl cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block mb-1">PIM (Presupuesto Asignado)</span>
                <span className="text-2xl font-extrabold text-slate-900">S/ {selectedRegionDetail.pim} Millones</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-semibold block mb-1">Inversión Ejecutada</span>
                <span className="text-2xl font-extrabold text-emerald-900">S/ {selectedRegionDetail.ejec} Millones</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-xs text-amber-800 font-semibold block mb-1">Avance Financiero</span>
                <span className="text-2xl font-extrabold text-amber-900">{selectedRegionDetail.pct}%</span>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
                <span className="text-xs text-red-800 font-semibold block mb-1">Nivel de Riesgo Climático</span>
                <span className="text-2xl font-extrabold text-red-900">{selectedRegionDetail.riesgo}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700 text-sm">build</span>
                Obras Prioritarias de Prevención en {selectedRegionDetail.depto}
              </h4>
              <ul className="space-y-1.5 text-slate-600 font-medium pl-1">
                <li>• Descolmatación y limpieza de cauces de ríos principales.</li>
                <li>• Construcción y reforzamiento de defensas ribereñas.</li>
                <li>• Mantenimiento de diques y quebradas ante temporadas de lluvia.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRegionDetail(null)}
                className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
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

      {/* Interactive Metric Cards (Acts as instant Table Filters) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Card 1: All Budget */}
        <div
          onClick={() => {
            setExecutionFilter('all');
            setSelectedPliego(null);
          }}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'all' && !selectedPliego
              ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/90 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para ver todas las regiones"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-sky-700 transition-colors">Presupuesto Asignado</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-700 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ {NATIONAL_META.totalPimMillones}M</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> Fondos de Prevención Nacional
            </span>
          </div>
        </div>

        {/* Card 2: High Execution Filter */}
        <div
          onClick={() => setExecutionFilter('high')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'high'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones con avance >50%"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-emerald-700 transition-colors">Inversión Ejecutada</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">S/ {NATIONAL_META.totalDevengadoMillones}M</span>
            <span className="text-xs font-semibold text-slate-600">{NATIONAL_META.pctEjecucionNacional}% Avance Nacional</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}></div>
          </div>
        </div>

        {/* Card 3: Low / Pending Budget Filter */}
        <div
          onClick={() => setExecutionFilter('low')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'low'
              ? 'bg-red-50/80 border-red-400 ring-2 ring-red-500/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/90 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones con avance pendiente (<50%)"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-red-700 transition-colors">Fondo Pendiente</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">warning</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-red-600">
              S/ {roundNum(NATIONAL_META.totalPimMillones - NATIONAL_META.totalDevengadoMillones)}M
            </span>
            <span className="text-xs font-medium text-slate-500">Filtrar saldo pendiente por ejecutar</span>
          </div>
        </div>

        {/* Card 4: Critical Risk Filter */}
        <div
          onClick={() => setExecutionFilter('critical')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'critical'
              ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-md -translate-y-0.5'
              : 'bg-white border-slate-200/90 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones en riesgo Muy Alto"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold group-hover:text-purple-700 transition-colors">Regiones en Riesgo Crítico</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">analytics</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">{NATIONAL_META.totalDepartamentos}</span>
            <span className="text-xs font-semibold text-purple-700">Filtrar Riesgo Muy Alto</span>
          </div>
        </div>

      </div>

      {/* Table Controls & Filter Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table Container */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 flex flex-col gap-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">payments</span>
                Ejecución Presupuestal por Departamento
              </h3>
              <p className="text-xs text-slate-500">Haz clic en cualquier departamento para ver el detalle técnico completo</p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar región..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 pl-9 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 flex-wrap text-xs font-bold">
            <div className="flex items-center gap-1 overflow-x-auto">
              <span className="text-slate-500 font-semibold px-2 text-[11px]">Filtrar por:</span>
              <button
                onClick={() => setExecutionFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Todas las Regiones ({TABLAS_MEF_DEPARTAMENTO.length})
              </button>
              <button
                onClick={() => setExecutionFilter('high')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'high' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Avance &gt;50%
              </button>
              <button
                onClick={() => setExecutionFilter('low')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'low' ? 'bg-white text-red-600 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Avance &lt;50%
              </button>
              <button
                onClick={() => setExecutionFilter('critical')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'critical' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Riesgo Muy Alto
              </button>
            </div>

            {(selectedPliego || executionFilter !== 'all' || searchTerm) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-sky-700 hover:underline px-2 cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">filter_alt_off</span> Limpiar Filtros
              </button>
            )}
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-slate-100 shadow-2xs z-10">
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4 font-semibold">Departamento</th>
                  <th className="py-3 px-4 font-semibold">Asignado (S/ M)</th>
                  <th className="py-3 px-4 font-semibold">Inversión (S/ M)</th>
                  <th className="py-3 px-4 font-semibold">Avance (%)</th>
                  <th className="py-3 px-4 font-semibold">Nivel Riesgo</th>
                  <th className="py-3 px-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-800 font-medium divide-y divide-slate-100">
                {filteredTabla.length > 0 ? (
                  filteredTabla.map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRegionDetail(row)}
                      className="hover:bg-sky-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-sky-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-sky-700 text-sm">location_on</span>
                        {row.depto}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">S/ {row.pim}M</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">S/ {row.ejec}M</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold w-10">{row.pct}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${row.pct < 30 ? 'bg-red-500' : row.pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, row.pct)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.riesgo === 'Muy Alto' ? 'bg-red-100 text-red-700' : row.riesgo === 'Alto' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {row.riesgo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-xs font-bold text-sky-700 group-hover:underline flex items-center justify-center gap-1">
                          Ver Detalle <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold text-xs">
                      No se encontraron departamentos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Pliegos Regionales Selector */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-700">stars</span>
              Principales Gobiernos Regionales
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Haz clic en cualquier gobierno regional para filtrar la tabla al instante:
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {PLIEGOS_EJECUTORES.map((pliego, idx) => {
              const deptoName = pliego.nombre.replace("GOBIERNO REGIONAL DE ", "");
              const isSelected = selectedPliego?.toLowerCase() === deptoName.toLowerCase();

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedPliego(null);
                    } else {
                      setSelectedPliego(deptoName);
                    }
                  }}
                  className={`flex flex-col gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20 font-bold shadow-xs'
                      : 'border-slate-100 hover:border-sky-300 hover:bg-sky-50/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={pliego.isAlert ? 'text-red-600 font-bold group-hover:underline' : 'text-slate-800 group-hover:text-sky-800'}>
                      {pliego.nombre}
                    </span>
                    <span className="text-slate-900 font-extrabold">{pliego.monto}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-500 ${pliego.color}`} style={{ width: `${pliego.pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

function roundNum(num: number): string {
  return (Math.round(num * 10) / 10).toFixed(1);
}
