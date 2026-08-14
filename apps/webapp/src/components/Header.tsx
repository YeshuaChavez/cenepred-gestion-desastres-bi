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
    <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80">
      <div className="h-16 w-full px-6 md:px-8 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActivePath && setActivePath('home')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            alt="CENEPRED Logo"
            className="h-8 w-auto object-contain"
            src={LOGO_CENEPRED}
          />
          <div className="flex flex-col">
            <span className="font-headline-lg text-base tracking-tight text-slate-900 leading-tight font-bold uppercase">
              CENEPRED
            </span>
            <span className="font-label-sm text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Centro Nacional de Prevención de Desastres
            </span>
          </div>
        </div>

        {/* Center & Right Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => setActivePath && setActivePath('home')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'home'
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-1'
                : 'text-slate-600 hover:text-sky-600 font-semibold'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePath && setActivePath('monitoreo-diario')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'monitoreo-diario'
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-1'
                : 'text-slate-600 hover:text-sky-600 font-semibold'
            }`}
          >
            Monitoreo Diario
          </button>
          <button
            onClick={() => setActivePath && setActivePath('historico-tendencias')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'historico-tendencias'
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-1'
                : 'text-slate-600 hover:text-sky-600 font-semibold'
            }`}
          >
            Histórico & Tendencias
          </button>
          <button
            onClick={() => setActivePath && setActivePath('riesgo-predictivo')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'riesgo-predictivo'
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-1'
                : 'text-slate-600 hover:text-sky-600 font-semibold'
            }`}
          >
            Riesgo Predictivo
          </button>
          <button
            onClick={() => setActivePath && setActivePath('comparativo-regional')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'comparativo-regional'
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-1'
                : 'text-slate-600 hover:text-sky-600 font-semibold'
            }`}
          >
            Comparativo Regional
          </button>
          <button
            onClick={() => setActivePath && setActivePath('presupuesto-mef')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'presupuesto-mef'
                ? 'text-sky-600 font-bold border-b-2 border-sky-600 pb-1'
                : 'text-slate-600 hover:text-sky-600 font-semibold'
            }`}
          >
            Presupuesto MEF
          </button>
        </nav>

      </div>
    </header>
  );
}
