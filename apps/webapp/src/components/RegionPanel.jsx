import React from 'react';
import { PERU_REGIONS_DATA } from '../data/mockData';

export default function RegionPanel({ selectedRegion, setSelectedRegion }) {
  const regionData = PERU_REGIONS_DATA[selectedRegion] || PERU_REGIONS_DATA["PIURA"];
  const probPct = Math.round(regionData.prob * 100);

  let tagText = "RIESGO BAJO (🟢)";
  let tagColor = "#10B981";
  let tagBg = "rgba(16, 185, 129, 0.2)";

  if (probPct >= 70) {
    tagText = "ALTO RIESGO (🔴)";
    tagColor = "#EF4444";
    tagBg = "rgba(239, 68, 68, 0.2)";
  } else if (probPct >= 40) {
    tagText = "RIESGO MODERADO (🟡)";
    tagColor = "#F59E0B";
    tagBg = "rgba(245, 158, 11, 0.2)";
  }

  return (
    <aside style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-glass)',
      backdropFilter: 'blur(12px)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-main)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Selector de Región</h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>25 Departamentos</span>
      </div>

      <select
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-glass)',
          color: 'var(--text-main)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.95rem',
          fontFamily: 'inherit',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {Object.keys(PERU_REGIONS_DATA).map(reg => (
          <option key={reg} value={reg}>{reg}</option>
        ))}
      </select>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 0',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
          NIVEL DE RIESGO PREDICHO
        </div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          color: tagColor
        }}>
          {probPct}%
        </div>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          background: tagBg,
          color: tagColor,
          border: `1px solid ${tagColor}`,
          marginTop: '0.35rem'
        }}>
          {tagText}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Explicabilidad SHAP</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>XGBoost Model</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {regionData.shap.map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{item.name}</span>
                <span style={{ fontWeight: 600, color: item.color }}>{item.pct}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${item.pct}%`,
                  backgroundColor: item.color,
                  borderRadius: '999px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
