import React, { useState, useRef, useEffect } from 'react';
import { ActivePath } from '../types';
import { PERU_DEPARTAMENTOS } from '../data/mockData';

interface HeaderProps {
  setActivePath?: (path: ActivePath) => void;
}

interface NotificationItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

export default function Header({ setActivePath }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'critical',
      title: 'Alerta Crítica — Piura & Tumbes',
      desc: 'Precipitación acumulada superó los 88.4 mm en las últimas 24h. Riesgo de inundación al 88%.',
      time: 'Hace 15 min',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Aviso de Bajas Temperaturas — Arequipa & Cusco',
      desc: 'Descenso de temperatura nocturna en zonas sobre los 3,800 m s. n. m.',
      time: 'Hace 1 hora',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Actualización Presupuestal MEF',
      desc: 'El avance de ejecución del Programa Presupuestal PP 0068 alcanzó el 71.4% nacional.',
      time: 'Hace 3 horas',
      read: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when search modal opens
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

  const deptosList = Object.entries(PERU_DEPARTAMENTOS);
  const filteredDeptos = deptosList.filter(([key, data]) =>
    data.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    data.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-white/90 backdrop-blur-md z-40 flex items-center justify-between px-12 border-b border-slate-200 shadow-xs">
      <div className="flex flex-col">
        <h1 className="font-title-md text-base text-slate-900 tracking-tight leading-tight font-bold">
          CENEPRED — Centro de Inteligencia para la Gestión del Riesgo de Desastres
        </h1>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
          Plataforma Nacional de Gestión del Riesgo
        </p>
      </div>

      <div className="flex items-center gap-3 relative">
        
        {/* Search Trigger Button */}
        <button
          onClick={() => setShowSearch(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative"
          title="Buscar Departamento"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600 relative"
            title="Notificaciones"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-88 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-fade-in text-slate-800">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">Notificaciones Institucionales</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-sky-700 hover:underline"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
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
                      {n.type === 'critical' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>}
                      {n.type === 'warning' && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>}
                      {n.type === 'info' && <span className="w-2.5 h-2.5 rounded-full bg-sky-500 block"></span>}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <h5 className="font-bold text-xs text-slate-900">{n.title}</h5>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
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

      {/* Global Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
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
                className="text-slate-400 hover:text-slate-700 text-xs font-bold px-2 py-1 bg-slate-100 rounded"
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
                        <span className="text-[11px] text-slate-500">{data.emergencias} emergencias • Precipitación: {data.precipitacionMm} mm</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase ${data.prob >= 65 ? 'bg-red-600' : data.prob >= 50 ? 'bg-amber-600' : 'bg-sky-600'}`}>
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
