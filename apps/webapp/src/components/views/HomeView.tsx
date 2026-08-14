import React from 'react';
import { ActivePath } from '../../types';
import { NATIONAL_META, PERU_DEPARTAMENTOS } from '../../data/mockData';
import ScrollReveal from '../ScrollReveal';

interface HomeViewProps {
  setActivePath: (path: ActivePath) => void;
}

export default function HomeView({ setActivePath }: HomeViewProps) {
  const deptosList = Object.values(PERU_DEPARTAMENTOS);
  const highRiskDeptos = deptosList.filter(d => d.prob >= 65);

  return (
    <div className="flex flex-col w-full bg-background -mt-20 overflow-x-hidden">
      
      {/* 1. Hero Section (Cinematic 4K UHD Video Background) */}
      <section className="relative w-full min-h-[680px] h-[88vh] flex items-center justify-center overflow-hidden bg-slate-950 pt-12 pb-16">
        
        {/* Ambient Video & Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity transform-gpu"
          >
            <source src="/videos/14636688-uhd_3840_2160_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/50 to-slate-950/90 backdrop-blur-[1px]"></div>
        </div>

        {/* Hero Content (Generous spacing & refined typography) */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto my-auto animate-fade-in-up">
          
          <span className="font-label-sm text-xs text-sky-300 uppercase tracking-[0.2em] mb-8 py-2 px-5 bg-white/10 rounded-full backdrop-blur-md border border-white/20 shadow-lg font-bold">
            Plataforma Nacional de Inteligencia
          </span>

          <h1 className="font-display-lg text-3xl sm:text-5xl md:text-[60px] md:leading-[72px] text-white font-extrabold tracking-tight mb-8 drop-shadow-2xl max-w-4xl">
            CENEPRED — Centro de Inteligencia para la <span className="text-sky-400 font-extrabold">Gestión del Riesgo</span>
          </h1>

          <p className="font-body-md text-base sm:text-lg md:text-[20px] leading-relaxed text-slate-200/90 max-w-2xl mb-10 font-normal">
            Procesamiento en tiempo real de <span className="font-bold text-white">84,369</span> emergencias históricas · Monitoreo continuo de los 25 departamentos del Perú.
          </p>

          <button
            onClick={() => setActivePath('monitoreo-diario')}
            className="group relative px-9 py-4 bg-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-sky-400 transition-all duration-300 shadow-[0_0_50px_-10px_rgba(56,189,248,0.6)] hover:shadow-[0_0_70px_-10px_rgba(56,189,248,0.9)] overflow-hidden cursor-pointer active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              Ver Monitoreo Nacional
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-sm">arrow_forward</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          </button>
        </div>
      </section>

      {/* 2. Institutional Mission Section */}
      <section className="relative z-20 w-full px-6 py-24 bg-slate-50 -mt-12 rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.08)] border-t border-slate-200/60">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="material-symbols-outlined text-[48px] text-sky-700 opacity-90">account_balance</span>
            <h2 className="font-headline-lg text-3xl md:text-4xl text-slate-900 font-bold tracking-tight">
              Prevención Estratégica Basada en Evidencia
            </h2>
            <p className="font-body-md text-base md:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              El Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres (CENEPRED) provee inteligencia accionable para proteger la vida y el patrimonio de los peruanos, articulando tecnología predictiva y gestión territorial dinámica.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. Live Data Section (Indicadores en Vivo) */}
      <section className="w-full px-6 md:px-16 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <h2 className="font-headline-lg text-3xl md:text-[38px] font-bold text-slate-900 tracking-tight mb-1">
                  Datos en Vivo
                </h2>
                <p className="font-body-md text-sm text-slate-500">
                  Estado actual del territorio nacional
                </p>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Indicador 1: Riesgo Nacional */}
            <ScrollReveal delayMs={0}>
              <div
                onClick={() => setActivePath('monitoreo-diario')}
                className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group cursor-pointer h-full"
                title="Ver Monitoreo Diario de Riesgo"
              >
                {/* BetterUp 3D Background Curtain Reveal on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/15 via-sky-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-3xl pointer-events-none"></div>

                <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-widest mb-6 font-bold relative z-10">
                  Índice de Riesgo Nacional
                </h3>
                
                <div className="flex flex-col items-center justify-center relative z-10">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle className="text-slate-200" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-gauge" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="283" strokeDashoffset="90" strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="font-display-lg text-[42px] font-extrabold leading-none text-slate-900">
                        68<span className="text-xl text-slate-400">%</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="font-label-sm text-xs font-bold text-slate-800">ALTO / MODERADO</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Indicador 2: Alertas Críticas */}
            <ScrollReveal delayMs={150}>
              <div
                onClick={() => setActivePath('monitoreo-diario')}
                className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group cursor-pointer h-full"
                title="Filtrar Regiones en Alerta Crítica"
              >
                {/* BetterUp 3D Background Curtain Reveal on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/15 via-red-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-3xl pointer-events-none"></div>

                <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-widest mb-4 font-bold relative z-10">
                  Regiones en Alerta Crítica
                </h3>
                
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <span className="font-display-lg text-[68px] font-extrabold leading-none text-red-600 tracking-tighter">
                      0{highRiskDeptos.length}
                    </span>
                    <p className="font-body-md text-sm text-slate-600 mt-2 font-semibold">
                      Emergencias activas Nivel 4
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <ul className="flex flex-wrap gap-2">
                      {highRiskDeptos.slice(0, 5).map((d) => (
                        <li key={d.name} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-label-sm text-[11px] font-bold uppercase hover:bg-red-600 hover:text-white transition-colors">
                          {d.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Indicador 3: Presupuesto MEF */}
            <ScrollReveal delayMs={300}>
              <div
                onClick={() => setActivePath('presupuesto-mef')}
                className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group cursor-pointer h-full"
                title="Ver Control Presupuestal MEF PP 0068"
              >
                {/* BetterUp 3D Background Curtain Reveal on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/15 via-emerald-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-3xl pointer-events-none"></div>

                <h3 className="font-label-sm text-xs text-slate-500 uppercase tracking-widest mb-6 font-bold relative z-10">
                  Ejecución PP 0068 (MEF)
                </h3>
                
                <div className="flex flex-col h-full justify-center relative z-10">
                  <div className="flex justify-between items-end mb-4">
                    <span className="font-display-lg text-[44px] font-extrabold leading-none text-emerald-600">
                      {NATIONAL_META.pctEjecucionNacional}<span className="text-xl text-slate-400">%</span>
                    </span>
                    <span className="font-label-sm text-xs text-slate-500 mb-1 font-bold">Promedio Nac.</span>
                  </div>

                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-500 rounded-full relative transition-all duration-700"
                      style={{ width: `${NATIONAL_META.pctEjecucionNacional}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>

                  <p className="font-body-md text-xs text-slate-500 mt-6 leading-relaxed">
                    Programa Presupuestal 0068: Reducción de Vulnerabilidad y Atención de Emergencias
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 4. Services Grid Section (Servicios de Inteligencia) */}
      <section className="w-full px-6 md:px-16 py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          
          <ScrollReveal>
            <div className="mb-14">
              <h2 className="font-headline-lg text-3xl md:text-[38px] font-bold text-slate-900 tracking-tight mb-2">
                Servicios de Inteligencia
              </h2>
              <p className="font-body-md text-slate-600 text-base max-w-2xl">
                Herramientas analíticas diseñadas para la toma de decisiones ejecutivas en los tres niveles de gobierno.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            
            {/* Card 1 (Large Featured) */}
            <ScrollReveal className="lg:col-span-2" delayMs={0}>
              <div
                onClick={() => setActivePath('monitoreo-diario')}
                className="w-full bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-xs group relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[300px]"
              >
                {/* BetterUp Background Curtain Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/15 via-sky-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-[28px] pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[30px]">satellite_alt</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                    Monitoreo Diario
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Supervisión continua de peligros inminentes, variables meteorológicas e hidrológicas integradas con las 25 regiones del Perú y mapas satelitales.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Historico & Tendencias */}
            <ScrollReveal delayMs={100}>
              <div
                onClick={() => setActivePath('historico-tendencias')}
                className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-xs group relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[300px]"
              >
                {/* BetterUp Background Curtain Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/15 via-indigo-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-[28px] pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[30px]">history</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">
                    Histórico & Tendencias
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Análisis longitudinal y explorador Time-Intelligence (Año → Trimestre → Mes → Día) sobre 84,369 emergencias pasadas.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3: Riesgo Predictivo & SHAP */}
            <ScrollReveal delayMs={150}>
              <div
                onClick={() => setActivePath('riesgo-predictivo')}
                className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-xs group relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[300px]"
              >
                {/* BetterUp Background Curtain Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/15 via-amber-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-[28px] pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[30px]">model_training</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                    Riesgo Predictivo & SHAP
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Modelos de Machine Learning explicables (XGBoost) con simulador de escenarios What-If en tiempo real.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 4: Comparativo Regional */}
            <ScrollReveal delayMs={200}>
              <div
                onClick={() => setActivePath('comparativo-regional')}
                className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-xs group relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[300px]"
              >
                {/* BetterUp Background Curtain Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/15 via-sky-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-[28px] pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[30px]">map</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                    Comparativo Regional
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Herramienta de confrontación lado a lado de departamentos y matriz estacional región × mes.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 5: Presupuesto MEF */}
            <ScrollReveal delayMs={250}>
              <div
                onClick={() => setActivePath('presupuesto-mef')}
                className="bg-white p-8 rounded-[28px] border border-slate-200/80 shadow-xs group relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[300px]"
              >
                {/* BetterUp Background Curtain Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/15 via-emerald-400/5 to-transparent scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 ease-out rounded-[28px] pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start mb-12">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[30px]">account_balance_wallet</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    Presupuesto MEF PP 0068
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Seguimiento financiero de la asignación y ejecución presupuestal destinada a la gestión del riesgo (S/ 1,420M PIM).
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 5. Executive CTA Section */}
      <section className="w-full px-6 md:px-16 py-24 bg-white">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto bg-sky-900 text-white rounded-[36px] p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl space-y-4">
                <h2 className="font-display-lg text-3xl md:text-[44px] leading-tight font-bold">
                  Acceda al Sistema de Información Nacional
                </h2>
                <p className="font-body-md text-sky-200 text-base md:text-lg">
                  Plataforma abierta para la consulta ciudadana, especialistas y gestores del riesgo de desastres a nivel nacional, regional y local.
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="px-8 py-4 bg-white text-sky-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-sky-50 transition-colors shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer active:scale-95"
                >
                  EXPLORAR PLATAFORMA
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 px-6 md:px-16 border-t border-slate-800 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white uppercase text-sm">CENEPRED</span>
            <span>© 2026 Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres • UNMSM BI</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Portal Institucional</span>
            <span>Transparencia de Datos</span>
            <span>SIAF MEF</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
