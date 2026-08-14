import React, { useState, useRef, useEffect } from 'react';
import { ActivePath } from '../types';
import { LOGO_CENEPRED } from '../data/mockData';

interface HeaderProps {
  activePath?: ActivePath;
  setActivePath?: (path: ActivePath) => void;
}

export interface NotificationItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export default function Header({ activePath = 'home', setActivePath }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'critical',
      title: 'Alerta Crítica — Piura & Tumbes',
      desc: 'Precipitación acumulada de 88.4 mm en las últimas 24h. Riesgo de inundación al 88%.',
      time: 'Hoy',
      read: false
    },
    {
      id: 'n2',
      type: 'warning',
      title: 'Aviso Meteorológico — Arequipa & Cusco',
      desc: 'Temperaturas nocturnas de -4°C en zonas sobre los 3,800 m s. n. m.',
      time: 'Hoy',
      read: false
    },
    {
      id: 'n3',
      type: 'info',
      title: 'Actualización Presupuestal PP 0068',
      desc: 'El avance de ejecución alcanzó el 71.4% a nivel nacional (S/ 1,014M devengados).',
      time: 'Hoy',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/70 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/20">
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
            <span className="font-headline-lg text-lg tracking-tight text-primary leading-tight font-bold uppercase">
              CENEPRED
            </span>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">
              Intelligence Platform
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <button
            onClick={() => setActivePath && setActivePath('home')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'home'
                ? 'text-primary font-bold border-b-2 border-primary py-1'
                : 'text-on-secondary-container hover:text-primary font-semibold'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActivePath && setActivePath('monitoreo-diario')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'monitoreo-diario'
                ? 'text-primary font-bold border-b-2 border-primary py-1'
                : 'text-on-secondary-container hover:text-primary font-semibold'
            }`}
          >
            Monitoreo Diario
          </button>
          <button
            onClick={() => setActivePath && setActivePath('historico-tendencias')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'historico-tendencias'
                ? 'text-primary font-bold border-b-2 border-primary py-1'
                : 'text-on-secondary-container hover:text-primary font-semibold'
            }`}
          >
            Histórico & Tendencias
          </button>
          <button
            onClick={() => setActivePath && setActivePath('riesgo-predictivo')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'riesgo-predictivo'
                ? 'text-primary font-bold border-b-2 border-primary py-1'
                : 'text-on-secondary-container hover:text-primary font-semibold'
            }`}
          >
            Riesgo Predictivo
          </button>
          <button
            onClick={() => setActivePath && setActivePath('comparativo-regional')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'comparativo-regional'
                ? 'text-primary font-bold border-b-2 border-primary py-1'
                : 'text-on-secondary-container hover:text-primary font-semibold'
            }`}
          >
            Comparativo Regional
          </button>
          <button
            onClick={() => setActivePath && setActivePath('presupuesto-mef')}
            className={`font-label-sm text-xs uppercase tracking-widest transition-colors cursor-pointer ${
              activePath === 'presupuesto-mef'
                ? 'text-primary font-bold border-b-2 border-primary py-1'
                : 'text-on-secondary-container hover:text-primary font-semibold'
            }`}
          >
            Presupuesto MEF
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-6">
          
          <div className="flex items-center gap-3 border-l border-outline-variant/40 pl-6">
            
            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
                title="Avisos Institucionales"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-container-lowest"></span>
                )}
              </button>

              {/* Dropdown Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-fade-in text-slate-800">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">Avisos Institucionales</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                          {unreadCount} nuevos
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-semibold text-sky-700 hover:underline cursor-pointer"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3.5 flex gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-sky-50/40' : ''}`}
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          if (setActivePath) setActivePath('monitoreo-diario');
                          setShowNotifications(false);
                        }}
                      >
                        <div className="mt-1">
                          {n.type === 'critical' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>}
                          {n.type === 'warning' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>}
                          {n.type === 'info' && <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block"></span>}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-baseline">
                            <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                            <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-snug">{n.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        if (setActivePath) setActivePath('monitoreo-diario');
                      }}
                      className="text-xs font-bold text-sky-700 hover:text-sky-800 transition-colors cursor-pointer"
                    >
                      Ver Monitoreo Nacional →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Info Dialog Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer text-on-surface-variant"
              title="Información del Sistema"
            >
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>

          </div>

        </div>
      </div>

      {/* System Info Dialog */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-800">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700">info</span>
                Centro de Inteligencia CENEPRED v2.4
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <p>
                Plataforma analítica nacional para la gestión del riesgo de desastres, conectada a los 25 departamentos del Perú.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Arquitectura:</span>
                  <span>Lakehouse Medallion</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Motor ML:</span>
                  <span>XGBoost + SHAP</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Telemetría:</span>
                  <span>NASA FIRMS & Open-Meteo</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 bg-sky-700 text-white rounded-lg font-bold text-xs hover:bg-sky-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
