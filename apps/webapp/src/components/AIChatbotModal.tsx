'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../data/mockData';

const QUICK_SUGGESTIONS = [
  '⚡ Regiones en Riesgo',
  '💰 Presupuesto MEF',
  '🌧️ Lluvia Max 24h',
  '📊 Riesgo Predictivo'
];

export default function AIChatbotModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: '¡Hola! Soy el Asistente de Inteligencia CENEPRED. ¿Qué información regional o presupuestal deseas consultar hoy?'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isListening]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-PE';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isTyping) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback
    }

    setTimeout(() => {
      const botResponse = generateRAGAIResponse(textToSend);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 400);
  };

  const generateRAGAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('prompt') || q.includes('instrucciones') || q.includes('system prompt')) {
      return 'Soy el Asistente CENEPRED, programado para brindar métricas e informes oficiales sobre gestión del riesgo de desastres en el Perú.';
    }

    const deptKeys = Object.keys(PERU_DEPARTAMENTOS);
    const matchedKey = deptKeys.find(k => q.includes(k) || q.includes(PERU_DEPARTAMENTOS[k].name.toLowerCase()));

    if (matchedKey) {
      const d = PERU_DEPARTAMENTOS[matchedKey];
      return `Región ${d.name} (${d.tag}):
- Riesgo SAT: ${d.prob}% | Emergencias: ${d.emergencias}
- Lluvia: ${d.precipitacionMm} mm/24h | Focos: ${d.focosCalor}
- Gasto MEF: ${d.pctEjecucion}% (S/ ${d.devengadoM}M devengados)`;
    }

    if (q.includes('presupuesto') || q.includes('mef') || q.includes('pim') || q.includes('pp 0068') || q.includes('pp0068')) {
      return `Presupuesto MEF PP 0068:
- PIM Nacional: S/ ${NATIONAL_META.totalPimMillones}M
- Devengado: S/ ${NATIONAL_META.totalDevengadoMillones}M (${NATIONAL_META.pctEjecucionNacional}% ejecutado).`;
    }

    if (q.includes('emergencia') || q.includes('afectado') || q.includes('sinpad')) {
      return `Impacto SINPAD Nacional:
- Emergencias: ${NATIONAL_META.totalEmergencias.toLocaleString()}
- Afectados: ${NATIONAL_META.totalAfectados.toLocaleString()} personas
- Cobertura: 100% en los 25 departamentos.`;
    }

    if (q.includes('riesgo') || q.includes('peligro') || q.includes('regiones')) {
      const topRisk = Object.values(PERU_DEPARTAMENTOS).sort((a, b) => b.prob - a.prob).slice(0, 3).map(d => `${d.name} (${d.prob}%)`).join(', ');
      return `Mayor Riesgo Climático:
Regiones prioritarias: ${topRisk}.`;
    }

    return `Consulta CENEPRED '${query}':
Puedes consultar por el riesgo de cualquier departamento o el avance del presupuesto MEF.`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Modern UI Assistant Window Container */}
      <div
        className={`
          w-[360px] sm:w-[400px] h-[520px] bg-white rounded-[2.5rem]
          shadow-[0_20px_60px_rgba(15,23,42,0.25)] border border-slate-200/90
          flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right relative
          ${isOpen
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
            : 'scale-75 opacity-0 translate-y-8 pointer-events-none absolute bottom-0 right-0'
          }
        `}
      >
        {/* Top Vibrant AI Assistant Header Banner */}
        <div className="bg-gradient-to-br from-indigo-700 via-sky-700 to-indigo-900 text-white px-5 pt-5 pb-8 flex flex-col items-center text-center relative shadow-xs">
          
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer text-white backdrop-blur-xs"
            title="Cerrar asistente"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>

          {/* Central Bot Avatar Ring */}
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-lg relative my-1 group">
            <span className="material-symbols-outlined text-white text-3xl group-hover:scale-110 transition-transform">smart_toy</span>
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-indigo-900 rounded-full animate-pulse"></span>
          </div>

          <h4 className="text-base font-extrabold tracking-tight text-white mt-1">Asistente Virtual CENEPRED</h4>
          <span className="text-[11px] text-sky-200 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            En línea • Inteligencia Preventiva
          </span>
        </div>

        {/* Curved Card Content Body Overlay */}
        <div className="-mt-5 flex-1 bg-slate-50 rounded-t-[2rem] flex flex-col overflow-hidden relative z-10">
          
          {/* Quick Suggestion Chips */}
          <div className="px-4 py-3 bg-white/80 backdrop-blur-xs border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 text-[11px] font-bold bg-sky-50/80 text-sky-800 hover:text-white hover:bg-sky-700 border border-sky-200/80 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Message Feed */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-xs leading-relaxed">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-[84%] p-3.5 rounded-2xl shadow-2xs whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-sky-600 to-indigo-700 text-white self-end rounded-tr-xs font-semibold'
                      : 'bg-white text-slate-800 border border-slate-200/90 self-start rounded-tl-xs font-medium'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isListening && (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 self-start rounded-2xl p-3 flex items-center gap-2 text-xs font-semibold animate-pulse">
                <span className="material-symbols-outlined text-amber-600 text-base">mic</span>
                <span>Escuchando voz... habla ahora</span>
              </div>
            )}

            {isTyping && (
              <div className="flex items-center gap-2 self-start">
                <div className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-xs p-3 flex items-center gap-1.5 text-xs font-semibold shadow-2xs">
                  <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1 text-[11px] font-bold text-sky-800">Analizando datos...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Box Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Escuchando voz..." : "Escribe tu consulta..."}
                className="w-full bg-slate-100 border border-slate-200 rounded-full py-2.5 pl-4 pr-20 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all placeholder:text-slate-400 font-medium"
              />

              {/* Voice button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-10 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md'
                      : 'text-slate-400 hover:text-sky-700'
                  }`}
                  title={isListening ? "Detener voz" : "Dictar por voz"}
                >
                  <span className="material-symbols-outlined text-base">
                    {isListening ? 'mic_off' : 'mic'}
                  </span>
                </button>
              )}

              {/* Send button */}
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                className="absolute right-1.5 w-7 h-7 bg-sky-700 text-white rounded-full hover:bg-sky-800 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-xs active:scale-95"
                title="Enviar"
              >
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Avatar Trigger (FAB Button) with Pulse Aura */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          w-16 h-16 bg-gradient-to-tr from-indigo-700 via-sky-700 to-indigo-900 text-white rounded-full
          shadow-[0_8px_30px_rgba(2,132,199,0.5)] hover:shadow-[0_12px_36px_rgba(2,132,199,0.7)]
          flex items-center justify-center hover:scale-110 transition-all duration-300
          cursor-pointer origin-center relative ring-4 ring-sky-400/40
          ${isOpen
            ? 'scale-0 opacity-0 pointer-events-none absolute bottom-0 right-0'
            : 'scale-100 opacity-100 pointer-events-auto'
          }
        `}
        title="Abrir Asistente CENEPRED"
      >
        <span className="material-symbols-outlined text-3xl">smart_toy</span>
        <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-indigo-900 rounded-full animate-pulse"></span>
      </button>

    </div>
  );
}
