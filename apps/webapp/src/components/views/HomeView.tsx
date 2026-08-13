import React from 'react';
import { ActivePath } from '../../types';
import { NATIONAL_META, PERU_DEPARTAMENTOS } from '../../data/mockData';

interface HomeViewProps {
  setActivePath: (path: ActivePath) => void;
}

export default function HomeView({ setActivePath }: HomeViewProps) {
  const deptosList = Object.values(PERU_DEPARTAMENTOS);
  const highRiskDeptos = deptosList.filter(d => d.prob >= 65);
  const highRiskNames = highRiskDeptos.map(d => d.name).join(', ');

  return (
    <div className="flex flex-col w-full relative h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-pulse"></div>
        <div className="absolute top-[40%] -left-20 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-[120px] mix-blend-multiply opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 px-16 pb-16 max-w-[1600px] mx-auto w-full">
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-display-lg text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              CENEPRED <span className="font-light text-sky-700">Centro de Inteligencia para la Gestión del Riesgo</span>
            </h1>
            <p className="font-title-md text-slate-600 max-w-3xl opacity-90 text-sm">
              Plataforma Nacional de Gestión del Riesgo de Desastres. Procesamiento en tiempo real de {NATIONAL_META.totalEmergencias.toLocaleString()} emergencias históricas y monitoreo continuo de los 25 departamentos del Perú.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            
            {/* Card 1: Gauge Circular (Clickable to Monitoreo) */}
            <div
              onClick={() => setActivePath('monitoreo-diario')}
              className="col-span-1 bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:shadow-md"
              title="Haz clic para ver el monitoreo detallado por región"
            >
              <span className="font-label-sm uppercase tracking-widest text-center mb-4 text-xs font-bold text-slate-500">
                Índice de Riesgo Promedio Nacional
              </span>
              <div className="relative w-44 h-44 my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="stroke-slate-200" cx="50" cy="50" fill="none" r="45" strokeWidth="8"></circle>
                  <circle className="stroke-sky-600 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" cx="50" cy="50" fill="none" r="45" strokeDasharray="282.7" strokeDashoffset="80" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display-lg text-3xl font-extrabold text-slate-900">68<span className="text-xl text-slate-500">%</span></span>
                  <span className="font-label-sm text-xs font-bold text-sky-700">ALTO / MODERADO</span>
                </div>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold mt-2 group-hover:underline flex items-center gap-1">
                Ver Monitoreo Nacional <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 2: Regiones en Alerta Crítica (Clickable to Monitoreo) */}
              <div
                onClick={() => setActivePath('monitoreo-diario')}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col items-center justify-between text-center group hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:shadow-md"
                title="Haz clic para ver las regiones en alerta crítica"
              >
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-1 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">warning</span>
                  </div>
                  <span className="font-label-sm text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Regiones en Alerta Crítica
                  </span>
                </div>

                <div className="my-6 flex flex-col items-center justify-center w-full">
                  <span className="font-display-lg text-5xl font-extrabold text-red-600 block leading-none mb-2">
                    0{highRiskDeptos.length}
                  </span>
                  <p className="text-xs text-slate-600 font-medium max-w-[240px] truncate-3-lines leading-relaxed px-2">
                    {highRiskNames}
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-semibold text-red-600 group-hover:underline">
                  <span>Filtrar Alertas Críticas</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>

              {/* Card 3: Ejecución PP 0068 MEF (Clickable to Presupuesto MEF) */}
              <div
                onClick={() => setActivePath('presupuesto-mef')}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col items-center justify-between text-center group hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:shadow-md"
                title="Haz clic para ver el control presupuestal MEF"
              >
                <div className="flex flex-col items-center gap-1 w-full">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[22px]">account_balance</span>
                  </div>
                  <span className="font-label-sm text-xs uppercase tracking-widest text-slate-500 font-bold">
                    Ejecución PP 0068 (MEF)
                  </span>
                </div>

                <div className="my-6 flex flex-col items-center justify-center w-full px-4">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="font-display-lg text-5xl font-extrabold text-slate-900 block leading-none">
                      {NATIONAL_META.pctEjecucionNacional}%
                    </span>
                  </div>
                  <span className="font-label-sm text-xs text-slate-500 font-bold uppercase tracking-wider block mb-3">
                    Promedio Nacional
                  </span>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/60 max-w-[200px]">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}
                    ></div>
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 group-hover:underline">
                  <span>Ver Avance por Departamento</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Modules Section */}
        <section className="mt-6">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-headline-lg text-2xl font-bold text-slate-900">Módulos de Decisión Institucional</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 flex flex-col h-full group">
              <div className="h-40 relative w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-900 to-slate-900 opacity-90"></div>
                <div className="relative z-10 flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-4xl text-sky-400">wb_sunny</span>
                  <span className="font-title-md text-xl font-bold">Monitoreo de Riesgos</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                <p className="font-body-md text-sm text-slate-600">
                  Explora las métricas de los 25 departamentos del Perú con datos reales de la capa Gold: temperaturas, lluvias mm y focos FIRMS.
                </p>
                <button
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="w-full py-3 px-4 bg-sky-700 text-white font-label-sm text-xs uppercase tracking-widest rounded-xl hover:bg-sky-800 transition-all shadow-xs flex items-center justify-center gap-2 font-semibold cursor-pointer active:scale-98"
                >
                  Explorar Monitoreo <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 flex flex-col h-full group">
              <div className="h-40 relative w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900 opacity-90"></div>
                <div className="relative z-10 flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-4xl text-indigo-400">smart_toy</span>
                  <span className="font-title-md text-xl font-bold">Riesgo Predictivo & SHAP</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                <p className="font-body-md text-sm text-slate-600">
                  Simulación de escenarios (What-If) e interpretabilidad del modelo XGBoost con los pesos calculados para el territorio nacional.
                </p>
                <button
                  onClick={() => setActivePath('riesgo-predictivo')}
                  className="w-full py-3 px-4 bg-white border border-slate-300 text-slate-800 font-label-sm text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all shadow-xs flex items-center justify-center gap-2 font-semibold cursor-pointer active:scale-98"
                >
                  Simular Escenarios <span className="material-symbols-outlined text-[18px]">science</span>
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 flex flex-col h-full group">
              <div className="h-40 relative w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 to-slate-900 opacity-90"></div>
                <div className="relative z-10 flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-4xl text-emerald-400">payments</span>
                  <span className="font-title-md text-xl font-bold">Control Presupuestal</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                <p className="font-body-md text-sm text-slate-600">
                  Evaluación financiera del Programa Presupuestal 0068 (PIM total S/ {NATIONAL_META.totalPimMillones}M) frente al impacto poblacional.
                </p>
                <button
                  onClick={() => setActivePath('presupuesto-mef')}
                  className="w-full py-3 px-4 bg-white border border-slate-300 text-slate-800 font-label-sm text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all shadow-xs flex items-center justify-center gap-2 font-semibold cursor-pointer active:scale-98"
                >
                  Ver Ejecución MEF <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
