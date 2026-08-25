'use client';

import React, { useState } from 'react';
import { ActivePath } from '../../types';
import { NATIONAL_META, PERU_DEPARTAMENTOS, LOGO_CENEPRED } from '../../data/mockData';
import ScrollReveal from '../ScrollReveal';

interface HomeViewProps {
  setActivePath: (path: ActivePath) => void;
}

export default function HomeView({ setActivePath }: HomeViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'terminos' | 'privacidad' | null>(null);
  const deptosList = Object.values(PERU_DEPARTAMENTOS);
  const highRiskDeptos = [...deptosList].sort((a, b) => b.prob - a.prob).slice(0, 4);
  const highRiskCount = deptosList.filter(d => d.prob >= 50).length;

  const faqList = [
    {
      q: '¿Para qué sirve esta plataforma del CENEPRED?',
      a: 'Permite consultar libremente el nivel de riesgo de desastres en las 25 regiones del Perú, monitorear alertas climáticas y verificar la ejecución del presupuesto estatal destinado a proteger a la población.'
    },
    {
      q: '¿Cómo puedo saber si mi región o departamento está en riesgo?',
      a: 'Ingresa a "Monitoreo Nacional" o "Riesgo Predictivo". Verás un mapa interactivo con semáforos de riesgo (bajo, medio, alto o crítico) calculado a partir de lluvias, clima y datos oficiales.'
    },
    {
      q: '¿Con qué frecuencia se actualiza la información del portal?',
      a: 'La telemetría del clima y focos de calor satelitales se actualiza automáticamente varias veces al día, mientras que los datos presupuestales se sincronizan con las fuentes del Estado.'
    },
    {
      q: '¿Qué información puedo consultar sobre el presupuesto del Estado?',
      a: 'En la sección "Presupuesto de Prevención" puedes consultar cuánto dinero ha asignado el Gobierno a cada región para obras de reducción del riesgo y qué porcentaje ha sido ejecutado.'
    },
    {
      q: '¿Cómo funciona el Asistente Virtual CENEPRED?',
      a: 'En la esquina inferior derecha encontrarás el botón del asistente inteligente. Puedes escribir o usar tu micrófono para hacerle preguntas directas en lenguaje sencillo.'
    },
    {
      q: '¿Es necesario registrarse o crear una cuenta para usar la plataforma?',
      a: 'No. El acceso es totalmente público, gratuito e ilimitado para cualquier ciudadano, estudiante, autoridad o profesional interesado.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col w-full bg-[#f8fafc] dark:bg-[#060d1f] -mt-20 overflow-x-hidden transition-colors duration-300">
      
      {/* 1. Hero Section (Cinematic Video Background) */}
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
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity transform-gpu scale-105 transition-transform duration-1000"
          >
            <source src="/videos/14636688-uhd_3840_2160_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/55 to-slate-950/90 backdrop-blur-[1px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto my-auto animate-fade-in-up">
          
          <h1 className="font-display-lg text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8 pt-6 sm:pt-8">
            Gestión del Riesgo de Desastres <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent drop-shadow-md">
              en el Perú
            </span>
          </h1>

          <p className="font-body-md text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-12">
            Estimación inteligente del riesgo climático en tiempo real, monitoreo satelital continuo de precipitaciones y seguimiento de la inversión pública preventiva en las 25 regiones del país.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <button
              onClick={() => setActivePath('monitoreo-diario')}
              className="w-full sm:w-auto px-8 py-4 bg-sky-600 text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-[0_6px_25px_rgba(2,132,199,0.45)] hover:bg-sky-500 hover:shadow-[0_8px_30px_rgba(2,132,199,0.65)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">map</span>
              Explorar Monitoreo Nacional
            </button>
            <button
              onClick={() => setActivePath('riesgo-predictivo')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20 hover:border-white/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">trending_up</span>
              Simulador de Riesgo
            </button>
          </div>

        </div>
      </section>

      {/* 2. Key Indicators Grid (High Impact Metrics) */}
      <section className="w-full px-6 md:px-16 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <ScrollReveal delayMs={100}>
            <div className="bg-white/95 dark:bg-[#0c1833]/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-sky-400 dark:hover:border-sky-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Emergencias Nacionales</span>
                <span className="p-2.5 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">emergency</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-sky-600 dark:text-sky-400 mb-2 tracking-tight">
                {NATIONAL_META.totalEmergencias.toLocaleString()}
              </div>
              <p className="font-body-md text-xs text-slate-500 dark:text-slate-400 font-medium">Eventos atendidos y registrados formalmente</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={200}>
            <div className="bg-white/95 dark:bg-[#0c1833]/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Población Protegida</span>
                <span className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-amber-600 dark:text-amber-400 mb-2 tracking-tight">
                {NATIONAL_META.totalAfectados.toLocaleString()}
              </div>
              <p className="font-body-md text-xs text-slate-500 dark:text-slate-400 font-medium">Personas bajo seguimiento y asistencia</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={300}>
            <div className="bg-white/95 dark:bg-[#0c1833]/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-red-400 dark:hover:border-red-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Regiones Prioritarias</span>
                <span className="p-2.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-red-600 dark:text-red-400 mb-2 tracking-tight">
                {highRiskCount} Regiones
              </div>
              <p className="font-body-md text-xs text-slate-500 dark:text-slate-400 font-medium">Departamentos con mayor nivel de atención</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={400}>
            <div className="bg-white/95 dark:bg-[#0c1833]/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Presupuesto Ejecutado</span>
                <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2 tracking-tight">
                {NATIONAL_META.pctEjecucionNacional}%
              </div>
              <p className="font-body-md text-xs text-slate-500 dark:text-slate-400 font-medium">S/ {NATIONAL_META.totalDevengadoMillones.toLocaleString('es-PE', { maximumFractionDigits: 1 })}M invertidos en prevención</p>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 3. High Risk Regions Spotlight */}
      <section className="relative w-full px-6 md:px-16 py-20 bg-slate-50/60 dark:bg-[#081024]/60 transition-colors duration-300 overflow-hidden">
        {/* Decoracion de fondo */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.28) 1px, transparent 0)', backgroundSize: '26px 26px' }}></div>
        <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] bg-red-400/10 dark:bg-red-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="font-label-sm text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-red-500">radar</span>
                Vigilancia Climatológica
              </span>
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Regiones con Mayor Atención
              </h2>
            </div>
            <button
              onClick={() => setActivePath('riesgo-predictivo')}
              className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto group"
            >
              Ver Análisis de Inferencia Completo
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highRiskDeptos.map((d, index) => {
              const accent = d.prob >= 65 ? '#dc2626' : d.prob >= 55 ? '#ea580c' : '#d97706';
              return (
              <ScrollReveal key={d.name} delayMs={index * 100}>
                <div
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="relative bg-white dark:bg-[#0c1833] p-6 pl-7 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full overflow-hidden"
                >
                  {/* Barra de acento por nivel de riesgo */}
                  <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-3xl" style={{ backgroundColor: accent }}></span>
                  {/* Ranking translucido */}
                  <span className="absolute top-3 right-4 font-headline-lg text-5xl font-extrabold text-slate-100 dark:text-white/5 leading-none select-none">{index + 1}</span>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                        {d.name}
                      </span>
                      <span className="px-3 py-1 text-[11px] font-bold rounded-full border" style={{ color: accent, backgroundColor: `${accent}1a`, borderColor: `${accent}40` }}>
                        {d.prob}% Riesgo
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 mb-6 font-medium">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-400 dark:text-slate-500">Lluvia (30d):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.precip30d ?? 0} mm</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-400 dark:text-slate-500">Focos de Calor (30d):</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{d.focos30d ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 dark:text-slate-500">Inversión Ejecutada:</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">{d.pctEjecucion}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400 group-hover:underline">
                    <span>Ver Detalles Regionales</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. Core Features Showcase */}
      <section className="relative w-full px-6 md:px-16 py-24 bg-white dark:bg-[#060d1f] border-y border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 overflow-hidden">
        {/* Decoracion de fondo */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.35]" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.14) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 78%)' }}></div>
        <div className="pointer-events-none absolute top-10 -left-32 w-[380px] h-[380px] bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl"></div>
        <div className="pointer-events-none absolute bottom-0 -right-32 w-[380px] h-[380px] bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-label-sm text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest mb-3 inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">apps</span>
              Plataforma Institucional
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              Módulos Principales de Consulta
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">

            {[
              { path: 'monitoreo-diario', icon: 'satellite_alt', color: 'sky', title: 'Monitoreo Diario y Mapa', desc: 'Supervisión cartográfica en tiempo real con capas de lluvia acumulada, actividad térmica satelital e indicadores departamentales.' },
              { path: 'riesgo-predictivo', icon: 'psychology', color: 'indigo', title: 'Simulador de Escenarios', desc: 'Ajusta variables de lluvia y clima para simular el riesgo futuro de cada departamento y generar diagnósticos ejecutivos.' },
              { path: 'presupuesto-mef', icon: 'analytics', color: 'emerald', title: 'Presupuesto de Prevención', desc: 'Transparencia y seguimiento del dinero asignado y ejecutado por las autoridades regionales para obras de defensa y mitigación.' },
              { path: 'historico-tendencias', icon: 'timeline', color: 'amber', title: 'Histórico y Tendencias', desc: 'Evolución multianual de las emergencias y su estacionalidad para anticipar los meses de mayor riesgo en cada región.' },
              { path: 'comparativo-regional', icon: 'leaderboard', color: 'rose', title: 'Comparativo Regional', desc: 'Compara riesgo, telemetría y ejecución presupuestal entre los 25 departamentos con una matriz estacional interactiva.' }
            ].map((f, i) => {
              const COLOR: Record<string, { gradient: string; iconBox: string; titleHover: string; borderHover: string }> = {
                sky: { gradient: 'from-sky-500 to-cyan-400', iconBox: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 group-hover:bg-sky-600', titleHover: 'group-hover:text-sky-600 dark:group-hover:text-sky-400', borderHover: 'hover:border-sky-400 dark:hover:border-sky-400' },
                indigo: { gradient: 'from-indigo-500 to-violet-400', iconBox: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600', titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400', borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-400' },
                emerald: { gradient: 'from-emerald-500 to-teal-400', iconBox: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600', titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400', borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-400' },
                amber: { gradient: 'from-amber-500 to-orange-400', iconBox: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 group-hover:bg-amber-600', titleHover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400', borderHover: 'hover:border-amber-400 dark:hover:border-amber-400' },
                rose: { gradient: 'from-rose-500 to-pink-400', iconBox: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 group-hover:bg-rose-600', titleHover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400', borderHover: 'hover:border-rose-400 dark:hover:border-rose-400' }
              };
              const { gradient, iconBox, titleHover, borderHover } = COLOR[f.color] || COLOR.sky;
              return (
                <ScrollReveal key={f.path} delayMs={(i + 1) * 100} className={`md:col-span-2 ${i === 3 ? 'md:col-start-2' : ''}`}>
                  <div
                    onClick={() => setActivePath(f.path as ActivePath)}
                    className={`relative bg-slate-50/70 dark:bg-[#0c1833]/70 p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs hover:shadow-xl ${borderHover} hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full overflow-hidden`}
                  >
                    {/* Linea de acento superior en hover */}
                    <span className={`absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} transition-all duration-500 rounded-t-3xl`}></span>
                    {/* Numero de indice translucido */}
                    <span className="absolute -bottom-4 right-3 font-headline-lg text-8xl font-extrabold text-slate-100 dark:text-white/[0.04] leading-none select-none">0{i + 1}</span>

                    <div className="relative flex items-center justify-between mb-8">
                      <div className={`w-14 h-14 ${iconBox} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:text-white transition-all duration-300 shadow-sm`}>
                        <span className="material-symbols-outlined text-3xl">{f.icon}</span>
                      </div>
                      <span className={`material-symbols-outlined text-slate-400 dark:text-slate-500 ${titleHover} group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl`}>arrow_outward</span>
                    </div>

                    <div className="relative">
                      <h3 className={`font-headline-lg text-2xl font-bold text-slate-900 dark:text-white mb-3 ${titleHover} transition-colors`}>
                        {f.title}
                      </h3>
                      <p className="font-body-md text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}

          </div>
        </div>
      </section>

      {/* 4b. Fuentes de datos oficiales */}
      <section className="w-full px-6 md:px-16 py-14 bg-slate-50/60 dark:bg-[#081024]/60 transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-label-sm text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6 inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-sky-600 dark:text-sky-400">verified</span>
              Integramos datos de fuentes oficiales
            </span>
          </ScrollReveal>
          <ScrollReveal delayMs={120}>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              {['INDECI / SINPAD', 'Open-Meteo (ERA5)', 'NASA FIRMS', 'USGS', 'NOAA', 'INEI', 'MEF'].map((src) => (
                <span
                  key={src}
                  className="px-4 py-2 rounded-full bg-white dark:bg-[#0c1833] border border-slate-200/90 dark:border-slate-800/90 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-2xs hover:border-sky-300 dark:hover:border-sky-500/50 hover:text-sky-700 dark:hover:text-sky-400 transition-colors"
                >
                  {src}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Executive CTA Section */}
      <section className="w-full px-6 md:px-16 py-20 bg-slate-50 dark:bg-[#060d1f] transition-colors duration-300">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#0c365a] via-sky-900 to-[#0c365a] dark:from-[#081f3d] dark:via-sky-950 dark:to-[#081f3d] text-white rounded-[36px] p-10 md:p-16 relative overflow-hidden shadow-2xl border border-sky-800/40">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/15 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[440px] h-[440px] bg-cyan-400/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
            {/* Patron de puntos */}
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl space-y-5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest text-sky-100 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-sm">public</span>
                  Portal público nacional
                </span>
                <h2 className="font-display-lg text-3xl md:text-[40px] leading-tight font-bold">
                  Acceda a la Información Nacional en Tiempo Real
                </h2>
                <p className="font-body-md text-sky-200 text-base md:text-lg font-medium">
                  Portal libre para la consulta pública de ciudadanos, estudiantes, autoridades e investigadores de todo el Perú.
                </p>

                {/* Chips de datos */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {[
                    { icon: 'map', label: '25 regiones cubiertas' },
                    { icon: 'update', label: 'Actualización diaria' },
                    { icon: 'lock_open', label: 'Acceso libre y gratuito' }
                  ].map((chip) => (
                    <span key={chip.label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-100/90 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                      <span className="material-symbols-outlined text-sm text-cyan-300">{chip.icon}</span>
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="px-8 py-4 bg-white text-sky-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-sky-50 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">map</span>
                  EXPLORAR MONITOREO NACIONAL
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. FAQ Section */}
      <section className="relative w-full px-6 md:px-16 py-24 bg-white dark:bg-[#060d1f] border-t border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300 overflow-hidden">
        {/* Decoracion de fondo */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-sky-400/10 dark:bg-sky-500/[0.07] rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-5xl mx-auto">

          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="font-label-sm text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest mb-3 inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">help</span>
                Centro de ayuda
              </span>
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Preguntas Frecuentes
              </h2>
            </div>
          </ScrollReveal>

          {/* Accordion List */}
          <div className="space-y-4">
            {faqList.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <ScrollReveal key={index} delayMs={index * 60}>
                  <div className="bg-slate-50/70 dark:bg-[#0c1833]/70 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <span className="font-bold text-sm md:text-base text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        {item.q}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 transition-transform duration-300 border border-slate-200 dark:border-slate-700 ${isOpen ? 'rotate-180 bg-sky-600 dark:bg-sky-500 text-white border-sky-600' : 'text-slate-600 dark:text-slate-300'}`}>
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed border-t border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#091329] animate-fade-in font-medium">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

          <ScrollReveal delayMs={120}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">¿No encuentras lo que buscas?</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event('open-cenepred-assistant'))}
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:underline transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
                Pregúntale al Asistente CENEPRED
              </button>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Footer Institucional */}
      <footer className="w-full bg-[#0a2540] dark:bg-[#051322] text-[#94a3b8] text-xs border-t border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-16">

          {/* Contenido principal */}
          <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-8 border-b border-white/10">

            {/* Identidad institucional */}
            <div className="md:col-span-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <img src={LOGO_CENEPRED} alt="CENEPRED" className="h-8 w-auto" />
                <span className="text-white font-bold text-sm tracking-tight">CENEPRED</span>
              </div>
              <p className="leading-relaxed text-[#7d8fa3]">
                Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres.
                Organismo público ejecutor adscrito al Ministerio de Defensa,
                ente rector del SINAGERD.
              </p>
            </div>

            {/* Navegación */}
            <div className="md:col-span-3">
              <h4 className="text-[#cbd5e1] font-semibold text-[11px] uppercase tracking-wider mb-3">Plataforma</h4>
              <ul className="flex flex-col gap-1.5">
                <li><button onClick={() => setActivePath('monitoreo-diario')} className="hover:text-white transition-colors cursor-pointer">Monitoreo y Telemetría</button></li>
                <li><button onClick={() => setActivePath('historico-tendencias')} className="hover:text-white transition-colors cursor-pointer">Histórico y Tendencias</button></li>
                <li><button onClick={() => setActivePath('riesgo-predictivo')} className="hover:text-white transition-colors cursor-pointer">Modelo Predictivo</button></li>
                <li><button onClick={() => setActivePath('presupuesto-mef')} className="hover:text-white transition-colors cursor-pointer">Presupuesto MEF</button></li>
                <li><button onClick={() => setActivePath('comparativo-regional')} className="hover:text-white transition-colors cursor-pointer">Comparativo Regional</button></li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="md:col-span-3">
              <h4 className="text-[#cbd5e1] font-semibold text-[11px] uppercase tracking-wider mb-3">Contacto</h4>
              <ul className="flex flex-col gap-1.5">
                <li>Av. Del Parque Norte 829 - 833, San Isidro, Lima</li>
                <li>Central: (01) 412-5940</li>
                <li>mesadepartes@cenepred.gob.pe</li>
                <li>Lun - Vie: 08:30 - 16:30</li>
              </ul>
            </div>

            {/* Emergencias */}
            <div className="md:col-span-2">
              <h4 className="text-[#cbd5e1] font-semibold text-[11px] uppercase tracking-wider mb-3">Emergencias</h4>
              <ul className="flex flex-col gap-1.5">
                <li className="flex justify-between"><span>Bomberos</span><span className="text-white font-semibold">116</span></li>
                <li className="flex justify-between"><span>PNP</span><span className="text-white font-semibold">105</span></li>
                <li className="flex justify-between"><span>SAMU</span><span className="text-white font-semibold">106</span></li>
                <li className="flex justify-between"><span>INDECI</span><span className="text-white font-semibold">115</span></li>
              </ul>
            </div>

          </div>

          {/* Barra inferior */}
          <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#64748b]">
            <span>&copy; {new Date().getFullYear()} CENEPRED &mdash; Gobierno del Perú</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveLegalModal('terminos')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Términos de uso
              </button>
              <span className="text-[#475569]">|</span>
              <button
                onClick={() => setActiveLegalModal('privacidad')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacidad
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Modal Legal: Términos / Privacidad */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0c1833] rounded-3xl max-w-2xl w-full p-8 max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-700 shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            
            <h3 className="font-headline-lg text-2xl font-bold text-slate-900 dark:text-white mb-4">
              {activeLegalModal === 'terminos' ? 'Términos de Uso' : 'Política de Privacidad'}
            </h3>
            
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed font-medium">
              {activeLegalModal === 'terminos' ? (
                <>
                  <p>La información contenida en este portal institucional es de carácter oficial y libre acceso conforme a la Ley de Transparencia y Acceso a la Información Pública.</p>
                  <p>Los datos cartográficos y meteorológicos son provistos por entidades científicas y técnicas oficiales del Estado Peruano (CENEPRED, INDECI, SENAMHI, MEF) e internacionales (NASA, USGS).</p>
                  <p>Queda autorizada la reproducción total o parcial de los datos con fines de estudio, investigación, planificación territorial y prevención ciudadana, citando como fuente al CENEPRED.</p>
                </>
              ) : (
                <>
                  <p>El CENEPRED garantiza la confidencialidad y el tratamiento seguro de las interacciones realizadas en este portal público conforme a la Ley N° 29733 (Ley de Protección de Datos Personales).</p>
                  <p>No se recopilan datos privados sensibles sin el consentimiento explícito de los usuarios. Las consultas anónimas y telemetría de navegación son procesadas únicamente para fines estadísticos y optimización del servicio público.</p>
                </>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-6 py-2.5 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-sky-500 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
