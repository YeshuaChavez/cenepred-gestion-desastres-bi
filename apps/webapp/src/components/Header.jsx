import React from 'react';

export default function Header() {
  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-glass)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.85rem 2rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, var(--risk-high), #B91C1C)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.3rem',
            color: '#FFF',
            boxShadow: '0 0 15px var(--risk-high-glow)'
          }}>
            C
          </div>
          <div>
            <h1 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #FFFFFF, var(--text-muted))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              CENEPRED — SAT Riesgo Dinámico
            </h1>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--primary)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Lakehouse Architecture (Medallion) • Azure Databricks
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.4rem 0.9rem',
          borderRadius: '999px',
          fontSize: '0.8rem',
          color: 'var(--risk-low)',
          fontWeight: 500
        }}>
          <span className="animate-pulse-dot" style={{
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--risk-low)',
            borderRadius: '50%',
            boxShadow: '0 0 8px var(--risk-low)'
          }} />
          <span>Databricks SQL Serverless Connected</span>
        </div>
      </div>
    </header>
  );
}
