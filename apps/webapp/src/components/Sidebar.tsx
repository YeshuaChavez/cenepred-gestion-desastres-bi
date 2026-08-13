import React from 'react';
import { LOGO_CENEPRED } from '../data/mockData';
import { ActivePath } from '../types';

interface SidebarProps {
  activePath: ActivePath;
  setActivePath: (path: ActivePath) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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

export default function Sidebar({ activePath, setActivePath, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside className={`fixed left-0 top-0 h-full ${isCollapsed ? 'w-20' : 'w-72'} bg-white/95 backdrop-blur-xl border-r border-slate-200 z-50 flex flex-col shadow-xs transition-all duration-300 ease-in-out group/sidebar`}>
      
      {/* Floating Border Edge Toggle Trigger */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md text-slate-600 hover:text-sky-700 hover:border-sky-500 flex items-center justify-center transition-all duration-300 z-50 cursor-pointer hover:scale-110 active:scale-95"
        title={isCollapsed ? "Expandir panel" : "Contraer panel"}
      >
        <span className="material-symbols-outlined text-[16px] transform transition-transform duration-300">
          {isCollapsed ? 'menu' : 'chevron_left'}
        </span>
      </button>

      {/* Header Logo */}
      <div className={`p-4 mb-4 flex items-center border-b border-slate-100 relative ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={LOGO_CENEPRED}
            alt="CENEPRED Logo"
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          {!isCollapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="font-title-md text-base text-slate-900 tracking-tight font-bold leading-tight">
                Gestión del Riesgo
              </span>
              <span className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider">
                CENEPRED • Perú
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path;
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => setActivePath(item.path)}
                className={`flex items-center rounded-xl transition-all duration-300 w-full cursor-pointer ${
                  isCollapsed ? 'justify-center p-3.5' : 'px-4 py-3 text-left'
                } ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/80 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'text-xl' : 'mr-4'}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-body-md text-sm whitespace-nowrap truncate">{item.label}</span>
                )}
              </button>

              {/* Glassmorphism Floating Tooltip when Collapsed */}
              {isCollapsed && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 whitespace-nowrap backdrop-blur-md">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 text-center">
        {!isCollapsed ? (
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
            Plataforma Institucional • CENEPRED
          </span>
        ) : (
          <span className="material-symbols-outlined text-slate-400 text-sm">security</span>
        )}
      </div>
    </aside>
  );
}
