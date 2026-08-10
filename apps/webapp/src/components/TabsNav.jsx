import React from 'react';

const TABS = [
  { id: 'monitoreo', label: '🌤️ Monitoreo Diario' },
  { id: 'historico', label: '📈 Histórico & Tendencias' },
  { id: 'riesgo', label: '🤖 Riesgo Predictivo & SHAP' },
  { id: 'comparativo', label: '📊 Comparativo Regional' },
  { id: 'presupuesto', label: '💰 Presupuesto MEF PP 0068' }
];

export default function TabsNav({ activeTab, setActiveTab }) {
  return (
    <nav style={{
      background: 'rgba(15, 23, 42, 0.6)',
      borderBottom: '1px solid var(--border-glass)',
      padding: '0.5rem 2rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'var(--primary-glow)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                padding: '0.65rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'var(--transition)',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
