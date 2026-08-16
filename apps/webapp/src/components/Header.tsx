'use client';

import React from 'react';
import { ActivePath } from '../types';
import { LOGO_CENEPRED } from '../data/mockData';

interface HeaderProps {
  activePath?: ActivePath;
  setActivePath?: (path: ActivePath) => void;
}

const NAV_ITEMS: { path: ActivePath; label: string }[] = [
  { path: 'home', label: 'Overview' },
  { path: 'monitoreo-diario', label: 'Monitoreo Diario' },
  { path: 'historico-tendencias', label: 'Histórico & Tendencias' },
  { path: 'riesgo-predictivo', label: 'Riesgo Predictivo' },
  { path: 'comparativo-regional', label: 'Comparativo Regional' },
  { path: 'presupuesto-mef', label: 'Presupuesto MEF' },
];

export default function Header({ activePath = 'home', setActivePath }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-md border-b border-slate-200">
      <div className="h-16 w-full px-6 md:px-10 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActivePath && setActivePath('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            alt="CENEPRED Logo"
            className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            src={LOGO_CENEPRED}
          />
          <div className="flex flex-col">
            <span className="text-[15px] tracking-tight text-slate-800 leading-tight font-bold uppercase">
              CENEPRED
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-[0.15em] font-medium">
              Centro Nacional de Prevención de Desastres
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setActivePath && setActivePath(item.path)}
                className={`
                  relative px-3 py-2 text-[11px] uppercase tracking-[0.08em] font-semibold
                  rounded-md transition-all duration-200 cursor-pointer
                  ${isActive
                    ? 'text-sky-600 bg-sky-50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }
                `}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-sky-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
