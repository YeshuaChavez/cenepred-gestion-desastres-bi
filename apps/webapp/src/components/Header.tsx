import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-12 border-b border-slate-200 shadow-xs">
      <div className="flex flex-col">
        <h1 className="font-title-md text-base text-slate-900 tracking-tight leading-tight font-bold">
          CENEPRED — Centro de Inteligencia para la Gestión del Riesgo de Desastres
        </h1>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
          Plataforma Nacional de Gestión del Riesgo
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Notificaciones">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500" title="Buscar">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </button>
      </div>
    </header>
  );
}
