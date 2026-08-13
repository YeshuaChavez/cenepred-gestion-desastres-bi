import React from 'react';
import { LOGO_CENEPRED } from '../data/mockData';
import { ActivePath } from '../types';

interface SidebarProps {
  activePath: ActivePath;
  setActivePath: (path: ActivePath) => void;
}

interface NavItem {
  path: ActivePath;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: 'home', icon: 'home', label: 'Home' },
  { path: 'monitoreo-diario', icon: 'wb_sunny', label: 'Monitoreo Diario' },
  { path: 'historico-tendencias', icon: 'trending_up', label: 'Histórico & Tendencias' },
  { path: 'riesgo-predictivo', icon: 'smart_toy', label: 'Riesgo Predictivo & SHAP' },
  { path: 'comparativo-regional', icon: 'bar_chart', label: 'Comparativo Regional' },
  { path: 'presupuesto-mef', icon: 'payments', label: 'Presupuesto MEF PP 0068' }
];

export default function Sidebar({ activePath, setActivePath }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white/90 backdrop-blur border-r border-slate-200 z-50 flex flex-col shadow-xs">
      <div className="p-6 mb-4 flex flex-col gap-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_CENEPRED}
            alt="CENEPRED Logo"
            className="h-10 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-title-md text-base text-slate-900 tracking-tight font-bold leading-tight">
              Gestión del Riesgo
            </span>
            <span className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider">
              CENEPRED • Perú
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setActivePath(item.path)}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group text-left w-full ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/60 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined mr-4 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="font-body-md text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-5 border-t border-slate-200 text-center">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
          Plataforma Institucional • CENEPRED
        </span>
      </div>
    </aside>
  );
}
