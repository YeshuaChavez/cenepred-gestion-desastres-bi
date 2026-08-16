'use client';

import React, { useState } from 'react';
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
    <div className="bg-slate-950 font-sans text-slate-100 min-h-screen flex flex-col selection:bg-sky-500 selection:text-white">
      <Header activePath={activePath} setActivePath={setActivePath} />

      <main className="w-full pt-20 min-h-screen flex-1">
        {renderView()}
      </main>

      <AIChatbotModal />
    </div>
  );
}
