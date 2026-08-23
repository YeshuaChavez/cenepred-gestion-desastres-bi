'use client';

import React, { useState } from 'react';
import { ActivePath } from '../types';
import { LOGO_CENEPRED } from '../data/mockData';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  activePath?: ActivePath;
  setActivePath?: (path: ActivePath) => void;
}

interface NavItem {
  path: ActivePath;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: 'home', label: 'Inicio', icon: 'home' },
  { path: 'monitoreo-diario', label: 'Monitoreo Diario', icon: 'wb_sunny' },
  { path: 'historico-tendencias', label: 'Histórico & Tendencias', icon: 'trending_up' },
  { path: 'riesgo-predictivo', label: 'Riesgo Predictivo', icon: 'insights' },
  { path: 'comparativo-regional', label: 'Comparativo Regional', icon: 'bar_chart' },
  { path: 'presupuesto-mef', label: 'Presupuesto Prevención', icon: 'payments' },
];

export default function Header({ activePath = 'home', setActivePath }: HeaderProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: ActivePath) => {
    setActivePath && setActivePath(path);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#060d1f]/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.4)] border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-300">
      <div className="h-20 w-full px-4 sm:px-6 md:px-12 flex items-center justify-between">

        {/* Brand Logo & Title */}
        <div
          onClick={() => go('home')}
          className="flex items-center gap-3 sm:gap-4 cursor-pointer group min-w-0"
        >
          <img
            alt="CENEPRED Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
            src={LOGO_CENEPRED}
          />
          <div className="flex flex-col min-w-0">
            <span className="font-headline-lg text-base sm:text-lg tracking-tight text-sky-700 dark:text-white leading-tight font-bold uppercase group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              CENEPRED
            </span>
            <span className="font-label-sm text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold leading-tight">
              Centro Nacional de Prevención <br /> de Desastres
            </span>
          </div>
        </div>

        {/* Center & Right Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  activePath === item.path
                    ? 'text-sky-700 dark:text-sky-400 font-extrabold border-b-2 border-sky-600 dark:border-sky-400 py-1'
                    : 'text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold hover:-translate-y-0.5'
                }`}
              >
                {item.label}
              </button>
            ))}
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

          {/* Mobile menu toggle (hamburger) */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Abrir menú de secciones"
            aria-expanded={mobileOpen}
            className="lg:hidden p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-sky-300 border border-slate-200/90 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer flex items-center justify-center shadow-xs"
          >
            <span className="material-symbols-outlined text-xl">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#060d1f]/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1 shadow-lg animate-fade-in">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
