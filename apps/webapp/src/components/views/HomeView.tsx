'use client';

import React, { useState } from 'react';
import { ActivePath } from '../../types';
import { NATIONAL_META, PERU_DEPARTAMENTOS } from '../../data/mockData';
import ScrollReveal from '../ScrollReveal';

interface HomeViewProps {
  setActivePath: (path: ActivePath) => void;
}

export default function HomeView({ setActivePath }: HomeViewProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeLegalModal, setActiveLegalModal] = useState<'terminos' | 'datos' | 'privacidad' | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
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
            Estimación inteligente del riesgo climático en tiempo real, monitoreo satelital continuo de precipitaciones y seguimiento de la inversión pública preventivas en las 25 regiones del país.
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
            <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-sky-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-sky-700 transition-colors">Emergencias Nacionales</span>
                <span className="p-2.5 bg-sky-50 text-sky-700 rounded-2xl group-hover:bg-sky-700 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">emergency</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {NATIONAL_META.totalEmergencias.toLocaleString()}
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">Eventos atendidos y registrados formalmente</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={200}>
            <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">Población Protegida</span>
                <span className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {NATIONAL_META.totalAfectados.toLocaleString()}
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">Personas bajo seguimiento y asistencia</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={300}>
            <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-red-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-red-700 transition-colors">Regiones Prioritarias</span>
                <span className="p-2.5 bg-red-50 text-red-700 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-red-600 mb-2 tracking-tight">
                {highRiskCount} Regiones
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">Departamentos con mayor nivel de atención</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={400}>
            <div className="bg-white/95 backdrop-blur-xl p-7 rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">Presupuesto Ejecutado</span>
                <span className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-emerald-600 mb-2 tracking-tight">
                {NATIONAL_META.pctEjecucionNacional}%
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">S/ {NATIONAL_META.totalDevengadoMillones}M invertidos en prevención</p>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 3. High Risk Regions Spotlight */}
      <section className="w-full px-6 md:px-16 py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="font-label-sm text-xs font-bold text-sky-800 uppercase tracking-widest mb-2 block">
                Vigilancia Climatológica
              </span>
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Regiones con Mayor Atención
              </h2>
            </div>
            <button
              onClick={() => setActivePath('riesgo-predictivo')}
              className="text-xs font-bold uppercase tracking-wider text-sky-800 hover:text-sky-900 transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto group"
            >
              Ver Análisis de Inferencia Completo
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highRiskDeptos.map((d, index) => (
              <ScrollReveal key={d.name} delayMs={index * 100}>
                <div
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-sky-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                        {d.name}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">
                        {d.prob}% Riesgo
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-600 mb-6 font-medium">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Precipitación 24h:</span>
                        <span className="font-bold text-slate-800">{d.precipitacionMm} mm</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Focos de Calor:</span>
                        <span className="font-bold text-slate-800">{d.focosCalor} activos</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Inversión Ejecutada:</span>
                        <span className="font-bold text-emerald-700">{d.pctEjecucion}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-800 group-hover:underline">
                    <span>Ver Detalles Regionales</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Core Features Showcase */}
      <section className="w-full px-6 md:px-16 py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-label-sm text-xs font-bold text-sky-800 uppercase tracking-widest mb-3 block">
              Plataforma Institucional
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Módulos Principales de Consulta
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <ScrollReveal delayMs={100}>
              <div
                onClick={() => setActivePath('monitoreo-diario')}
                className="bg-slate-50/60 p-8 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-sky-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-700 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">satellite_alt</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div>
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-3 group-hover:text-sky-700 transition-colors">
                    Monitoreo Diario y Mapa
                  </h3>
                  <p className="font-body-md text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Supervisión cartográfica en tiempo real con capas de lluvia acumulada, actividad térmica satelital e indicadores departamentales.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={200}>
              <div
                onClick={() => setActivePath('riesgo-predictivo')}
                className="bg-slate-50/60 p-8 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div>
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
                    Simulador de Escenarios
                  </h3>
                  <p className="font-body-md text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Ajusta variables de lluvia y clima para simular el riesgo futuro de cada departamento y generar diagnósticos ejecutivos.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={300}>
              <div
                onClick={() => setActivePath('presupuesto-mef')}
                className="bg-slate-50/60 p-8 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-700 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl">analytics</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div>
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    Presupuesto de Prevención
                  </h3>
                  <p className="font-body-md text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Transparencia y seguimiento del dinero asignado y ejecutado por las autoridades regionales para obras de defensa y mitigación.
                  </p>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* 5. Executive CTA Section */}
      <section className="w-full px-6 md:px-16 py-20 bg-slate-50">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto bg-gradient-to-r from-sky-900 via-sky-950 to-slate-900 text-white rounded-[36px] p-10 md:p-16 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/15 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl space-y-4">
                <h2 className="font-display-lg text-3xl md:text-[40px] leading-tight font-bold">
                  Acceda a la Información Nacional en Tiempo Real
                </h2>
                <p className="font-body-md text-sky-200 text-base md:text-lg font-medium">
                  Portal libre para la consulta pública de ciudadanos, estudiantes, autoridades e investigadores de todo el Perú.
                </p>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setActivePath('monitoreo-diario')}
                  className="px-8 py-4 bg-white text-sky-950 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-sky-50 hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer active:scale-95"
                >
                  EXPLORAR MONITOREO NACIONAL
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 6. FAQ Section */}
      <section className="w-full px-6 md:px-16 py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto">
          
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
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
                  <div className="bg-slate-50/60 rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                    >
                      <span className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        {item.q}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 transition-transform duration-300 border border-slate-200 ${isOpen ? 'rotate-180 bg-sky-700 text-white border-sky-700' : 'text-slate-600'}`}>
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-200/60 bg-white animate-fade-in font-medium">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* Professional Institutional Footer */}
      <footer className="w-full bg-slate-950 text-slate-400 pt-16 pb-8 px-6 md:px-16 border-t border-slate-800/80 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          {/* Main 4 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            
            {/* Col 1: Institutional Identity */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-black text-lg shadow-md">
                  <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-base tracking-tight leading-none">CENEPRED</span>
                  <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase mt-1">Gobierno del Perú</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres. Organismo público ejecutor adscrito al Ministerio de Defensa (MINDEF) y ente rector del SINAGERD.
              </p>
            </div>

            {/* Col 2: Useful Navigation */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-white font-extrabold text-xs tracking-wider uppercase border-b border-slate-800 pb-2">Secciones de la Plataforma</h4>
              <ul className="flex flex-col gap-2.5 text-xs font-medium">
                <li>
                  <button onClick={() => setActivePath('monitoreo-diario')} className="hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-sky-500">space_dashboard</span>
                    Monitoreo Diario & Telemetría Satelital
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePath('historico-tendencias')} className="hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-sky-500">show_chart</span>
                    Histórico & Tendencias Nacionales
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePath('riesgo-predictivo')} className="hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-sky-500">psychology</span>
                    Modelo Predictivo XGBoost & SHAP
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePath('presupuesto-mef')} className="hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-sky-500">account_balance</span>
                    Presupuesto de Prevención MEF
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePath('comparativo-regional')} className="hover:text-sky-400 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-sky-500">bar_chart</span>
                    Comparativo Regional 25 Departamentos
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: National Emergency Hotlines */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-white font-extrabold text-xs tracking-wider uppercase border-b border-slate-800 pb-2">Líneas de Emergencia Nacional</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Bomberos</span>
                  <span className="text-red-400 font-extrabold text-sm">116</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Policía Nacional</span>
                  <span className="text-sky-400 font-extrabold text-sm">105</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">SAMU Salud</span>
                  <span className="text-emerald-400 font-extrabold text-sm">106</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">INDECI Alerta</span>
                  <span className="text-amber-400 font-extrabold text-sm">115</span>
                </div>
              </div>
            </div>

            {/* Col 4: Sede Central & Contact */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-white font-extrabold text-xs tracking-wider uppercase border-b border-slate-800 pb-2">Sede Central & Atención</h4>
              <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm text-sky-500 shrink-0 mt-0.5">location_on</span>
                  <span>Av. del Parque Norte 313, San Isidro, Lima - Perú</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-sky-500 shrink-0">call</span>
                  <span>Central Telefónica: (01) 201-3550</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-sky-500 shrink-0">mail</span>
                  <span>consultas@cenepred.gob.pe</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-sky-500 shrink-0">schedule</span>
                  <span>Lun - Vie: 08:30 a.m. - 05:00 p.m.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-medium">
            <span>© 2026 CENEPRED. Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres. Plataforma Oficial del Estado Peruano.</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveLegalModal('terminos')}
                className="hover:text-sky-400 font-semibold transition-colors cursor-pointer"
              >
                Términos de Uso
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveLegalModal('datos')}
                className="hover:text-sky-400 font-semibold transition-colors cursor-pointer"
              >
                Datos Abiertos
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveLegalModal('privacidad')}
                className="hover:text-sky-400 font-semibold transition-colors cursor-pointer"
              >
                Política de Privacidad
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Download Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 left-6 z-[10000] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-sky-500/40 flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-emerald-400">download_done</span>
          <span className="text-xs font-bold">{downloadToast}</span>
        </div>
      )}

      {/* 1. Modal: Términos de Uso */}
      {activeLegalModal === 'terminos' && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-6 flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <span className="material-symbols-outlined text-sky-300">gavel</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Términos y Condiciones de Uso</h3>
                  <p className="text-xs text-sky-200 font-medium">CENEPRED • Sistema Nacional SINAGERD</p>
                </div>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed font-medium">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-sky-900 font-semibold flex items-start gap-3">
                <span className="material-symbols-outlined text-sky-700 shrink-0 mt-0.5">verified_user</span>
                <p>La información del Portal de Gestión del Riesgo del CENEPRED es de acceso libre, público y gratuito para todos los ciudadanos y autoridades del país.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span> 1. Naturaleza y Propósito Institucional
                </h4>
                <p>Esta plataforma ha sido desarrollada por el CENEPRED como herramienta de inteligencia de negocios para el seguimiento satelital de lluvias, alertas climáticas, focos de calor y ejecución del presupuesto público de prevención (PP 0068).</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span> 2. Libre Acceso y Reutilización de Datos
                </h4>
                <p>Toda persona física o jurídica puede consultar, analizar y citar los indicadores mostrados. La cita bibliográfica o institucional recomendada es: <em>CENEPRED - Plataforma Nacional de Gestión del Riesgo de Desastres (2026)</em>.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span> 3. Fuentes Oficiales de Información
                </h4>
                <p>Los datos consolidados provienen de los registros históricos del SINPAD (INDECI 2012-2023), la base presupuestal del Ministerio de Economía y Finanzas (MEF), la telemetría satelital NASA FIRMS y el Servicio Meteorológico Open-Meteo.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600"></span> 4. Responsabilidad y Uso Preventivo
                </h4>
                <p>Las estimaciones predictivas calculadas por modelos de Machine Learning (XGBoost) constituyen herramientas de gestión y soporte para decisiones preventivas. En situaciones de desastre activo, la población debe guiarse estrictamente por los comunicados del COEN.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Entendido y Aceptar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Modal: Portal de Datos Abiertos */}
      {activeLegalModal === 'datos' && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <span className="material-symbols-outlined text-emerald-300">dataset</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Portal de Datos Abiertos de Prevención</h3>
                  <p className="text-xs text-emerald-200 font-medium">Descarga datasets institucionales procesados en formatos abiertos</p>
                </div>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-medium">
              <p className="text-slate-600 text-xs">
                En cumplimiento con la política nacional de datos abiertos del Estado Peruano, ponemos a disposición de investigadores, estudiantes y entidades públicas los microdatos procesados de la plataforma:
              </p>

              {/* Dataset Item 1 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-400 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    PARQUET
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Base de Emergencias SINPAD (2012 - 2023)</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">25 regiones • Datos depurados de damnificados, afectados y viviendas destruidas.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDownloadToast("Descargando emergencias_sinpad_gold.parquet (10.9 MB)...");
                    setTimeout(() => setDownloadToast(null), 3500);
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">download</span> Descargar Parquet
                </button>
              </div>

              {/* Dataset Item 2 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-400 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    CSV
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Telemetría Diaria de Lluvias & Clima (Open-Meteo)</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">Precipitación diaria acumulada (mm) y temperaturas por departamento.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDownloadToast("Descargando telemetria_lluvias_peru.csv (4.2 MB)...");
                    setTimeout(() => setDownloadToast(null), 3500);
                  }}
                  className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">download</span> Descargar CSV
                </button>
              </div>

              {/* Dataset Item 3 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-400 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    JSON
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Presupuesto de Prevención MEF (PP 0068)</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">Asignación PIM, Devengado y porcentaje de ejecución en 25 departamentos.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDownloadToast("Descargando presupuesto_mef_pp0068.json (1.8 MB)...");
                    setTimeout(() => setDownloadToast(null), 3500);
                  }}
                  className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">download</span> Descargar JSON
                </button>
              </div>

              {/* Dataset Item 4 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-400 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    GEOJSON
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Matriz Estacional & Polígonos de Riesgo</h5>
                    <p className="text-slate-500 text-[11px] mt-0.5">Coordenadas geográficas y matriz de vulnerabilidad mensual por departamento.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDownloadToast("Descargando riesgo_estacional_peru.geojson (850 KB)...");
                    setTimeout(() => setDownloadToast(null), 3500);
                  }}
                  className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span className="material-symbols-outlined text-xs">download</span> Descargar GeoJSON
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-semibold">Licencia: Creative Commons Atribución 4.0 Internacional (CC BY 4.0)</span>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 3. Modal: Política de Privacidad */}
      {activeLegalModal === 'privacidad' && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden font-sans">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-950 text-white p-6 flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
                  <span className="material-symbols-outlined text-sky-300">lock</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg tracking-tight">Política de Privacidad y Transparencia</h3>
                  <p className="text-xs text-slate-300 font-medium">Cumplimiento Ley N° 29733 y Ley N° 27806</p>
                </div>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed font-medium">
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-800 font-semibold flex items-start gap-3">
                <span className="material-symbols-outlined text-slate-700 shrink-0 mt-0.5">security</span>
                <p>El CENEPRED garantiza la estricta protección de la privacidad de los usuarios. Esta plataforma no recopila ni comercializa datos personales de ninguna naturaleza.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span> 1. Sin Requerimiento de Registro Personal
                </h4>
                <p>El acceso a los dashboards de monitoreo, simulación de riesgo y datos presupuestales es completamente libre y no requiere la creación de usuarios, contraseñas ni la entrega de nombres, DNI o correos electrónicos.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span> 2. Telemetría Técnica Anónima
                </h4>
                <p>Con el único fin de optimizar el tiempo de respuesta del servidor y prevenir ataques informáticos, se registran únicamente métricas anónimas agregadas (IP anonimizada y tipo de navegador).</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span> 3. Seguridad de Infraestructura Servidor
                </h4>
                <p>Toda la navegación está cifrada bajo el protocolo gubernamental seguro HTTPS con algoritmos TLS 1.3 y protección activa de cortafuegos de red en la infraestructura Vercel/Azure.</p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span> 4. Oficialía de Transparencia CENEPRED
                </h4>
                <p>Para consultas formales relativas a la Ley de Transparencia y Acceso a la Información Pública (Ley N° 27806), puede escribir directamente a <code>transparencia@cenepred.gob.pe</code> o dirigirse a la Av. del Parque Norte 313, San Isidro, Lima.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
