import React, { useState, useEffect } from 'react';
import { LOGO_CENEPRED } from '../data/mockData';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Inicializando Plataforma CENEPRED...');
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const steps = [
      { pct: 20, text: 'Conectando a Azure Databricks Serverless...' },
      { pct: 50, text: 'Cargando 84,369 emergencias de la Capa Gold...' },
      { pct: 75, text: 'Procesando 109,575 registros de monitoreo en 25 departamentos...' },
      { pct: 95, text: 'Sincronizando modelos predictivos XGBoost & SHAP...' },
      { pct: 100, text: 'Plataforma lista. Redirigiendo...' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].pct);
        setStatusText(steps[stepIdx].text);
        stepIdx++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFading(true);
          setTimeout(onFinish, 600);
        }, 400);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center max-w-md w-full text-center space-y-6">
        
        {/* Glowing Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-28 h-28 bg-sky-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="w-24 h-24 bg-white rounded-2xl p-3 shadow-lg border border-slate-200/80 relative z-10 flex items-center justify-center">
            <img src={LOGO_CENEPRED} alt="CENEPRED" className="max-h-full max-w-full object-contain" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            CENEPRED <span className="text-sky-700 font-light">Centro de Inteligencia</span>
          </h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-500">
            Plataforma Nacional para la Gestión del Riesgo de Desastres
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-medium text-slate-500">
            <span className="truncate pr-2">{statusText}</span>
            <span className="font-bold text-sky-700">{progress}%</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Lakehouse Medallion • Azure Databricks</span>
        </div>

      </div>
    </div>
  );
}
