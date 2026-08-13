import React, { useState, useRef, useEffect } from 'react';
import { ActivePath } from '../types';
import { PERU_DEPARTAMENTOS } from '../data/mockData';

interface HeaderProps {
  setActivePath?: (path: ActivePath) => void;
  isCollapsed?: boolean;
}

export interface RealTimeNotification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
  deptoKey: string;
  time: string;
  read: boolean;
}

export default function Header({ setActivePath, isCollapsed = false }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [realTimeToast, setRealTimeToast] = useState<RealTimeNotification | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<RealTimeNotification[]>([
    {
      id: 'n1',
      type: 'critical',
      title: 'Alerta Crítica — Piura & Tumbes',
      desc: 'Precipitación acumulada de 88.4 mm en las últimas 24h. Riesgo de inundación al 88%.',
      deptoKey: 'piura',
      time: 'Hace 2 min',
      read: false
    },
    {
      id: 'n2',
      type: 'warning',
      title: 'Aviso Meteorológico — Arequipa & Cusco',
      desc: 'Temperaturas nocturnas de -4°C en zonas sobre los 3,800 m s. n. m.',
      deptoKey: 'arequipa',
      time: 'Hace 12 min',
      read: false
    },
    {
      id: 'n3',
      type: 'info',
      title: 'Actualización Presupuestal PP 0068',
      desc: 'El avance de ejecución alcanzó el 71.4% a nivel nacional (S/ 1,014M devengados).',
      deptoKey: 'lima',
      time: 'Hace 35 min',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const deptosKeys = Object.keys(PERU_DEPARTAMENTOS);
    const interval = setInterval(() => {
      const randomKey = deptosKeys[Math.floor(Math.random() * deptosKeys.length)];
      const depto = PERU_DEPARTAMENTOS[randomKey];
      if (!depto) return;

      const isHighRisk = depto.prob >= 65;
      const newNotif: RealTimeNotification = {
        id: `rt_${Date.now()}`,
        type: isHighRisk ? 'critical' : depto.prob >= 50 ? 'warning' : 'info',
        title: `Telemetría en Vivo — ${depto.name}`,
        desc: `Nivel de riesgo registrado en ${depto.prob}%. Lluvia acum: ${depto.precipitacionMm} mm, Temp máx: ${depto.tempMax}°C.`,
        deptoKey: randomKey,
        time: 'En vivo',
        read: false
      };

      setNotifications(prev => [newNotif, ...prev.slice(0, 7)]);
      setRealTimeToast(newNotif);

      setTimeout(() => {
        setRealTimeToast(null);
      }, 4500);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearch]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleSelectSearchDepto = () => {
    setShowSearch(false);
    setSearchQuery('');
    if (setActivePath) {
      setActivePath('monitoreo-diario');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const deptosList = Object.entries(PERU_DEPARTAMENTOS);
  const filteredDeptos = deptosList.filter(([_, data]) =>
    data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className={`fixed top-0 ${isCollapsed ? 'left-20' : 'left-72'} right-0 h-20 bg-white/90 backdrop-blur-md z-40 flex items-center justify-between px-12 border-b border-slate-200 shadow-xs transition-all duration-300 ease-in-out`}>
      
      {/* Title */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="font-title-md text-base text-slate-900 tracking-tight leading-tight font-bold">
            CENEPRED — Centro de Inteligencia para la Gestión del Riesgo de Desastres
          </h1>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            En Vivo
          </span>
        </div>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
          Plataforma Nacional de Gestión del Riesgo
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 relative">
        
        {/* Print Executive Report Button */}
        <button
          onClick={handlePrint}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative cursor-pointer"
          title="Imprimir / Exportar Reporte PDF Ejecución"
        >
          <span className="material-symbols-outlined text-[20px]">print</span>
        </button>

        {/* Platform Help Guide Trigger Button */}
        <button
          onClick={() => setShowHelp(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative cursor-pointer"
          title="Guía e Información de la Plataforma"
        >
          <span className="material-symbols-outlined text-[20px]">help_outline</span>
        </button>

        {/* Search Trigger Button */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative cursor-pointer"
          title="Buscar Departamento"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative cursor-pointer"
            title="Notificaciones en tiempo real"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-fade-in text-slate-800">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">Telemetría en Tiempo Real</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                      {unreadCount} en vivo
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
                    <div className="mt-0.5">
                      {n.type === 'critical' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 block animate-ping"></span>}
                      {n.type === 'warning' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>}
                      {n.type === 'info' && <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block"></span>}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                        <span className="text-[10px] text-slate-400 font-semibold">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Real-time Push Toast Alert Banner */}
      {realTimeToast && (
        <div
          onClick={() => {
            if (setActivePath) setActivePath('monitoreo-diario');
            setRealTimeToast(null);
          }}
          className="fixed top-24 right-8 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm flex items-start gap-3 cursor-pointer animate-fade-in hover:bg-slate-850"
        >
          <span className="material-symbols-outlined text-amber-400 text-xl mt-0.5">sensors</span>
          <div className="flex-1 space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sky-400">{realTimeToast.title}</span>
              <span className="text-[10px] text-slate-400">En Vivo</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">{realTimeToast.desc}</p>
          </div>
        </div>
      )}

      {/* Institutional Platform Tour Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: isCollapsed ? '-80px' : '-288px',
            width: '100vw',
            height: '100vh'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden p-6 space-y-4 text-slate-800 relative z-[1000]">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-700">info</span>
                Centro de Información Institucional
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <p className="font-semibold text-slate-800">
                Esta plataforma integra datos en tiempo real y registros históricos de las siguientes fuentes oficiales del Estado Peruano y agencias internacionales:
              </p>
              
              <ul className="space-y-2 border-l-2 border-sky-500 pl-3">
                <li><b>INDECI / SINPAD</b>: 84,369 registros históricos de emergencias (2012-2023).</li>
                <li><b>Open-Meteo API</b>: Monitoreo meteorológico de precipitaciones en los 25 departamentos.</li>
                <li><b>NASA FIRMS Satelital</b>: Detección y recuento de focos de calor activos.</li>
                <li><b>MEF (SIAF - PP 0068)</b>: Seguimiento presupuestal de S/ 1,420.5M asignados a PREVAED.</li>
              </ul>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-sky-700 text-white rounded-lg font-bold text-xs hover:bg-sky-800 transition-colors cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Edge-to-Edge Search Modal */}
      {showSearch && (
        <div
          className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-md flex items-start justify-center pt-24 p-4 animate-fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: isCollapsed ? '-80px' : '-288px',
            width: '100vw',
            height: '100vh'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden relative z-[1000]">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar departamento o región (ej: Piura, Cusco, Lima)..."
                className="w-full text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded cursor-pointer"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
              {filteredDeptos.length > 0 ? (
                filteredDeptos.map(([key, data]) => (
                  <div
                    key={key}
                    onClick={handleSelectSearchDepto}
                    className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {data.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{data.name}</h4>
                        <span className="text-[11px] text-slate-500">{data.emergencias} emergencias • Lluvia: {data.precipitacionMm} mm</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase ${
                        data.prob >= 75 ? 'bg-red-600' : data.prob >= 60 ? 'bg-orange-500' : data.prob >= 45 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}>
                        Riesgo {data.prob}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-medium">
                  No se encontraron regiones con el término "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
