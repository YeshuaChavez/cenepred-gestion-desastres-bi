'use client';

import React, { useEffect, useState } from 'react';
import Header from '../src/components/Header';
import HomeView from '../src/components/views/HomeView';
import MonitoreoView from '../src/components/views/MonitoreoView';
import HistoricoTendenciasView from '../src/components/views/HistoricoTendenciasView';
import RiesgoPredictivoView from '../src/components/views/RiesgoPredictivoView';
import ComparativoRegionalView from '../src/components/views/ComparativoRegionalView';
import PresupuestoMEFView from '../src/components/views/PresupuestoMEFView';
import AIChatbotModal from '../src/components/AIChatbotModal';
import { ActivePath } from '../src/types';

export default function Page() {
  const [activePath, setActivePath] = useState<ActivePath>('home');

  // Cerrar el asistente al cambiar de sección para que no quede tapando la vista siguiente.
  useEffect(() => {
    window.dispatchEvent(new Event('close-cenepred-assistant'));
  }, [activePath]);

  const renderView = () => {
    switch (activePath) {
      case 'home':
        return <HomeView setActivePath={setActivePath} />;
      case 'monitoreo-diario':
        return <MonitoreoView />;
      case 'historico-tendencias':
        return <HistoricoTendenciasView />;
      case 'riesgo-predictivo':
        return <RiesgoPredictivoView />;
      case 'comparativo-regional':
        return <ComparativoRegionalView />;
      case 'presupuesto-mef':
        return <PresupuestoMEFView />;
      default:
        return <HomeView setActivePath={setActivePath} />;
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#060d1f] font-sans text-slate-900 dark:text-slate-100 min-h-screen flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-300">
      <Header activePath={activePath} setActivePath={setActivePath} />

      <main className="w-full pt-20 min-h-screen bg-[#f8fafc] dark:bg-[#060d1f] flex-1 transition-colors duration-300">
        {renderView()}
      </main>

      <AIChatbotModal />
    </div>
  );
}
