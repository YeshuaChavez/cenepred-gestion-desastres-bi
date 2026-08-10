import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeView from './components/views/HomeView';
import MonitoreoView from './components/views/MonitoreoView';
import RiesgoPredictivoView from './components/views/RiesgoPredictivoView';
import PresupuestoMEFView from './components/views/PresupuestoMEFView';
import ComparativoRegionalView from './components/views/ComparativoRegionalView';
import AIChatbotModal from './components/AIChatbotModal';
import { ActivePath } from './types';

export default function App() {
  const [activePath, setActivePath] = useState<ActivePath>('monitoreo-diario');

  const renderActiveView = () => {
    switch (activePath) {
      case 'home':
        return <HomeView setActivePath={setActivePath} />;
      case 'monitoreo-diario':
        return <MonitoreoView />;
      case 'riesgo-predictivo':
        return <RiesgoPredictivoView />;
      case 'presupuesto-mef':
        return <PresupuestoMEFView />;
      case 'comparativo-regional':
      case 'historico-tendencias':
        return <ComparativoRegionalView />;
      default:
        return <MonitoreoView />;
    }
  };

  return (
    <div className="bg-background font-sans text-on-surface min-h-screen flex">
      <Sidebar activePath={activePath} setActivePath={setActivePath} />

      <div className="pl-72 w-full flex-1">
        <Header />
        <main className="relative pt-20 min-h-screen bg-background">
          {renderActiveView()}
        </main>
      </div>

      <AIChatbotModal />
    </div>
  );
}
