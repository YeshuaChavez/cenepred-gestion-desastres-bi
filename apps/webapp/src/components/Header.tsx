'use client';

import React from 'react';
import { ActivePath } from '../types';
import { LOGO_CENEPRED } from '../data/mockData';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  activePath?: ActivePath;
  setActivePath?: (path: ActivePath) => void;
}

export default function Header({ activePath = 'home', setActivePath }: HeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#060d1f]/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.4)] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="h-20 w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActivePath && setActivePath('home')}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <img
            alt="CENEPRED Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            src={LOGO_CENEPRED}
          />
          <div className="flex flex-col">
            <span className="font-headline-lg text-lg tracking-tight text-slate-900 dark:text-white leading-tight font-bold uppercase group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              CENEPRED
            </span>
            <span className="font-label-sm text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
              Centro Nacional de Prevención de Desastres
            </span>
          </div>
        </div>

        {/* Center & Right Navigation Links */}
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => setActivePath && setActivePath('home')}
              className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activePath === 'home'
                  ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => setActivePath && setActivePath('monitoreo-diario')}
              className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activePath === 'monitoreo-diario'
                  ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
              }`}
            >
              Monitoreo Diario
            </button>
            <button
              onClick={() => setActivePath && setActivePath('historico-tendencias')}
              className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activePath === 'historico-tendencias'
                  ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
              }`}
            >
              Histórico & Tendencias
            </button>
            <button
              onClick={() => setActivePath && setActivePath('riesgo-predictivo')}
              className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activePath === 'riesgo-predictivo'
                  ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
              }`}
            >
              Riesgo Predictivo
            </button>
            <button
              onClick={() => setActivePath && setActivePath('comparativo-regional')}
              className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activePath === 'comparativo-regional'
                  ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
              }`}
            >
              Comparativo Regional
            </button>
            <button
              onClick={() => setActivePath && setActivePath('presupuesto-mef')}
              className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activePath === 'presupuesto-mef'
                  ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
              }`}
            >
              Presupuesto Prevención
            </button>
          </nav>

          {/* Theme Toggle Button (Light / Dark) */}
          {mounted && (
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="relative p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-sky-300 border border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xs"
            >
              {theme === 'dark' ? (
                <span className="material-symbols-outlined text-xl transition-transform duration-500 rotate-0 hover:rotate-45 text-amber-300">
                  light_mode
                </span>
              ) : (
                <span className="material-symbols-outlined text-xl transition-transform duration-500 rotate-0 hover:-rotate-12 text-slate-700">
                  dark_mode
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
