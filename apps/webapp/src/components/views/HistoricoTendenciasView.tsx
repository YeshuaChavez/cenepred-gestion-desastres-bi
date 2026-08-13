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

export default function HistoricoTendenciasView() {
  const [selectedAnio, setSelectedAnio] = useState<number | 'todos'>('todos');

  // Real multianual data (2012 - 2023) from INDECI
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

  const maxEmergencias = Math.max(...HISTORICO_ANUAL.map(d => d.emergencias));

  const selectedItem = selectedAnio === 'todos' 
    ? null 
    : HISTORICO_ANUAL.find(d => d.anio === selectedAnio);

  const filteredData = selectedAnio === 'todos'
    ? HISTORICO_ANUAL
    : HISTORICO_ANUAL.filter(d => d.anio === selectedAnio);

  // Dynamic summary metrics based on selection
  const displayTotalEmergencias = selectedItem 
    ? selectedItem.emergencias.toLocaleString() 
    : NATIONAL_META.totalEmergencias.toLocaleString();

  const displayLabelEmergencias = selectedItem 
    ? `Año ${selectedItem.anio}` 
    : '12 Años (2012 - 2023)';

  const displayAfectados = selectedItem 
    ? selectedItem.afectados.toLocaleString() 
    : '1,680,000 (Año 2017)';

  const displayDamnificados = selectedItem 
    ? selectedItem.damnificados.toLocaleString() 
    : '295,000 (El Niño 2017)';

  const displayEvento = selectedItem 
    ? selectedItem.eventoClave 
    : 'El Niño Costero & Ciclón Yaku';

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="font-headline-lg text-2xl font-bold text-slate-900 mb-1">
            Histórico Multianual y Tendencias de Impacto
          </h2>
          <p className="font-body-md text-sm text-slate-600 max-w-3xl">
            Análisis retrospectivo de 84,369 emergencias registradas por INDECI. Selecciona un año para consultar sus indicadores específicos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Filtrar Año:</label>
          <select
            value={selectedAnio}
            onChange={(e) => setSelectedAnio(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-extrabold text-sky-800 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="todos">Todos los Años (Consolidado)</option>
            {HISTORICO_ANUAL.map(d => (
              <option key={d.anio} value={d.anio}>Año {d.anio} — {d.eventoClave}</option>
            ))}
          </select>
          {selectedAnio !== 'todos' && (
            <button
              onClick={() => setSelectedAnio('todos')}
              className="px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Limpiar Filtro
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergencias Registradas</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{displayTotalEmergencias}</span>
            <span className="text-xs font-bold text-sky-700">{displayLabelEmergencias}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Población Afectada</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">{displayAfectados}</span>
          </div>
          <span className="text-[11px] text-slate-500 truncate">{displayEvento}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Población Damnificada</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{displayDamnificados}</span>
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

      {/* Main Interactive Chart Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600">show_chart</span>
              Evolución de Emergencias y Damnificados por Año
            </h3>
            {selectedAnio !== 'todos' && (
              <span className="text-xs font-bold text-sky-700">Mostrando datos del año {selectedAnio}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-sky-500 rounded"></span>
              <span>Total Emergencias</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span>Pico de Emergencia</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-72 w-full flex items-end gap-3 pt-8 pb-2 px-2 border-b border-slate-200 relative">
          {HISTORICO_ANUAL.map((item) => {
            const heightPct = Math.round((item.emergencias / maxEmergencias) * 100);
            const isPico = item.anio === 2017 || item.anio === 2023;
            const isSelected = selectedAnio === item.anio;
            const isDimmed = selectedAnio !== 'todos' && !isSelected;

            return (
              <div
                key={item.anio}
                className={`flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer transition-all duration-300 ${
                  isDimmed ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
                }`}
                onClick={() => setSelectedAnio(item.anio)}
              >
                {/* Tooltip on Hover */}
                <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] p-2 rounded shadow-lg pointer-events-none z-30 w-40 text-center">
                  <p className="font-bold">{item.anio}: {item.emergencias.toLocaleString()} Emg.</p>
                  <p className="text-[10px] text-sky-300">{item.eventoClave}</p>
                </div>

                {/* Bar */}
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

      {/* Grid: Event Breakdown & Infrastructure Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Hitos Históricos y Eventos Clave</h3>
            {selectedAnio !== 'todos' && (
              <span className="text-xs font-semibold text-slate-500">Filtrado por año {selectedAnio}</span>
            )}
          </div>
          
          <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 sticky top-0 font-semibold text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Año</th>
                  <th className="py-2.5 px-3">Emergencias</th>
                  <th className="py-2.5 px-3">Damnificados</th>
                  <th className="py-2.5 px-3">Evento Principal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredData.map((row) => (
                  <tr
                    key={row.anio}
                    onClick={() => setSelectedAnio(row.anio)}
                    className={`hover:bg-sky-50 transition-colors cursor-pointer ${selectedAnio === row.anio ? 'bg-sky-50 font-bold' : ''}`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.anio}</td>
                    <td className="py-2.5 px-3">{row.emergencias.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-red-600">{row.damnificados.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.eventoClave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
          <h3 className="font-bold text-slate-900 text-base">Distribución por Tipo de Fenómeno Recurrente</h3>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Inundaciones y Desbordes de Ríos</span>
                <span className="text-sky-700 font-bold">38.4% • 32,400 registros</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: '38.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Lluvias Intensas y Torrenciales</span>
                <span className="text-sky-700 font-bold">28.2% • 23,800 registros</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-sky-400 h-full rounded-full" style={{ width: '28.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Huaycos y Movimientos de Masa</span>
                <span className="text-amber-600 font-bold">18.6% • 15,700 registros</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '18.6%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Heladas, Friajes y Bajas Temperaturas</span>
                <span className="text-indigo-600 font-bold">10.1% • 8,500 registros</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: '10.1%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Sismos y Geodinámica Interna</span>
                <span className="text-slate-600 font-bold">4.7% • 3,969 registros</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-slate-500 h-full rounded-full" style={{ width: '4.7%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
