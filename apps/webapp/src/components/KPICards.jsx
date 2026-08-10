import React from 'react';

const KPIS = [
  {
    title: "REGIONES EN ALTO RIESGO",
    badge: "🔴 CRÍTICO",
    value: "5 Regiones",
    footer: "Probabilidad predicha (XGBoost) ≥ 70%",
    color: "var(--risk-high)"
  },
  {
    title: "PRECIPITACIÓN PROMEDIO 7D",
    badge: "🌦️ CLIMA",
    value: "42.8 mm",
    footer: "Monitoreo activo diario (Open-Meteo API)",
    color: "var(--primary)"
  },
  {
    title: "FOCOS DE CALOR ACTIVOS",
    badge: "🔥 NASA FIRMS",
    value: "128 Focos",
    footer: "Detección satelital casi en tiempo real",
    color: "var(--risk-medium)"
  },
  {
    title: "EJECUCIÓN PP 0068 (MEF)",
    badge: "💰 PREVAED",
    value: "84.5%",
    footer: "Presupuesto Devengado / PIM Asignado",
    color: "var(--risk-low)"
  }
];

export default function KPICards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.25rem'
    }}>
      {KPIS.map((kpi, idx) => (
        <div key={idx} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          backdropFilter: 'blur(12px)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          transition: 'var(--transition)'
        }}>
          <div style={{
            display: 'flex',
            justifySpaceBetween: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            <span>{kpi.title}</span>
            <span style={{ color: kpi.color, fontWeight: 600 }}>{kpi.badge}</span>
          </div>

          <div style={{
            fontSize: '1.85rem',
            fontWeight: 700,
            color: kpi.color,
            letterSpacing: '-0.03em'
          }}>
            {kpi.value}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {kpi.footer}
          </div>
        </div>
      ))}
    </div>
  );
}
