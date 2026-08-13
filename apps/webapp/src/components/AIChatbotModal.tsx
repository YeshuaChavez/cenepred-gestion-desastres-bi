import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../data/mockData';

export default function AIChatbotModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hola, soy el asistente analítico de Inteligencia para la Gestión del Riesgo de CENEPRED. Estoy conectado a la capa Gold (25 departamentos, 84k+ emergencias). ¿Qué región, indicador o presupuesto deseas consultar hoy?'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    }, 400);
  };

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    // Check if user mentions any department
    const deptKeys = Object.keys(PERU_DEPARTAMENTOS);
    const matchedKey = deptKeys.find(k => q.includes(k) || q.includes(PERU_DEPARTAMENTOS[k].name.toLowerCase()));

    if (matchedKey) {
      const d = PERU_DEPARTAMENTOS[matchedKey];
      return `Región ${d.name}: Score de riesgo del ${d.prob}% (${d.tag}). Registra ${d.emergencias} emergencias históricas en SINPAD, ${d.precipitacionMm}mm de precipitación acumulada, ${d.focosCalor} focos de calor FIRMS. Su ejecución presupuestal PP0068 es de S/ ${d.devengadoM}M de S/ ${d.pimM}M (${d.pctEjecucion}%).`;
    }

    if (q.includes('presupuesto') || q.includes('mef') || q.includes('pim')) {
      return `El Programa Presupuestal PP0068 (PREVAED) registra un PIM asignado de S/ ${NATIONAL_META.totalPimMillones}M a nivel nacional y un devengado acumulado de S/ ${NATIONAL_META.totalDevengadoMillones}M (${NATIONAL_META.pctEjecucionNacional}% de avance).`;
    }

    if (q.includes('emergencia') || q.includes('afectado') || q.includes('sinpad')) {
      return `En la capa Gold tenemos registrados ${NATIONAL_META.totalEmergencias.toLocaleString()} emergencias históricas, sumando ${NATIONAL_META.totalAfectados.toLocaleString()} personas afectadas y ${NATIONAL_META.totalDamnificados.toLocaleString()} damnificados en 25 departamentos.`;
    }

    return `Conectado al Lakehouse CENEPRED (25 Departamentos). Analizando '${query}'. El modelo XGBoost actualiza diariamente la inferencia con datos de Open-Meteo, USGS y NASA FIRMS. ¿Deseas consultar datos de alguna región específica?`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-85 sm:w-96 h-[460px] mb-4 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-outline-variant/30 flex flex-col overflow-hidden transition-all duration-300">
          <div className="bg-surface-container-low p-4 flex items-center justify-between border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
              </div>
              <div>
                <h4 className="font-label-sm text-sm font-bold text-slate-900 leading-tight">CENEPRED Assistant</h4>
                <span className="font-label-sm text-[10px] text-primary font-semibold">Gold Layer RAG Connected</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

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

          <div className="p-3 bg-white border-t border-outline-variant/20">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Consultar departamento o indicador..."
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
