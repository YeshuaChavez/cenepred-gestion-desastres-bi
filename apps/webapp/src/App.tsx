import React, { useState } from 'react';
import Header from './components/Header';
import HomeView from './components/views/HomeView';
import MonitoreoView from './components/views/MonitoreoView';
import HistoricoTendenciasView from './components/views/HistoricoTendenciasView';
import RiesgoPredictivoView from './components/views/RiesgoPredictivoView';
import PresupuestoMEFView from './components/views/PresupuestoMEFView';
import ComparativoRegionalView from './components/views/ComparativoRegionalView';
import AIChatbotModal from './components/AIChatbotModal';
import { ActivePath } from './types';

export default function App() {
  const [activePath, setActivePath] = useState<ActivePath>('home');

  const renderActiveView = () => {
    switch (activePath) {
      case 'home':
        return <HomeView setActivePath={setActivePath} />;
      case 'monitoreo-diario':
        return <MonitoreoView />;
      case 'historico-tendencias':
        return <HistoricoTendenciasView />;
      case 'riesgo-predictivo':
        return <RiesgoPredictivoView />;
      case 'presupuesto-mef':
        return <PresupuestoMEFView />;
      case 'comparativo-regional':
        return <ComparativoRegionalView />;
      default:
        return <HomeView setActivePath={setActivePath} />;
    }
  };

  return (
    <div className="bg-background font-sans text-on-surface min-h-screen flex flex-col selection:bg-sky-500 selection:text-white">
      <Header activePath={activePath} setActivePath={setActivePath} />

      <main className="w-full pt-20 min-h-screen bg-background flex-1">
        {renderActiveView()}
      </main>

      <AIChatbotModal />
    </div>
  );
}
