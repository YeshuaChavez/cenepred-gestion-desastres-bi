'use client';

import React, { useState } from 'react';
import { NATIONAL_META } from '../../data/mockData';

interface YearlyTrend {
  anio: number;
  emergencias: number;
  afectados: number;
  damnificados: number;
  viviendasDestruidas: number;
  eventoClave: string;
}

interface MonthlyData {
  mes: string;
  mesIdx: number;
  emergencias: number;
  afectados: number;
  damnificados: number;
  fenomeno: string;
}

interface DailyData {
  dia: number;
  emergencias: number;
  afectados: number;
  regionPico: string;
  descripcion: string;
}

export default function HistoricoTendenciasView() {
  const [selectedAnio, setSelectedAnio] = useState<number | 'todos'>('todos');
  const [selectedMesIdx, setSelectedMesIdx] = useState<number | null>(null);
  const [selectedDia, setSelectedDia] = useState<number | null>(null);
  const [quarterFilter, setQuarterFilter] = useState<'todos' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('todos');

  // 1. Multianual Data (2012 - 2023)
  const HISTORICO_ANUAL: YearlyTrend[] = [
    { anio: 2012, emergencias: 5820, afectados: 412000, damnificados: 48000, viviendasDestruidas: 4200, eventoClave: "Lluvias Intensas del Sur" },
    { anio: 2013, emergencias: 6140, afectados: 435000, damnificados: 52000, viviendasDestruidas: 4600, eventoClave: "Heladas y Friajes Atípicos" },
    { anio: 2014, emergencias: 5980, afectados: 398000, damnificados: 41000, viviendasDestruidas: 3800, eventoClave: "Sismo Parinacochas" },
    { anio: 2015, emergencias: 6850, afectados: 580000, damnificados: 64000, viviendasDestruidas: 5900, eventoClave: "Fase Previa El Niño" },
    { anio: 2016, emergencias: 7210, afectados: 620000, damnificados: 71000, viviendasDestruidas: 6800, eventoClave: "Déficit Hídrico y Heladas" },
    { anio: 2017, emergencias: 12450, afectados: 1680000, damnificados: 295000, viviendasDestruidas: 28400, eventoClave: "El Niño Costero — Pico Histórico" },
    { anio: 2018, emergencias: 7450, afectados: 540000, damnificados: 58000, viviendasDestruidas: 5100, eventoClave: "Huaycos en Chosica y Piura" },
    { anio: 2019, emergencias: 7890, afectados: 610000, damnificados: 62000, viviendasDestruidas: 5400, eventoClave: "Lluvias del Norte y Sur" },
    { anio: 2020, emergencias: 7120, afectados: 480000, damnificados: 45000, viviendasDestruidas: 4100, eventoClave: "Inundaciones en la Selva" },
    { anio: 2021, emergencias: 7650, afectados: 530000, damnificados: 51000, viviendasDestruidas: 4700, eventoClave: "Sismo de Amazonas M7.5" },
    { anio: 2022, emergencias: 8120, afectados: 670000, damnificados: 74000, viviendasDestruidas: 6200, eventoClave: "Desbordes en San Martín y Puno" },
    { anio: 2023, emergencias: 11680, afectados: 1420000, damnificados: 210000, viviendasDestruidas: 21500, eventoClave: "Ciclón Yaku y El Niño Global" }
  ];

  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Helper to generate monthly breakdown for a selected year
  const getMonthlyBreakdown = (anio: number): MonthlyData[] => {
    const isPico = anio === 2017 || anio === 2023;
    const base = isPico ? 1100 : 550;

    return MESES.map((mes, idx) => {
      // Seasonal pattern: higher in Jan-Mar (summer rains) and Jun-Jul (frost)
      let factor = 1.0;
      if (idx === 0 || idx === 1 || idx === 2) factor = isPico ? 2.4 : 1.7; // Summer rains
      else if (idx === 5 || idx === 6) factor = 1.3; // Frost
      else factor = 0.6;

      const emergencias = Math.round(base * factor);
      const afectados = emergencias * (isPico ? 140 : 80);
      const damnificados = Math.round(emergencias * (isPico ? 22 : 10));

      let fenomeno = "Precipitaciones Mod.";
      if (idx <= 2) fenomeno = isPico ? "Inundaciones y Huaycos Severos" : "Lluvias de Verano";
      else if (idx >= 5 && idx <= 7) fenomeno = "Heladas y Friajes Atípicos";

      return { mes, mesIdx: idx, emergencias, afectados, damnificados, fenomeno };
    });
  };

  // Helper to generate daily breakdown for a selected month
  const getDailyBreakdown = (anio: number, mesIdx: number): DailyData[] => {
    const isPicoMonth = (anio === 2017 || anio === 2023) && (mesIdx === 1 || mesIdx === 2);
    const daysCount = mesIdx === 1 ? (anio % 4 === 0 ? 29 : 28) : (mesIdx === 3 || mesIdx === 5 || mesIdx === 8 || mesIdx === 10 ? 30 : 31);
    
    const days: DailyData[] = [];
    for (let d = 1; d <= daysCount; d++) {
      const isPeakDay = isPicoMonth && (d === 15 || d === 16 || d === 17);
      const emergencias = isPeakDay ? Math.floor(Math.random() * 80) + 120 : Math.floor(Math.random() * 25) + 10;
      const afectados = emergencias * 45;
      
      days.push({
        dia: d,
        emergencias,
        afectados,
        regionPico: isPeakDay ? 'Piura & Lambayeque' : d % 2 === 0 ? 'Arequipa & Cusco' : 'Loreto & San Martín',
        descripcion: isPeakDay ? 'Desborde de río y activación de quebradas' : 'Lluvias locales y vientos moderados'
      });
    }
    return days;
  };

  const selectedItem = selectedAnio === 'todos' 
    ? null 
    : HISTORICO_ANUAL.find(d => d.anio === selectedAnio);

  const monthlyList = selectedAnio !== 'todos' ? getMonthlyBreakdown(selectedAnio) : [];
  const filteredMonthly = monthlyList.filter((m) => {
    if (quarterFilter === 'Q1') return m.mesIdx <= 2;
    if (quarterFilter === 'Q2') return m.mesIdx >= 3 && m.mesIdx <= 5;
    if (quarterFilter === 'Q3') return m.mesIdx >= 6 && m.mesIdx <= 8;
    if (quarterFilter === 'Q4') return m.mesIdx >= 9;
    return true;
  });

  const dailyList = (selectedAnio !== 'todos' && selectedMesIdx !== null) 
    ? getDailyBreakdown(selectedAnio, selectedMesIdx) 
    : [];

  const selectedDayData = (dailyList.length > 0 && selectedDia !== null) 
    ? dailyList.find(d => d.dia === selectedDia) 
    : null;

  const maxEmergenciasAnual = Math.max(...HISTORICO_ANUAL.map(d => d.emergencias));
  const maxEmergenciasMes = monthlyList.length > 0 ? Math.max(...monthlyList.map(m => m.emergencias)) : 1;
  const maxEmergenciasDia = dailyList.length > 0 ? Math.max(...dailyList.map(d => d.emergencias)) : 1;

  const resetAllFilters = () => {
    setSelectedAnio('todos');
    setSelectedMesIdx(null);
    setSelectedDia(null);
    setQuarterFilter('todos');
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800">
      
      {/* Header & Breadcrumb Drill-Down Navigation */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="font-headline-lg text-2xl font-bold text-slate-900 mb-1">
              Histórico Multianual y Explorador Time-Intelligence
            </h2>
            <p className="font-body-md text-sm text-slate-600 max-w-3xl">
              Navegación jerárquica con drill-down (Año → Trimestre → Mes → Día) sobre 84,369 emergencias históricas de INDECI.
            </p>
          </div>

          {/* Breadcrumb Path Bar */}
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 flex-wrap">
            <button
              onClick={resetAllFilters}
              className={`hover:text-sky-700 cursor-pointer ${selectedAnio === 'todos' ? 'text-sky-700 font-extrabold' : ''}`}
            >
              Nacional Multianual
            </button>

            {selectedAnio !== 'todos' && (
              <>
                <span>/</span>
                <button
                  onClick={() => { setSelectedMesIdx(null); setSelectedDia(null); }}
                  className={`hover:text-sky-700 cursor-pointer ${selectedMesIdx === null ? 'text-sky-700 font-extrabold' : ''}`}
                >
                  Año {selectedAnio}
                </button>
              </>
            )}

            {selectedMesIdx !== null && (
              <>
                <span>/</span>
                <button
                  onClick={() => setSelectedDia(null)}
                  className={`hover:text-sky-700 cursor-pointer ${selectedDia === null ? 'text-sky-700 font-extrabold' : ''}`}
                >
                  {MESES[selectedMesIdx]}
                </button>
              </>
            )}

            {selectedDia !== null && (
              <>
                <span>/</span>
                <span className="text-sky-700 font-extrabold">Día {selectedDia}</span>
              </>
            )}

            {selectedAnio !== 'todos' && (
              <button
                onClick={resetAllFilters}
                className="ml-3 px-2 py-0.5 bg-white text-slate-600 rounded border border-slate-300 text-[10px] hover:bg-slate-200 cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Dynamic Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergencias Registradas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {selectedDayData
                ? selectedDayData.emergencias.toLocaleString()
                : selectedMesIdx !== null
                ? monthlyList[selectedMesIdx]?.emergencias.toLocaleString()
                : selectedItem
                ? selectedItem.emergencias.toLocaleString()
                : NATIONAL_META.totalEmergencias.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-sky-700">
              {selectedDia !== null ? `Día ${selectedDia} de ${MESES[selectedMesIdx!]}` : selectedMesIdx !== null ? `${MESES[selectedMesIdx]} ${selectedAnio}` : selectedAnio !== 'todos' ? `Año ${selectedAnio}` : '12 Años'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Población Afectada</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">
              {selectedDayData
                ? selectedDayData.afectados.toLocaleString()
                : selectedMesIdx !== null
                ? monthlyList[selectedMesIdx]?.afectados.toLocaleString()
                : selectedItem
                ? selectedItem.afectados.toLocaleString()
                : '1,680,000 (Pico 2017)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 truncate">
            {selectedDayData ? selectedDayData.regionPico : selectedItem ? selectedItem.eventoClave : 'El Niño Costero & Ciclón Yaku'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Población Damnificada</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {selectedMesIdx !== null
                ? monthlyList[selectedMesIdx]?.damnificados.toLocaleString()
                : selectedItem
                ? selectedItem.damnificados.toLocaleString()
                : '295,000 (El Niño 2017)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Pérdida total de vivienda</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Viviendas Destruidas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {selectedItem ? selectedItem.viviendasDestruidas.toLocaleString() : '28,400 (Pico 2017)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Infraestructura colapsada</span>
        </div>
      </div>

      {/* DRILL-DOWN LEVEL 1: Multianual (2012 - 2023) */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600">calendar_month</span>
              Nivel 1: Evolución Multianual de Emergencias (2012 — 2023)
            </h3>
            <span className="text-xs text-slate-500">Haz clic en cualquier barra de año para desmenuzar a sus 12 meses</span>
          </div>
        </div>

        <div className="h-64 w-full flex items-end gap-3 pt-8 pb-2 px-2 border-b border-slate-200 relative">
          {HISTORICO_ANUAL.map((item) => {
            const heightPct = Math.round((item.emergencias / maxEmergenciasAnual) * 100);
            const isPico = item.anio === 2017 || item.anio === 2023;
            const isSelected = selectedAnio === item.anio;

            return (
              <div
                key={item.anio}
                className={`flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer transition-all duration-300 ${
                  selectedAnio !== 'todos' && !isSelected ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                }`}
                onClick={() => {
                  setSelectedAnio(item.anio);
                  setSelectedMesIdx(null);
                  setSelectedDia(null);
                }}
              >
                <div className="w-full flex items-end justify-center h-full px-1">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-gradient-to-t from-sky-700 to-sky-500 ring-4 ring-sky-400 shadow-xl'
                        : isPico
                        ? 'bg-gradient-to-t from-red-500 to-amber-400 shadow-md'
                        : 'bg-gradient-to-t from-sky-600 to-sky-400 hover:brightness-110'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="text-[10px] font-extrabold text-white absolute -top-5 left-1/2 -translate-x-1/2 hidden sm:block">
                      {item.emergencias > 10000 ? `${(item.emergencias/1000).toFixed(1)}k` : item.emergencias}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold mt-2 transition-colors ${isSelected ? 'text-sky-700 font-extrabold scale-110' : 'text-slate-600'}`}>
                  {item.anio}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DRILL-DOWN LEVEL 2: Desglose Mensual y Trimestral (Si hay año seleccionado) */}
      {selectedAnio !== 'todos' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-sky-200/80 flex flex-col gap-6 animate-fade-in bg-sky-50/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700">filter_alt</span>
                Nivel 2: Desglose Mensual y Trimestral del Año {selectedAnio}
              </h3>
              <span className="text-xs text-slate-500">Haz clic en cualquier mes para profundizar al nivel de días (1 al 31)</span>
            </div>

            {/* Quarter Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setQuarterFilter('todos')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${quarterFilter === 'todos' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Todos los Meses
              </button>
              <button
                onClick={() => setQuarterFilter('Q1')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${quarterFilter === 'Q1' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Q1 (Ene-Mar)
              </button>
              <button
                onClick={() => setQuarterFilter('Q2')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${quarterFilter === 'Q2' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Q2 (Abr-Jun)
              </button>
              <button
                onClick={() => setQuarterFilter('Q3')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${quarterFilter === 'Q3' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Q3 (Jul-Sep)
              </button>
              <button
                onClick={() => setQuarterFilter('Q4')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${quarterFilter === 'Q4' ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Q4 (Oct-Dic)
              </button>
            </div>
          </div>

          {/* Monthly Bars Chart */}
          <div className="h-56 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200 relative">
            {filteredMonthly.map((m) => {
              const heightPct = Math.round((m.emergencias / maxEmergenciasMes) * 100);
              const isSelected = selectedMesIdx === m.mesIdx;

              return (
                <div
                  key={m.mes}
                  onClick={() => {
                    setSelectedMesIdx(m.mesIdx);
                    setSelectedDia(null);
                  }}
                  className={`flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer transition-all duration-300 ${
                    selectedMesIdx !== null && !isSelected ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                  }`}
                >
                  <div className="w-full flex items-end justify-center h-full px-1">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 relative ${
                        isSelected
                          ? 'bg-gradient-to-t from-sky-800 to-sky-600 ring-4 ring-sky-500 shadow-xl'
                          : 'bg-gradient-to-t from-sky-500 to-sky-300 hover:brightness-110'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="text-[9px] font-bold text-white absolute -top-4 left-1/2 -translate-x-1/2">
                        {m.emergencias}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-2 ${isSelected ? 'text-sky-800 underline' : 'text-slate-600'}`}>
                    {m.mes.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRILL-DOWN LEVEL 3: Histogram del Día a Día del Mes (Si hay mes seleccionado) */}
      {selectedMesIdx !== null && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-indigo-200/80 flex flex-col gap-6 animate-fade-in bg-indigo-50/20">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">view_timeline</span>
                Nivel 3: Histograma Diario de {MESES[selectedMesIdx]} del {selectedAnio}
              </h3>
              <span className="text-xs text-slate-500">Haz clic en un día específico para consultar la ficha de emergencia SINPAD</span>
            </div>
            {selectedDia !== null && (
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                Día {selectedDia} Seleccionado
              </span>
            )}
          </div>

          {/* Daily Timeline */}
          <div className="h-44 w-full flex items-end gap-1 pt-6 pb-2 px-1 border-b border-slate-200 overflow-x-auto">
            {dailyList.map((d) => {
              const heightPct = Math.round((d.emergencias / maxEmergenciasDia) * 100);
              const isSelected = selectedDia === d.dia;

              return (
                <div
                  key={d.dia}
                  onClick={() => setSelectedDia(d.dia)}
                  className={`flex-1 min-w-[20px] flex flex-col items-center h-full justify-end group relative cursor-pointer transition-all duration-200 ${
                    selectedDia !== null && !isSelected ? 'opacity-30' : 'opacity-100'
                  }`}
                  title={`Día ${d.dia}: ${d.emergencias} emergencias en ${d.regionPico}`}
                >
                  <div className="w-full flex items-end justify-center h-full px-0.5">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isSelected
                          ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-lg'
                          : d.emergencias > 80
                          ? 'bg-red-500'
                          : 'bg-indigo-400 hover:bg-indigo-500'
                      }`}
                      style={{ height: `${Math.max(10, heightPct)}%` }}
                    ></div>
                  </div>
                  <span className={`text-[9px] font-bold mt-1 ${isSelected ? 'text-indigo-800' : 'text-slate-500'}`}>
                    {d.dia}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ficha Oficial de Emergencia SINPAD para el Día Seleccionado */}
          {selectedDayData && (
            <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">Reporte SINPAD</span>
                  <h4 className="font-bold text-sm text-slate-900">
                    Emergencia del Día {selectedDayData.dia} de {MESES[selectedMesIdx]} {selectedAnio}
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  {selectedDayData.descripcion} en las regiones de <b>{selectedDayData.regionPico}</b>.
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergencias</span>
                  <span className="text-indigo-700 font-extrabold text-base">{selectedDayData.emergencias}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Población Afectada</span>
                  <span className="text-red-600 font-extrabold text-base">{selectedDayData.afectados.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
