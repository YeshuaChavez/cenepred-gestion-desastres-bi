'use client';

import React, { useState } from 'react';
import { TABLAS_MEF_DEPARTAMENTO, PLIEGOS_EJECUTORES, NATIONAL_META } from '../../data/mockData';

export default function PresupuestoMEFView() {
  const [selectedPliego, setSelectedPliego] = useState<string | null>(null);
  const [executionFilter, setExecutionFilter] = useState<'all' | 'high_assigned' | 'high' | 'low' | 'critical'>('all');
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
    if (executionFilter === 'high_assigned' && parsePim(r.pim) < 500) return false;
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
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto relative text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Toast Feedback */}
      {exportToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in text-xs font-semibold border border-slate-700">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>Reporte presupuestal descargado correctamente (CSV).</span>
        </div>
      )}

      {/* Region Budget Detail Modal */}
      {selectedRegionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
              <div>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">Detalle Presupuestal Oficial</span>
                <h3 className="font-display-lg text-2xl font-extrabold text-slate-900 dark:text-white">{selectedRegionDetail.depto}</h3>
              </div>
              <button
                onClick={() => setSelectedRegionDetail(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block mb-1">PIM (Presupuesto Asignado)</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">S/ {selectedRegionDetail.pim} Millones</span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block mb-1">Inversión Ejecutada</span>
                <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200">S/ {selectedRegionDetail.ejec} Millones</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block mb-1">Avance Financiero</span>
                <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200">{selectedRegionDetail.pct}%</span>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/60 rounded-2xl border border-red-200 dark:border-red-800/50">
                <span className="text-xs text-red-800 dark:text-red-300 font-semibold block mb-1">Nivel de Riesgo Climático</span>
                <span className="text-2xl font-extrabold text-red-900 dark:text-red-200">{selectedRegionDetail.riesgo}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 text-sm">build</span>
                Obras Prioritarias de Prevención en {selectedRegionDetail.depto}
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 font-medium pl-1">
                <li>• Descolmatación y limpieza de cauces de ríos principales.</li>
                <li>• Construcción y reforzamiento de defensas ribereñas.</li>
                <li>• Mantenimiento de diques y quebradas ante temporadas de lluvia.</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRegionDetail(null)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-2 transition-colors">
        <div>
          <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Presupuesto de Prevención de Desastres</h2>
          <p className="font-body-md text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1">
            Consulta la transparencia en la asignación y ejecución del presupuesto estatal destinado a proteger a la población ante emergencias.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportMEFCSV}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-label-sm text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 font-semibold cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">download</span> Exportar Presupuesto CSV
          </button>
        </div>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Card 1: High Assigned Budget Filter */}
        <div
          onClick={() => setExecutionFilter(executionFilter === 'high_assigned' ? 'all' : 'high_assigned')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'high_assigned'
              ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-400 ring-2 ring-sky-500/20 shadow-md -translate-y-0.5'
              : 'bg-white dark:bg-[#0c1833] border-slate-200/90 dark:border-slate-800/90 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones con presupuesto asignado > S/ 500M"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Presupuesto Asignado</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">S/ {NATIONAL_META.totalPimMillones}M</span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">filter_list</span> Filtrar Asignación &gt; S/ 500M
            </span>
          </div>
        </div>

        {/* Card 2: High Execution Filter */}
        <div
          onClick={() => setExecutionFilter(executionFilter === 'high' ? 'all' : 'high')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'high'
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md -translate-y-0.5'
              : 'bg-white dark:bg-[#0c1833] border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones con avance > 50%"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Inversión Ejecutada</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">trending_up</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">S/ {NATIONAL_META.totalDevengadoMillones}M</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-bold">Filtrar Avance &gt; 50%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}></div>
          </div>
        </div>

        {/* Card 3: Low / Pending Budget Filter */}
        <div
          onClick={() => setExecutionFilter(executionFilter === 'low' ? 'all' : 'low')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'low'
              ? 'bg-red-50/80 dark:bg-red-950/40 border-red-400 ring-2 ring-red-500/20 shadow-md -translate-y-0.5'
              : 'bg-white dark:bg-[#0c1833] border-slate-200/90 dark:border-slate-800/90 hover:border-red-400 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones con avance pendiente (< 50%)"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Fondo Pendiente</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">warning</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-red-600 dark:text-red-400">
              S/ {roundNum(NATIONAL_META.totalPimMillones - NATIONAL_META.totalDevengadoMillones)}M
            </span>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Filtrar Avance Pendiente (&lt; 50%)</span>
          </div>
        </div>

        {/* Card 4: Critical Risk Filter */}
        <div
          onClick={() => setExecutionFilter(executionFilter === 'critical' ? 'all' : 'critical')}
          className={`group rounded-2xl p-6 shadow-2xs border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
            executionFilter === 'critical'
              ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-500/20 shadow-md -translate-y-0.5'
              : 'bg-white dark:bg-[#0c1833] border-slate-200/90 dark:border-slate-800/90 hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5'
          }`}
          title="Haz clic para filtrar regiones en riesgo Muy Alto"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Regiones en Riesgo Crítico</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">analytics</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900 dark:text-white">{NATIONAL_META.totalDepartamentos}</span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 font-bold">Filtrar Riesgo Muy Alto</span>
          </div>
        </div>

      </div>

      {/* Table Controls & Filter Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Table Container */}
        <div className="xl:col-span-2 bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 flex flex-col gap-6 transition-colors">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">payments</span>
                Ejecución Presupuestal por Departamento
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Haz clic en cualquier departamento para ver el detalle técnico completo</p>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar región..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3.5 py-1.5 pl-9 text-xs font-semibold outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
              />
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap text-xs font-bold transition-colors">
            <div className="flex items-center gap-1 overflow-x-auto flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 font-semibold px-2 text-[11px]">Filtrar por:</span>
              <button
                onClick={() => setExecutionFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'all' ? 'bg-white dark:bg-[#0c1833] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Todas ({TABLAS_MEF_DEPARTAMENTO.length})
              </button>
              <button
                onClick={() => setExecutionFilter('high')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'high' ? 'bg-white dark:bg-[#0c1833] text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Avance &gt;50%
              </button>
              <button
                onClick={() => setExecutionFilter('low')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'low' ? 'bg-white dark:bg-[#0c1833] text-red-600 dark:text-red-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Avance &lt;50%
              </button>
              <button
                onClick={() => setExecutionFilter('critical')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${executionFilter === 'critical' ? 'bg-white dark:bg-[#0c1833] text-purple-700 dark:text-purple-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Riesgo Muy Alto
              </button>

              {selectedPliego && (
                <span className="px-2.5 py-1 bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 rounded-xl text-xs font-bold border border-sky-300 dark:border-sky-800 flex items-center gap-1 animate-fade-in">
                  <span className="material-symbols-outlined text-xs">domain</span>
                  Pliego: {selectedPliego}
                  <button onClick={() => setSelectedPliego(null)} className="ml-1 hover:text-red-600 font-bold cursor-pointer">✕</button>
                </span>
              )}
            </div>

            {(selectedPliego || executionFilter !== 'all' || searchTerm) && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline px-2 cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">filter_alt_off</span> Limpiar Filtros
              </button>
            )}
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 shadow-2xs z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3 px-4 font-semibold">Departamento</th>
                  <th className="py-3 px-4 font-semibold">Asignado (S/ M)</th>
                  <th className="py-3 px-4 font-semibold">Inversión (S/ M)</th>
                  <th className="py-3 px-4 font-semibold">Avance (%)</th>
                  <th className="py-3 px-4 font-semibold">Nivel Riesgo</th>
                  <th className="py-3 px-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-800 dark:text-slate-200 font-medium divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTabla.length > 0 ? (
                  filteredTabla.map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRegionDetail(row)}
                      className="hover:bg-sky-50/70 dark:hover:bg-sky-950/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 text-sm">location_on</span>
                        {row.depto}
                      </td>
                      <td className="py-3.5 px-4 font-semibold">S/ {row.pim}M</td>
                      <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">S/ {row.ejec}M</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold w-10">{row.pct}%</span>
                          <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${row.pct < 30 ? 'bg-red-500' : row.pct < 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, row.pct)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${row.riesgo === 'Muy Alto' ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300' : row.riesgo === 'Alto' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'}`}>
                          {row.riesgo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:underline flex items-center justify-center gap-1">
                          Ver Detalle <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400 font-semibold text-xs">
                      No se encontraron departamentos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Pliegos Regionales Selector */}
        <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 flex flex-col gap-5 transition-colors">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 dark:text-sky-400">stars</span>
              Principales Gobiernos Regionales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
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
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-400 ring-2 ring-sky-500/20 font-bold shadow-xs'
                      : 'border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/40 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={pliego.isAlert ? 'text-red-600 dark:text-red-400 font-bold group-hover:underline' : 'text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400'}>
                      {pliego.nombre}
                    </span>
                    <span className="text-slate-900 dark:text-white font-extrabold">{pliego.monto}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full transition-all duration-500 ${barColorClass(pliego.pct)}`} style={{ width: `${pliego.pct}%` }}></div>
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

// Color de la barra según el % de ejecución presupuestal. Se computa aquí con clases
// literales de Tailwind (no desde el JSON) para que el JIT siempre las genere y la barra
// se vea en TODOS los pliegos (verde: buena ejecución -> rojo: baja).
function barColorClass(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500';
  if (pct >= 55) return 'bg-sky-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function roundNum(num: number): string {
  return (Math.round(num * 10) / 10).toFixed(1);
}

function parsePim(pimStr: string): number {
  return parseFloat(pimStr.replace("S/", "").replace("M", "").trim()) || 0;
}
