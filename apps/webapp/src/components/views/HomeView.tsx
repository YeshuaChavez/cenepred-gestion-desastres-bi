import React from 'react';
import { ActivePath } from '../../types';
import { NATIONAL_META, PERU_DEPARTAMENTOS } from '../../data/mockData';

interface HomeViewProps {
  setActivePath: (path: ActivePath) => void;
}

export default function HomeView({ setActivePath }: HomeViewProps) {
  const deptosList = Object.values(PERU_DEPARTAMENTOS);
  const highRiskDeptos = deptosList.filter(d => d.prob >= 65);
  const highRiskNames = highRiskDeptos.map(d => d.name).slice(0, 4).join(', ');

  return (
    <div className="flex flex-col w-full relative h-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-pulse"></div>
        <div className="absolute top-[40%] -left-20 w-[500px] h-[500px] bg-tertiary-fixed/30 rounded-full blur-[120px] mix-blend-multiply opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 px-16 pb-16 max-w-[1600px] mx-auto w-full">
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-display-lg text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
              CENEPRED <span className="font-light text-primary">Plataforma Ejecutiva de Inteligencia</span>
            </h1>
            <p className="font-title-md text-on-surface-variant max-w-3xl opacity-90 text-slate-600">
              Bienvenido, Director Ejecutivo. El Sistema de Alerta Temprana procesa {NATIONAL_META.totalEmergencias.toLocaleString()} emergencias históricas y datos diarios de 25 departamentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            
            {/* Card 1: Gauge */}
            <div className="col-span-1 bg-surface-container-lowest/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm shadow-primary/5 border border-white/40 flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-widest self-start mb-4 text-xs font-semibold text-slate-500">
                Índice de Riesgo Promedio Nacional
              </span>
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="stroke-surface-container-high" cx="50" cy="50" fill="none" r="45" strokeWidth="8"></circle>
                  <circle className="stroke-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" cx="50" cy="50" fill="none" r="45" strokeDasharray="282.7" strokeDashoffset="80" strokeLinecap="round" strokeWidth="8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display-lg text-3xl font-bold text-on-surface">68<span className="text-xl text-on-surface-variant">%</span></span>
                  <span className="font-label-sm text-xs text-tertiary-fixed-dim font-bold text-primary">ALTO/MODERADO</span>
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 2: Regiones en Alerta Crítica (With 3D Alert Radar Image) */}
              <div className="bg-surface-container-lowest/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm shadow-primary/5 border border-white/40 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <span className="font-label-sm text-xs uppercase tracking-widest text-slate-500 font-semibold">Regiones en Alerta Crítica</span>
                  <span className="material-symbols-outlined text-tertiary-fixed-dim p-2 bg-tertiary-fixed/20 rounded-full text-primary">warning</span>
                </div>

                {/* 3D Visual Image in the center whitespace */}
                <div className="my-2 flex justify-center items-center h-28 relative z-10">
                  <img
                    src="/assets/card_alert_icon.png"
                    alt="Alerta Crítica Radar 3D"
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="mt-2 z-10">
                  <span className="font-display-lg text-4xl font-extrabold text-on-surface block leading-none mb-1">
                    0{highRiskDeptos.length}
                  </span>
                  <span className="font-body-md text-sm text-on-surface-variant text-slate-600 truncate block font-medium">
                    {highRiskNames}
                  </span>
                </div>
              </div>

              {/* Card 3: Ejecución PP 0068 (With 3D Budget Growth Chart Image) */}
              <div className="bg-surface-container-lowest/70 backdrop-blur-xl rounded-2xl p-6 shadow-sm shadow-primary/5 border border-white/40 flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <span className="font-label-sm text-xs uppercase tracking-widest text-slate-500 font-semibold">Ejecución PP 0068 (MEF)</span>
                  <span className="material-symbols-outlined text-tertiary-fixed-dim p-2 bg-tertiary-fixed/20 rounded-full text-primary">account_balance</span>
                </div>

                {/* 3D Visual Image in the center whitespace */}
                <div className="my-2 flex justify-center items-center h-28 relative z-10">
                  <img
                    src="/assets/card_budget_icon.png"
                    alt="Presupuesto MEF 3D Chart"
                    className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="mt-2 flex flex-col gap-2 z-10">
                  <div className="flex items-end gap-2">
                    <span className="font-display-lg text-3xl font-extrabold text-on-surface block leading-none">
                      {NATIONAL_META.pctEjecucionNacional}%
                    </span>
                    <span className="font-label-sm text-xs text-slate-400 mb-1 font-semibold">PROMEDIO NACIONAL</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-fixed to-primary h-full rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex justify-between items-end mb-6">
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Módulos de Decisión Ejecutiva</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md shadow-primary/5 border border-white/50 flex flex-col h-full group">
              <div className="h-40 relative w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-900 to-slate-900 opacity-90"></div>
                <div className="relative z-10 flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-4xl text-primary">wb_sunny</span>
                  <span className="font-title-md text-xl font-bold">Monitoreo de Riesgos</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                <p className="font-body-md text-sm text-slate-600">
                  Explora las métricas de los 25 departamentos del Perú con datos reales de la capa Gold: temperaturas, lluvias mm y focos FIRMS.
                </p>
                <button
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="w-full py-3 px-4 bg-primary text-on-primary font-label-sm text-xs uppercase tracking-widest rounded-xl hover:brightness-110 transition-all shadow-sm shadow-primary/30 flex items-center justify-center gap-2 font-semibold"
                >
                  Explorar Monitoreo <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md shadow-primary/5 border border-white/50 flex flex-col h-full group">
              <div className="h-40 relative w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900 opacity-90"></div>
                <div className="relative z-10 flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-4xl text-primary">smart_toy</span>
                  <span className="font-title-md text-xl font-bold">Riesgo Predictivo & SHAP</span>
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow justify-between gap-6">
                <p className="font-body-md text-sm text-slate-600">
                  Simulación de escenarios (What-If) e interpretabilidad del modelo XGBoost con los pesos calculados para el territorio nacional.
                </p>
                <button
                  onClick={() => setActivePath('riesgo-predictivo')}
                  className="w-full py-3 px-4 bg-white/80 border border-slate-200 text-on-surface font-label-sm text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2 font-semibold"
                >
                  Simular Escenarios <span className="material-symbols-outlined text-[18px]">science</span>
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-md shadow-primary/5 border border-white/50 flex flex-col h-full group">
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
                  className="w-full py-3 px-4 bg-white/80 border border-slate-200 text-on-surface font-label-sm text-xs uppercase tracking-widest rounded-xl hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2 font-semibold"
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
