'use client';

import React, { useState } from 'react';
import Header from '../src/components/Header';
import Sidebar from '../src/components/Sidebar';
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
    <div className="min-h-screen flex bg-background text-on-background">
      <Sidebar activePath={activePath} setActivePath={setActivePath} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header activePath={activePath} setActivePath={setActivePath} />
        <main className="flex-1 pt-20">
          {renderView()}
        </main>
      </div>
      <AIChatbotModal />
    </div>
  );
}
