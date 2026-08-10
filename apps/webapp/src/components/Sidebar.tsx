import React from 'react';
import { LOGO_CENEPRED, PROFILE_AVATAR } from '../data/mockData';
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
    <aside className="fixed left-0 top-0 h-full w-72 bg-white/80 backdrop-blur border-r border-outline-variant/20 z-50 flex flex-col shadow-sm">
      <div className="p-6 mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_CENEPRED}
            alt="CENEPRED Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="font-title-md text-title-md text-slate-900 tracking-tight font-bold">
            SAT Riesgo
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1 mt-2">
            Lakehouse Architecture
          </span>
          <span className="text-[9px] text-primary font-semibold px-1">
            Medallion • Azure Databricks
          </span>
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
                  ? 'bg-primary-container/20 text-primary font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-surface-container-low hover:text-slate-900'
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

      <div className="p-6 border-t border-outline-variant/20">
        <div className="flex items-center gap-3 p-3 bg-white/80 border border-outline-variant/20 rounded-2xl shadow-sm">
          <img
            src={PROFILE_AVATAR}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-primary/20 object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">Director Ejecutivo</span>
            <span className="text-[10px] text-slate-500">CENEPRED Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
