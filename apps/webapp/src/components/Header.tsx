import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-white/80 backdrop-blur-md z-40 flex items-center justify-between px-16 border-b border-slate-200 shadow-xs">
      <div className="flex flex-col">
        <h1 className="font-title-md text-base text-slate-900 tracking-tight leading-tight font-bold">
          CENEPRED — Plataforma Nacional de Inteligencia para la Gestión del Riesgo
        </h1>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
          Executive Decision Intelligence & Risk Analytics
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-label-sm text-slate-600 font-semibold">
            Databricks SQL Serverless Connected
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </div>
    </header>
  );
}
