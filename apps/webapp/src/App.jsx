import React, { useState } from 'react';
import Header from './components/Header';
import TabsNav from './components/TabsNav';
import KPICards from './components/KPICards';
import RegionPanel from './components/RegionPanel';
import PowerBIEmbed from './components/PowerBIEmbed';
import AIChatbotModal from './components/AIChatbotModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('monitoreo');
  const [selectedRegion, setSelectedRegion] = useState('PIURA');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <TabsNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{
        maxWidth: '1440px',
        margin: '1.5rem auto',
        padding: '0 1.5rem',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        flex: 1
      }}>
        <KPICards />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: '1.5rem'
        }}>
          <RegionPanel
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
          />
          <PowerBIEmbed activeTab={activeTab} />
        </div>
      </main>

      <AIChatbotModal />
    </div>
  );
}
