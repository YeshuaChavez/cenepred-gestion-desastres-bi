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
  const [hoveredYear, setHoveredYear] = useState<YearlyTrend | null>(null);

  // 1. Multianual Data (2012 - 2023)
  const HISTORICO_ANUAL: YearlyTrend[] = [
    { anio: 2012, emergencias: 5820, afectados: 412000, damnificados: 48000, viviendasDestruidas: 4200, eventoClave: "Lluvias Intensas del Sur" },
    { anio: 2013, emergencias: 6140, afectados: 435000, damnificados: 52000, viviendasDestruidas: 4600, eventoClave: "Heladas y Friajes Atípicos" },
    { anio: 2014, emergencias: 5980, afectados: 398000, damnificados: 41000, viviendasDestruidas: 3800, eventoClave: "Sismo Parinacochas" },
    { anio: 2015, emergencias: 6850, afectados: 580000, damnificados: 64000, viviendasDestruidas: 5900, eventoClave: "Fase Previa El Niño" },
    { anio: 2016, emergencias: 7210, afectados: 620000, damnificados: 71000, viviendasDestruidas: 6800, eventoClave: "Déficit Hídrico y Heladas" },
    { anio: 2017, emergencias: 12450, afectados: 1680000, damnificados: 295000, viviendasDestruidas: 28400, eventoClave: "El Niño Costero - Pico Histórico" },
    { anio: 2018, emergencias: 7450, afectados: 540000, damnificados: 58000, viviendasDestruidas: 5100, eventoClave: "Huaycos en Chosica y Piura" },
    { anio: 2019, emergencias: 7890, afectados: 610000, damnificados: 62000, viviendasDestruidas: 5400, eventoClave: "Lluvias del Norte y Sur" },
    { anio: 2020, emergencias: 7120, afectados: 480000, damnificados: 45000, viviendasDestruidas: 4100, eventoClave: "Inundaciones en la Selva" },
    { anio: 2021, emergencias: 7650, afectados: 530000, damnificados: 51000, viviendasDestruidas: 4700, eventoClave: "Sismo de Amazonas M7.5" },
    { anio: 2022, emergencias: 8120, afectados: 670000, damnificados: 74000, viviendasDestruidas: 6200, eventoClave: "Desbordes en San Martín y Puno" },
    { anio: 2023, emergencias: 11680, afectados: 1420000, damnificados: 210000, viviendasDestruidas: 21500, eventoClave: "Ciclón Yaku y El Niño Global" }
  ];

  const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getMonthlyBreakdown = (anio: number): MonthlyData[] => {
    const isPico = anio === 2017 || anio === 2023;
    const base = isPico ? 1100 : 550;

    return MESES.map((mes, idx) => {
      let factor = 1.0;
      if (idx === 0 || idx === 1 || idx === 2) factor = isPico ? 2.4 : 1.7;
      else if (idx === 5 || idx === 6) factor = 1.3;
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
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header & Dynamic Breadcrumb Navigation */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
          <div>
            <h2 className="font-display-lg text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Histórico Multianual y Tendencias
            </h2>
            <p className="font-body-md text-sm text-slate-600 dark:text-slate-400 max-w-3xl mt-1">
              Consulta la evolución histórica de las emergencias atendidas en el país año a año, con desgloses detallados por meses y días.
            </p>
          </div>

          {/* Interactive Breadcrumb Pill Bar */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex-wrap text-xs font-bold transition-colors">
            <button
              onClick={resetAllFilters}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedAnio === 'todos'
                  ? 'bg-sky-700 dark:bg-sky-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">public</span>
              Nacional (2012-2023)
            </button>

            {selectedAnio !== 'todos' && (
              <>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xs">chevron_right</span>
                <button
                  onClick={() => { setSelectedMesIdx(null); setSelectedDia(null); }}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedMesIdx === null
                      ? 'bg-sky-700 dark:bg-sky-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Año {selectedAnio}
                </button>
              </>
            )}

            {selectedMesIdx !== null && (
              <>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xs">chevron_right</span>
                <button
                  onClick={() => setSelectedDia(null)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedDia === null
                      ? 'bg-sky-700 dark:bg-sky-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">event</span>
                  {MESES[selectedMesIdx]}
                </button>
              </>
            )}

            {selectedDia !== null && (
              <>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-xs">chevron_right</span>
                <span className="px-3 py-1.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl shadow-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">today</span>
                  Día {selectedDia}
                </span>
              </>
            )}

            {selectedAnio !== 'todos' && (
              <button
                onClick={resetAllFilters}
                className="ml-2 px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 rounded-lg border border-slate-200 dark:border-slate-600 text-[10px] transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                title="Restablecer filtros"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        
        {/* Card 1: Emergencies */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Emergencias Registradas</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">emergency</span>
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedDayData
                ? selectedDayData.emergencias.toLocaleString()
                : selectedMesIdx !== null
                ? monthlyList[selectedMesIdx]?.emergencias.toLocaleString()
                : selectedItem
                ? selectedItem.emergencias.toLocaleString()
                : NATIONAL_META.totalEmergencias.toLocaleString()}
            </span>
          </div>
          <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
            {selectedDia !== null ? `Día ${selectedDia} de ${MESES[selectedMesIdx!]}` : selectedMesIdx !== null ? `${MESES[selectedMesIdx]} ${selectedAnio}` : selectedAnio !== 'todos' ? `Año ${selectedAnio}` : 'Acumulado 12 Años'}
          </div>
        </div>

        {/* Card 2: Affected Population */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-red-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Población Afectada</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">groups</span>
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
              {selectedDayData
                ? selectedDayData.afectados.toLocaleString()
                : selectedMesIdx !== null
                ? monthlyList[selectedMesIdx]?.afectados.toLocaleString()
                : selectedItem
                ? selectedItem.afectados.toLocaleString()
                : '1,680,000'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            {selectedDayData ? selectedDayData.regionPico : selectedItem ? selectedItem.eventoClave : 'Pico Máximo El Niño 2017'}
          </span>
        </div>

        {/* Card 3: Damnificados */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Población Damnificada</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">home_work</span>
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {selectedMesIdx !== null
                ? monthlyList[selectedMesIdx]?.damnificados.toLocaleString()
                : selectedItem
                ? selectedItem.damnificados.toLocaleString()
                : '295,000'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pérdida total de vivienda habitual</span>
        </div>

        {/* Card 4: Houses Destroyed */}
        <div className="bg-white dark:bg-[#0c1833] rounded-2xl p-5 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Viviendas Colapsadas</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-300 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-base">house</span>
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {selectedItem ? selectedItem.viviendasDestruidas.toLocaleString() : '28,400'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Infraestructura destruida</span>
        </div>

      </div>

      {/* DRILL-DOWN LEVEL 1: Multianual (2012 - 2023) */}
      <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-slate-200/90 dark:border-slate-800/90 flex flex-col gap-6 relative overflow-hidden transition-colors duration-300">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">bar_chart</span>
              </div>
              Nivel 1: Evolución Multianual de Emergencias (2012 - 2023)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Haz clic sobre cualquier barra para profundizar al nivel de meses</p>
          </div>

          {hoveredYear && (
            <div className="px-3 py-1 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-bold text-sky-900 dark:text-sky-200 animate-fade-in flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-sky-600 dark:text-sky-400">info</span>
              <span>{hoveredYear.anio}: {hoveredYear.emergencias.toLocaleString()} emergencias • {hoveredYear.eventoClave}</span>
            </div>
          )}
        </div>

        {/* Multianual Bars Chart */}
        <div className="h-72 w-full flex items-end gap-2 sm:gap-3 pt-10 pb-3 px-2 border-b border-slate-200 dark:border-slate-800 relative bg-slate-50/40 dark:bg-slate-900/40 rounded-2xl transition-colors">
          {HISTORICO_ANUAL.map((item) => {
            const heightPct = Math.round((item.emergencias / maxEmergenciasAnual) * 100);
            const isPico = item.anio === 2017 || item.anio === 2023;
            const isSelected = selectedAnio === item.anio;

            return (
              <div
                key={item.anio}
                onMouseEnter={() => setHoveredYear(item)}
                onMouseLeave={() => setHoveredYear(null)}
                onClick={() => {
                  setSelectedAnio(item.anio);
                  setSelectedMesIdx(null);
                  setSelectedDia(null);
                }}
                className={`flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer transition-all duration-300 ${
                  selectedAnio !== 'todos' && !isSelected ? 'opacity-35 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {/* Floating Tooltip Header */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-12 z-20 pointer-events-none bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap flex flex-col items-center border border-slate-700">
                  <span>{item.emergencias.toLocaleString()} eventos</span>
                  <span className="text-[9px] text-sky-300 font-normal">{item.eventoClave.split('-')[0]}</span>
                </div>

                <div className="w-full flex items-end justify-center h-full px-0.5 sm:px-1">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-gradient-to-t from-sky-700 via-sky-600 to-sky-400 ring-4 ring-sky-400/60 shadow-xl scale-[1.02]'
                        : isPico
                        ? 'bg-gradient-to-t from-red-600 via-amber-500 to-amber-400 shadow-md group-hover:brightness-110 group-hover:scale-[1.03]'
                        : 'bg-gradient-to-t from-sky-700 via-sky-600 to-sky-400 dark:from-sky-800 dark:via-sky-600 dark:to-sky-400 group-hover:brightness-110 group-hover:scale-[1.03] group-hover:shadow-lg'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="text-[10px] font-extrabold text-white absolute -top-5 left-1/2 -translate-x-1/2 hidden sm:block drop-shadow-xs">
                      {item.emergencias > 10000 ? `${(item.emergencias/1000).toFixed(1)}k` : item.emergencias}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold mt-2.5 transition-all ${
                  isSelected ? 'text-sky-700 dark:text-sky-400 font-extrabold scale-110 underline underline-offset-4' : 'text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300'
                }`}>
                  {item.anio}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DRILL-DOWN LEVEL 2: Desglose Mensual */}
      {selectedAnio !== 'todos' && (
        <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-sky-200/90 dark:border-sky-900/60 flex flex-col gap-6 animate-fade-in bg-sky-50/20 dark:bg-sky-950/20 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-sky-200/80 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">calendar_view_month</span>
                </div>
                Nivel 2: Desglose Mensual del Año {selectedAnio}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Haz clic en cualquier mes para desmenuzar el histograma diario</p>
            </div>

            {/* Quarter Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
              <button
                onClick={() => setQuarterFilter('todos')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${quarterFilter === 'todos' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setQuarterFilter('Q1')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${quarterFilter === 'Q1' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Q1 (Ene-Mar)
              </button>
              <button
                onClick={() => setQuarterFilter('Q2')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${quarterFilter === 'Q2' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Q2 (Abr-Jun)
              </button>
              <button
                onClick={() => setQuarterFilter('Q3')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${quarterFilter === 'Q3' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Q3 (Jul-Sep)
              </button>
              <button
                onClick={() => setQuarterFilter('Q4')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${quarterFilter === 'Q4' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                Q4 (Oct-Dic)
              </button>
            </div>
          </div>

          {/* Monthly Bars Chart */}
          <div className="h-60 w-full flex items-end gap-2.5 pt-8 pb-3 px-2 border-b border-sky-200/80 dark:border-slate-800 relative bg-white/70 dark:bg-slate-900/60 rounded-2xl">
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-10 z-20 pointer-events-none bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap border border-slate-700">
                    {m.fenomeno}
                  </div>

                  <div className="w-full flex items-end justify-center h-full px-1">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 relative ${
                        isSelected
                          ? 'bg-gradient-to-t from-sky-700 to-sky-500 ring-4 ring-sky-500/70 shadow-xl scale-[1.02]'
                          : 'bg-gradient-to-t from-sky-600 to-sky-400 dark:from-sky-700 dark:to-sky-500 group-hover:brightness-110 group-hover:scale-[1.03]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <span className="text-[9px] font-extrabold text-white absolute -top-4 left-1/2 -translate-x-1/2">
                        {m.emergencias}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-2.5 transition-colors ${isSelected ? 'text-sky-700 dark:text-sky-400 underline font-extrabold' : 'text-slate-600 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-300'}`}>
                    {m.mes.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRILL-DOWN LEVEL 3: Histogram del Día a Día */}
      {selectedMesIdx !== null && (
        <div className="bg-white dark:bg-[#0c1833] rounded-3xl p-6 md:p-8 shadow-2xs border border-indigo-200/90 dark:border-indigo-900/60 flex flex-col gap-6 animate-fade-in bg-indigo-50/20 dark:bg-indigo-950/20 transition-colors">
          <div className="flex justify-between items-center pb-3 border-b border-indigo-200/80 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">view_timeline</span>
                </div>
                Nivel 3: Histograma Diario de {MESES[selectedMesIdx]} del {selectedAnio}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Haz clic en un día específico para consultar la ficha de emergencia oficial SINPAD</p>
            </div>
            {selectedDia !== null && (
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-950/80 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                Día {selectedDia} Seleccionado
              </span>
            )}
          </div>

          {/* Daily Timeline */}
          <div className="h-48 w-full flex items-end gap-1 pt-6 pb-2 px-1 border-b border-indigo-200/80 dark:border-slate-800 overflow-x-auto bg-white/70 dark:bg-slate-900/60 rounded-2xl">
            {dailyList.map((d) => {
              const heightPct = Math.round((d.emergencias / maxEmergenciasDia) * 100);
              const isSelected = selectedDia === d.dia;

              return (
                <div
                  key={d.dia}
                  onClick={() => setSelectedDia(d.dia)}
                  className={`flex-1 min-w-[22px] flex flex-col items-center h-full justify-end group relative cursor-pointer transition-all duration-200 ${
                    selectedDia !== null && !isSelected ? 'opacity-35' : 'opacity-100'
                  }`}
                  title={`Día ${d.dia}: ${d.emergencias} emergencias en ${d.regionPico}`}
                >
                  <div className="w-full flex items-end justify-center h-full px-0.5">
                    <div
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-600 ring-2 ring-indigo-400 shadow-lg scale-105'
                          : d.emergencias > 80
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-indigo-400 dark:bg-indigo-500 hover:bg-indigo-600'
                      }`}
                      style={{ height: `${Math.max(12, heightPct)}%` }}
                    ></div>
                  </div>
                  <span className={`text-[9px] font-bold mt-1.5 ${isSelected ? 'text-indigo-700 dark:text-indigo-300 font-extrabold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {d.dia}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Ficha Oficial de Emergencia SINPAD para el Día Seleccionado */}
          {selectedDayData && (
            <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in border border-slate-700">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="px-2 py-0.5 bg-white/10 text-sky-300 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">Reporte Técnico SINPAD</span>
                  <h4 className="font-bold text-sm text-white">
                    Emergencia del Día {selectedDayData.dia} de {MESES[selectedMesIdx]} {selectedAnio}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {selectedDayData.descripcion} en las regiones de <b className="text-sky-300">{selectedDayData.regionPico}</b>.
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs font-semibold shrink-0">
                <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Emergencias</span>
                  <span className="text-white font-extrabold text-base">{selectedDayData.emergencias}</span>
                </div>
                <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Población Afectada</span>
                  <span className="text-red-400 font-extrabold text-base">{selectedDayData.afectados.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
