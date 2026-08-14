import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../data/mockData';

export default function AIChatbotModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hola, soy el asistente analítico del Centro de Inteligencia CENEPRED. Estoy conectado a la base de datos nacional (25 departamentos, 84,369 emergencias). ¿Qué indicador, región o presupuesto deseas consultar?'
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
      return `Región ${d.name}: Score de riesgo del ${d.prob}% (${d.tag}). Registra ${d.emergencias} emergencias históricas en SINPAD, ${d.precipitacionMm}mm de precipitación acumulada, ${d.focosCalor} focos de calor. Su ejecución presupuestal PP0068 es de S/ ${d.devengadoM}M de S/ ${d.pimM}M (${d.pctEjecucion}%).`;
    }

    if (q.includes('presupuesto') || q.includes('mef') || q.includes('pim')) {
      return `El Programa Presupuestal PP0068 (PREVAED) registra un PIM asignado de S/ ${NATIONAL_META.totalPimMillones}M a nivel nacional y un devengado acumulado de S/ ${NATIONAL_META.totalDevengadoMillones}M (${NATIONAL_META.pctEjecucionNacional}% de avance).`;
    }

    if (q.includes('emergencia') || q.includes('afectado') || q.includes('sinpad')) {
      return `Tenemos registrados ${NATIONAL_META.totalEmergencias.toLocaleString()} emergencias históricas, sumando ${NATIONAL_META.totalAfectados.toLocaleString()} personas afectadas y ${NATIONAL_META.totalDamnificados.toLocaleString()} damnificados en 25 departamentos.`;
    }

    return `Conectado al Centro de Inteligencia CENEPRED (25 Departamentos). Analizando '${query}'. El modelo XGBoost actualiza diariamente la inferencia con datos meteorológicos e hidrológicos. ¿Deseas consultar datos de alguna región específica?`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-85 sm:w-96 h-[470px] mb-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 animate-fade-in text-slate-800">
          
          {/* Header with Custom CENEPRED AI Emblem */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-sky-300/40">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-sm text-white leading-tight">Asistente CENEPRED</h4>
                <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase">Inteligencia de Datos</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-body-md text-xs leading-relaxed bg-slate-50/60">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-3 rounded-2xl shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white self-end rounded-tr-none font-medium'
                    : 'bg-white text-slate-800 border border-slate-200/80 self-start rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Field */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe una pregunta sobre riesgo o regiones..."
                className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 rounded-full pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/40 font-medium"
              />
              <button
                onClick={handleSend}
                className="absolute right-1.5 p-1.5 bg-sky-600 text-white rounded-full hover:bg-sky-500 transition-colors flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Sleek Floating Institutional CENEPRED AI Emblem Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-gradient-to-br from-slate-900 via-sky-900 to-slate-950 text-white shadow-2xl hover:shadow-sky-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 ring-2 ring-sky-400/40"
        title="Asistente de Inteligencia CENEPRED"
      >
        <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </button>
    </div>
  );
}
