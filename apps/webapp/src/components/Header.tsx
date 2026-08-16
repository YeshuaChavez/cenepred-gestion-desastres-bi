'use client';

import React from 'react';
import { ActivePath } from '../types';
import { LOGO_CENEPRED } from '../data/mockData';

interface HeaderProps {
  activePath?: ActivePath;
  setActivePath?: (path: ActivePath) => void;
}

export default function Header({ activePath = 'home', setActivePath }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg text-white">
      <div className="h-20 w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActivePath && setActivePath('home')}
          className="flex items-center gap-4 cursor-pointer"
        >
          <img
            alt="CENEPRED Logo"
            className="h-10 w-auto object-contain"
            src={LOGO_CENEPRED}
          />
          <div className="flex flex-col">
            <span className="font-headline-lg text-lg tracking-tight text-white leading-tight font-bold uppercase">
              CENEPRED
            </span>
            <span className="font-label-sm text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Centro Nacional de Prevención de Desastres
            </span>
          </div>
        </div>

        {/* Center & Right Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <button
            onClick={() => setActivePath && setActivePath('home')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'home'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 py-1'
                : 'text-slate-300 hover:text-white font-semibold'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePath && setActivePath('monitoreo-diario')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'monitoreo-diario'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 py-1'
                : 'text-slate-300 hover:text-white font-semibold'
            }`}
          >
            Monitoreo Diario
          </button>
          <button
            onClick={() => setActivePath && setActivePath('historico-tendencias')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'historico-tendencias'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 py-1'
                : 'text-slate-300 hover:text-white font-semibold'
            }`}
          >
            Histórico & Tendencias
          </button>
          <button
            onClick={() => setActivePath && setActivePath('riesgo-predictivo')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'riesgo-predictivo'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 py-1'
                : 'text-slate-300 hover:text-white font-semibold'
            }`}
          >
            Riesgo Predictivo
          </button>
          <button
            onClick={() => setActivePath && setActivePath('comparativo-regional')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'comparativo-regional'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 py-1'
                : 'text-slate-300 hover:text-white font-semibold'
            }`}
          >
            Comparativo Regional
          </button>
          <button
            onClick={() => setActivePath && setActivePath('presupuesto-mef')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'presupuesto-mef'
                ? 'text-sky-400 font-bold border-b-2 border-sky-400 py-1'
                : 'text-slate-300 hover:text-white font-semibold'
            }`}
          >
            Presupuesto MEF
          </button>
        </nav>

      </div>
    </header>
  );
}
