import React, { useState } from 'react';

export default function RiesgoPredictivoView() {
  const [precipSlider, setPrecipSlider] = useState<number>(25);
  const [humedadSlider, setHumedadSlider] = useState<number>(10);
  const [simulatedImpact, setSimulatedImpact] = useState<number>(65);

  const handleSimulate = () => {
    const calculated = Math.min(99, Math.round(40 + precipSlider * 0.7 + humedadSlider * 0.5));
    setSimulatedImpact(calculated);
  };

  return (
    <div className="flex flex-col w-full p-6 md:p-8 gap-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-slate-200">
        <div className="flex flex-col space-y-1">
          <h2 className="font-display-lg text-2xl font-bold text-slate-900 tracking-tight">Riesgo Predictivo e Interacciones</h2>
          <p className="font-body-md text-sm text-slate-600 max-w-2xl">
            Análisis avanzado de estimación y simulación de escenarios de riesgo climático en el territorio nacional.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-200 font-medium">
          <span className="material-symbols-outlined text-sky-700 text-sm">memory</span>
          <span className="font-body-md text-xs text-slate-800">Modelo Activo</span>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-xs flex flex-col space-y-1 border border-slate-200/80">
          <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Precisión General</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">94.2%</span>
            <span className="font-body-md text-xs text-emerald-600 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 1.5%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-xs flex flex-col space-y-1 border border-slate-200/80">
          <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Precisión en Riesgo Alto</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">89.1%</span>
            <span className="font-body-md text-xs text-emerald-600 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_upward</span> 2.2%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-xs flex flex-col space-y-1 border border-slate-200/80">
          <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Sensibilidad</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">91.5%</span>
            <span className="font-body-md text-xs text-red-600 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_downward</span> 0.4%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-xs flex flex-col space-y-1 border border-slate-200/80">
          <span className="font-label-sm text-xs text-slate-500 uppercase tracking-wider font-semibold">Margen de Error</span>
          <div className="flex items-baseline space-x-2">
            <span className="font-display-lg text-3xl font-extrabold text-slate-900">0.18</span>
            <span className="font-body-md text-xs text-emerald-600 flex items-center font-semibold">
              <span className="material-symbols-outlined text-xs">arrow_downward</span> 0.01
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col min-h-[450px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-title-md text-base font-bold text-slate-900">Factores Determinantes de la Predicción</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-sky-700 text-white rounded text-xs font-semibold">Nacional</button>
                <button className="px-3 py-1 bg-slate-100 rounded text-slate-600 text-xs font-medium hover:bg-slate-200">Regional</button>
              </div>
            </div>

            <div className="flex-1 relative flex">
              <div className="w-48 flex flex-col justify-between py-4 pr-4 border-r border-slate-200 font-body-md text-xs text-slate-600 font-medium">
                <div className="flex items-center justify-end h-8">Precipitación Acumulada</div>
                <div className="flex items-center justify-end h-8">Pendiente del Terreno</div>
                <div className="flex items-center justify-end h-8">Humedad del Suelo</div>
                <div className="flex items-center justify-end h-8">Densidad Poblacional</div>
                <div className="flex items-center justify-end h-8">Histórico Inundaciones</div>
                <div className="flex items-center justify-end h-8">Focos de Calor Activos</div>
              </div>

              <div className="flex-1 relative pl-6 py-4 flex flex-col justify-between">
                <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-300 border-l border-dashed border-slate-300"></div>

                <div className="flex items-center w-full h-8 relative">
                  <div className="h-2 w-3/4 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 rounded-full opacity-80"></div>
                </div>
                <div className="flex items-center w-full h-8 relative">
                  <div className="h-2 w-2/3 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 rounded-full opacity-80 ml-8"></div>
                </div>
                <div className="flex items-center w-full h-8 relative">
                  <div className="h-2 w-1/2 bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 rounded-full opacity-80 ml-12"></div>
                </div>
                <div className="flex items-center w-full h-8 relative">
                  <div className="h-2 w-2/5 bg-gradient-to-r from-blue-400 to-red-400 rounded-full opacity-80 ml-16"></div>
                </div>
                <div className="flex items-center w-full h-8 relative">
                  <div className="h-2 w-1/3 bg-gradient-to-r from-blue-400 to-red-400 rounded-full opacity-80 ml-20"></div>
                </div>
                <div className="flex items-center w-full h-8 relative">
                  <div className="h-2 w-1/4 bg-gradient-to-r from-blue-300 to-red-300 rounded-full opacity-80 ml-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
            <h3 className="font-title-md text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-700">tune</span> Simulador de Escenarios
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-end text-xs font-semibold">
                  <label className="text-slate-600">Precipitación 24h (+%)</label>
                  <span className="text-sky-700 font-bold">{precipSlider}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={precipSlider}
                  onChange={(e) => setPrecipSlider(Number(e.target.value))}
                  className="w-full accent-sky-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-end text-xs font-semibold">
                  <label className="text-slate-600">Humedad Suelo (+%)</label>
                  <span className="text-sky-700 font-bold">{humedadSlider}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={humedadSlider}
                  onChange={(e) => setHumedadSlider(Number(e.target.value))}
                  className="w-full accent-sky-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Impacto Predicho en Riesgo Alto:</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${simulatedImpact}%` }}></div>
                  </div>
                  <span className="font-display-lg text-2xl font-bold text-red-600">{simulatedImpact}%</span>
                </div>
              </div>

              <button
                onClick={handleSimulate}
                className="w-full py-2.5 bg-sky-700 text-white border border-sky-800 rounded-xl font-label-sm text-xs font-semibold hover:bg-sky-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span> Ejecutar Simulación
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
