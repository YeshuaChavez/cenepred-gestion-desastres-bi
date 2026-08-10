import React, { useState, useRef, useEffect } from 'react';

export default function AIChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hola, soy el asistente analítico del SAT CENEPRED. ¿Qué información regional, predictiva o presupuestal necesitas consultar hoy?'
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
    }, 500);
  };

  const generateAIResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('piura') || q.includes('lluvias')) {
      return 'Piura - Riesgo Crítico (78%). Las lluvias de los últimos 7 días acumulan +24.5mm sobre lo normal según Open-Meteo. La ejecución del PP 0068 está al 22.4%, dejando una brecha crítica de atención en la cuenca del Río Chira.';
    } else if (q.includes('apurimac') || q.includes('focos')) {
      return 'Apurímac presenta un riesgo predictivo del 88% (Alto). La causa principal en el desglose SHAP son los focos de calor activos detectados por el satélite VIIRS de NASA FIRMS (+32.4) y el historial de friajes.';
    } else if (q.includes('presupuesto') || q.includes('mef')) {
      return 'El Programa Presupuestal PP 0068 registra una ejecución acumulada nacional de S/ 1.1B (45.8% del PIM total). Los pliegos con mayor ejecución son MINDEF (82%) y MINSA (75%).';
    } else {
      return `Conectado al Lakehouse Azure Databricks: analizando '${query}'. El modelo XGBoost actualiza diariamente la inferencia con datos de Open-Meteo, USGS y NASA FIRMS. ¿Deseas consultar el riesgo o brecha MEF de alguna región específica?`;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-85 sm:w-96 h-[460px] mb-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-outline-variant/30 flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-surface-container-low p-4 flex items-center justify-between border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
              </div>
              <div>
                <h4 className="font-label-sm text-sm font-bold text-slate-900 leading-tight">CENEPRED Assistant</h4>
                <span className="font-label-sm text-[10px] text-primary font-semibold">Powered by Azure OpenAI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-body-md text-xs leading-relaxed bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-xl shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white self-end rounded-tr-none font-medium'
                    : 'bg-white text-slate-800 border border-outline-variant/20 self-start rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-outline-variant/20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Consultar RAG..."
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-full py-2 pl-4 pr-10 text-slate-800 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 font-medium"
              />
              <button
                onClick={handleSend}
                className="absolute right-1.5 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_14px_rgba(0,102,138,0.4)] hover:shadow-[0_6px_20px_rgba(0,102,138,0.6)] flex items-center justify-center hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
        title="CENEPRED Assistant"
      >
        <span className="material-symbols-outlined text-[26px]">smart_toy</span>
      </button>
    </div>
  );
}
