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
  const deptosList = Object.values(PERU_DEPARTAMENTOS);
  const highRiskDeptos = deptosList.filter(d => d.prob >= 65);

  const faqList = [
    {
      q: '¿Para qué sirve esta plataforma del CENEPRED?',
      a: 'Permite consultar de forma libre y en tiempo real el nivel de riesgo de desastres en las 25 regiones del Perú, el historial de emergencias registradas y el uso del presupuesto del Estado destinado a prevenir desastres.'
    },
    {
      q: '¿Cómo puedo saber si mi región o departamento está en riesgo de desastre?',
      a: 'Ingresa a la sección "Monitoreo Diario" o "Riesgo Predictivo" en el menú superior. Ahí podrás ver el mapa interactivo del Perú con el nivel de riesgo de cada departamento (bajo, medio, alto o crítico) basado en lluvias, clima e historial de la zona.'
    },
    {
      q: '¿Con qué frecuencia se actualiza la información del portal?',
      a: 'La información del clima, precipitaciones y focos de calor satelitales se actualiza automáticamente cada 24 horas. Los datos sobre emergencias ocurridas y presupuestos ejecutados por el Estado se sincronizan diariamente.'
    },
    {
      q: '¿Qué información puedo consultar sobre el presupuesto del Estado?',
      a: 'En la sección "Presupuesto MEF" puedes ver cuánto dinero se ha asignado a cada departamento para obras de prevención de desastres (como limpieza de ríos y construcción de defensas) y cuánto de ese dinero se ha ejecutado hasta la fecha.'
    },
    {
      q: '¿Cómo puedo usar el Asistente Virtual para hacer preguntas?',
      a: 'En la esquina inferior derecha encontrarás un botón flotante con el icono de un robot o asistente. Haz clic en él y podrás escribir o hablar por micrófono para preguntar sobre cualquier región, presupuesto o emergencia en lenguaje sencillo.'
    },
    {
      q: '¿Es necesario registrarse o crear una cuenta para usar la plataforma?',
      a: 'No. La plataforma es totalmente libre, gratuita y de acceso público para cualquier ciudadano, estudiante, autoridad o investigador sin necesidad de registrarse ni iniciar sesión.'
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
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity transform-gpu"
          >
            <source src="/videos/14636688-uhd_3840_2160_30fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/50 to-slate-950/90 backdrop-blur-[1px]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto my-auto animate-fade-in-up">
          
          <h1 className="font-display-lg text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
            Gestión del Riesgo de Desastres <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              en el Perú
            </span>
          </h1>

          <p className="font-body-md text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-12">
            Estimación dinámica de riesgo climático mediante modelos analíticos de aprendizaje automático (XGBoost), monitoreo satelital en tiempo real y seguimiento presupuestal MEF PP 0068.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
            <button
              onClick={() => setActivePath('monitoreo-diario')}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-[0_4px_20px_rgba(56,189,248,0.35)] hover:bg-sky-400 hover:shadow-[0_6px_25px_rgba(56,189,248,0.5)] transition-all cursor-pointer active:scale-95"
            >
              Monitoreo Nacional
            </button>
            <button
              onClick={() => setActivePath('riesgo-predictivo')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer"
            >
              Inferencia de Riesgo (ML)
            </button>
          </div>

        </div>
      </section>

      {/* 2. Key Indicators Grid (High Impact Metrics) */}
      <section className="w-full px-6 md:px-16 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <ScrollReveal delayMs={100}>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Emergencias SINPAD</span>
                <span className="p-2 bg-sky-50 text-sky-700 rounded-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-slate-900 mb-2">
                {NATIONAL_META.totalEmergencias.toLocaleString()}
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">Eventos históricos registrados en los 25 departamentos</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={200}>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Población Afectada</span>
                <span className="p-2 bg-amber-50 text-amber-700 rounded-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-slate-900 mb-2">
                {NATIONAL_META.totalAfectados.toLocaleString()}
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">Personas registradas con impacto directo por desastres</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={300}>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Alerta Nivel 4 (Alta)</span>
                <span className="p-2 bg-red-50 text-red-700 rounded-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">error</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-red-600 mb-2">
                {highRiskDeptos.length} Regiones
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">Departamentos con riesgo superior al 65% (Piura, Tumbes...)</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delayMs={400}>
            <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all group">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-sm text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ejecución PP 0068</span>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </span>
              </div>
              <div className="font-headline-lg text-4xl font-extrabold text-emerald-600 mb-2">
                {NATIONAL_META.pctEjecucionNacional}%
              </div>
              <p className="font-body-md text-xs text-slate-500 font-medium">S/ {NATIONAL_META.totalDevengadoMillones}M devengados de S/ {NATIONAL_META.totalPimMillones}M PIM</p>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* 3. High Risk Regions Spotlight */}
      <section className="w-full px-6 md:px-16 py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-widest mb-2 block">
                Zonas de Mayor Vulnerabilidad
              </span>
              <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Regiones con Riesgo Alerta Nivel 4
              </h2>
            </div>
            <button
              onClick={() => setActivePath('riesgo-predictivo')}
              className="text-xs font-bold uppercase tracking-wider text-primary hover:text-sky-700 transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
            >
              Ver Inferencia Completa XGBoost
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highRiskDeptos.map((d, index) => (
              <ScrollReveal key={d.name} delayMs={index * 100}>
                <div
                  onClick={() => setActivePath('riesgo-predictivo')}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {d.name}
                      </span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">
                        {d.prob}% Riesgo
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 mb-6 font-medium">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Precipitación 24h:</span>
                        <span className="font-bold text-slate-800">{d.precipitacionMm} mm</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-400">Focos de Calor:</span>
                        <span className="font-bold text-slate-800">{d.focosCalor} detectados</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ejecución MEF:</span>
                        <span className="font-bold text-emerald-700">{d.pctEjecucion}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary group-hover:underline">
                    <span>Analizar Predictivo</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* 4. Core Features Showcase */}
      <section className="w-full px-6 md:px-16 py-24 bg-surface-container-low/50 border-y border-outline-variant/15">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-widest mb-3 block">
              Módulos de la Plataforma
            </span>
            <h2 className="font-headline-lg text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Herramientas de Decisión Estratégica
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <ScrollReveal delayMs={100}>
              <div
                onClick={() => setActivePath('monitoreo-diario')}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">satellite_alt</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-sky-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-sky-700 transition-colors">
                    Monitoreo Diario Satelital
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Visualización cartográfica en tiempo real de lluvias (Open-Meteo), focos de calor (NASA FIRMS) y sismicidad (USGS).
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={200}>
              <div
                onClick={() => setActivePath('riesgo-predictivo')}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-purple-700 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all text-2xl">arrow_outward</span>
                </div>

                <div className="relative z-10">
                  <h3 className="font-headline-lg text-2xl font-bold text-slate-900 mb-2 group-hover:text-purple-700 transition-colors">
                    Inferencia de Riesgo ML
                  </h3>
                  <p className="font-body-md text-sm text-slate-600 leading-relaxed">
                    Algoritmo XGBoost Classifier calibrado para predecir la probabilidad de desastres por región y atribución SHAP.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delayMs={300}>
              <div
                onClick={() => setActivePath('presupuesto-mef')}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">analytics</span>
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
      <section className="w-full px-6 md:px-16 py-20 bg-white">
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

      {/* 6. Modern Interactive Q&A / FAQ Section (Abajo de todo) */}
      <section className="w-full px-6 md:px-16 py-24 bg-slate-50 border-t border-slate-200/80">
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
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                    >
                      <span className="font-bold text-sm md:text-base text-slate-900 flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        {item.q}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-sky-700 text-white' : 'text-slate-600'}`}>
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100 bg-sky-50/20 animate-fade-in font-medium">
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
