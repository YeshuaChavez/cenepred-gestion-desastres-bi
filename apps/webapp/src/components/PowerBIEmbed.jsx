import React from 'react';
import { DASHBOARDS_METADATA } from '../data/mockData';

export default function PowerBIEmbed({ activeTab }) {
  const currentDash = DASHBOARDS_METADATA[activeTab] || DASHBOARDS_METADATA.monitoreo;

  return (
    <section style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-glass)',
      backdropFilter: 'blur(12px)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-main)',
      minHeight: '580px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
            {currentDash.title}
          </h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            {currentDash.description}
          </div>
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--primary)',
          background: 'var(--primary-glow)',
          padding: '0.35rem 0.75rem',
          borderRadius: '999px',
          fontWeight: 500,
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          {currentDash.badge}
        </div>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9, 13, 22, 0.6)',
        position: 'relative',
        minHeight: '500px'
      }}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
            Visualizador Embebido Power BI Service / Embedded
          </h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Contenedor React listo para integrar <code style={{ color: 'var(--primary)' }}>@powerbi/powerbi-client-react</code> conectado a tu catálogo <code style={{ color: 'var(--primary)' }}>dbw_cenepred_dev</code> en Databricks Serverless.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              Catálogo: <code>dbw_cenepred_dev</code>
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              Esquema: <code>default</code>
            </span>
            <span style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              Modo: <code>DirectQuery</code>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
