import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import HomeView from './components/views/HomeView';
import MonitoreoView from './components/views/MonitoreoView';
import HistoricoTendenciasView from './components/views/HistoricoTendenciasView';
import RiesgoPredictivoView from './components/views/RiesgoPredictivoView';
import PresupuestoMEFView from './components/views/PresupuestoMEFView';
import ComparativoRegionalView from './components/views/ComparativoRegionalView';
import AIChatbotModal from './components/AIChatbotModal';
import { ActivePath } from './types';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activePath, setActivePath] = useState<ActivePath>('home');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

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
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            setActivePath('home');
          }}
        />
      )}

      <div className="bg-slate-50 font-sans text-slate-900 min-h-screen flex selection:bg-sky-500 selection:text-white">
        <Sidebar
          activePath={activePath}
          setActivePath={setActivePath}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <div className={`${isCollapsed ? 'pl-20' : 'pl-72'} w-full flex-1 transition-all duration-300 ease-in-out`}>
          <Header setActivePath={setActivePath} isCollapsed={isCollapsed} />
          <main className="relative pt-20 min-h-screen bg-slate-50">
            {renderActiveView()}
          </main>
        </div>

        <AIChatbotModal />
      </div>
    </>
  );
}
