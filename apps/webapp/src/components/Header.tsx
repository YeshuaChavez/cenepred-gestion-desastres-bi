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
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/80">
      <div className="h-20 w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActivePath && setActivePath('home')}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <img
            alt="CENEPRED Logo"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            src={LOGO_CENEPRED}
          />
          <div className="flex flex-col">
            <span className="font-headline-lg text-lg tracking-tight text-primary leading-tight font-bold uppercase group-hover:text-sky-700 transition-colors">
              CENEPRED
            </span>
            <span className="font-label-sm text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Centro Nacional de Prevención de Desastres
            </span>
          </div>
        </div>

        {/* Center & Right Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => setActivePath && setActivePath('home')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'home'
                ? 'text-sky-800 font-extrabold border-b-2 border-sky-700 py-1'
                : 'text-slate-600 hover:text-sky-700 font-bold hover:-translate-y-0.5'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActivePath && setActivePath('monitoreo-diario')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'monitoreo-diario'
                ? 'text-sky-800 font-extrabold border-b-2 border-sky-700 py-1'
                : 'text-slate-600 hover:text-sky-700 font-bold hover:-translate-y-0.5'
            }`}
          >
            Monitoreo Diario
          </button>
          <button
            onClick={() => setActivePath && setActivePath('historico-tendencias')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'historico-tendencias'
                ? 'text-sky-800 font-extrabold border-b-2 border-sky-700 py-1'
                : 'text-slate-600 hover:text-sky-700 font-bold hover:-translate-y-0.5'
            }`}
          >
            Histórico & Tendencias
          </button>
          <button
            onClick={() => setActivePath && setActivePath('riesgo-predictivo')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'riesgo-predictivo'
                ? 'text-sky-800 font-extrabold border-b-2 border-sky-700 py-1'
                : 'text-slate-600 hover:text-sky-700 font-bold hover:-translate-y-0.5'
            }`}
          >
            Riesgo Predictivo
          </button>
          <button
            onClick={() => setActivePath && setActivePath('comparativo-regional')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'comparativo-regional'
                ? 'text-sky-800 font-extrabold border-b-2 border-sky-700 py-1'
                : 'text-slate-600 hover:text-sky-700 font-bold hover:-translate-y-0.5'
            }`}
          >
            Comparativo Regional
          </button>
          <button
            onClick={() => setActivePath && setActivePath('presupuesto-mef')}
            className={`font-label-sm text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activePath === 'presupuesto-mef'
                ? 'text-sky-800 font-extrabold border-b-2 border-sky-700 py-1'
                : 'text-slate-600 hover:text-sky-700 font-bold hover:-translate-y-0.5'
            }`}
          >
            Presupuesto Prevención
          </button>
        </nav>

      </div>
    </header>
  );
}
