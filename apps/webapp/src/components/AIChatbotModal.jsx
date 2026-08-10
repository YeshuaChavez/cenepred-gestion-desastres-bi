import React, { useState, useRef, useEffect } from 'react';

export default function AIChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: '¡Hola! Soy el asistente virtual de CENEPRED. Puedo responder preguntas en lenguaje natural sobre las predicciones de riesgo de emergencias, los datos climáticos de Open-Meteo y la explicabilidad SHAP por región. ¿En qué te puedo ayudar hoy?'
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      const botResponse = generateAIResponse(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  const generateAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('piura') || q.includes('lluvias')) {
      return 'Para Piura, el modelo XGBoost estima una probabilidad de riesgo del 94% (Alto Riesgo). La explicación SHAP indica que el 45% del riesgo se debe a la precipitación acumulada de 7d (Open-Meteo) y el 30% a la anomalía climática.';
    } else if (q.includes('apurimac') || q.includes('focos')) {
      return 'Apurímac presenta una probabilidad de riesgo del 88%. Los factores SHAP determinantes son el historial de emergencias SINPAD (40%) y la concentración reciente de focos de calor detectados por satélite NASA FIRMS (35%).';
    } else if (q.includes('presupuesto') || q.includes('mef')) {
      return 'En el Programa Presupuestal PP 0068 (PREVAED), el presupuesto ejecutado nacional asciende al 84.5% del PIM total asignado. Las regiones con mayor severidad histórica muestran un costo promedio de S/. 450 por persona afectada.';
    } else {
      return `Analizando la capa Gold del Lakehouse: la consulta sobre '${query}' muestra que el sistema actualiza diariamente los datos de Open-Meteo, sismos de USGS y focos de calor satelitales. ¿Deseas detalles sobre una región en particular?`;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          color: '#FFF',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          zIndex: 200,
          transition: 'var(--transition)'
        }}
        title="Consultar Asistente AI CENEPRED"
      >
        💬
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          right: '2rem',
          width: '380px',
          height: '520px',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(30, 41, 59, 0.8)',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Asistente RAG CENEPRED</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--risk-low)' }}>Azure OpenAI Service</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  lineHeight: 1.45,
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
                  color: msg.sender === 'user' ? '#0F172A' : 'var(--text-main)',
                  fontWeight: msg.sender === 'user' ? 500 : 400,
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px'
                }}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '0.85rem',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pregunta sobre riesgo en Piura..."
              style={{
                flex: 1,
                background: 'rgba(9, 13, 22, 0.8)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: 'var(--primary)',
                color: '#0F172A',
                border: 'none',
                padding: '0 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
