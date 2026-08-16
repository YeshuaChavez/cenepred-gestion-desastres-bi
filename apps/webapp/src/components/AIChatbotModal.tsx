'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../data/mockData';

const QUICK_SUGGESTIONS = [
  '¿Regiones en mayor riesgo?',
  'Avance MEF PP0068',
  'Diagnóstico Ica',
  'Emergencias SINPAD',
  'Modelo XGBoost'
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
      text: 'Hola, soy el Asistente CENEPRED. ¿En qué información regional o presupuestal puedo ayudarte hoy?'
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
      // Fallback to local RAG
    }

    setTimeout(() => {
      const botResponse = generateRAGAIResponse(textToSend);
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 400);
  };

  const generateRAGAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('prompt') || q.includes('instrucciones') || q.includes('system prompt') || q.includes('actuando ahora')) {
      return 'Soy el Asistente CENEPRED, programado para brindar métricas e informes oficiales sobre gestión del riesgo de desastres en el Perú.';
    }

    if (q.includes('nazi') || q.includes('hitler') || q.includes('futbol') || q.includes('messi') || q.includes('pelicula')) {
      return 'Como Asistente CENEPRED, mi atención se limita exclusivamente a emergencias, telemetría y presupuesto MEF PP 0068 en el Perú.';
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

    if (q.includes('emergencia') || q.includes('afectado') || q.includes('damnificado') || q.includes('sinpad')) {
      return `Impacto SINPAD Nacional:
- Emergencias: ${NATIONAL_META.totalEmergencias.toLocaleString()}
- Afectados: ${NATIONAL_META.totalAfectados.toLocaleString()} personas
- Cobertura: 100% en los 25 departamentos.`;
    }

    if (q.includes('riesgo') || q.includes('peligro') || q.includes('peor') || q.includes('regiones')) {
      const topRisk = Object.values(PERU_DEPARTAMENTOS).sort((a, b) => b.prob - a.prob).slice(0, 3).map(d => `${d.name} (${d.prob}%)`).join(', ');
      return `Mayor Riesgo Climático:
Regiones prioritarias: ${topRisk}.`;
    }

    if (q.includes('xgboost') || q.includes('modelo') || q.includes('ia')) {
      return `Modelo XGBoost v2.4:
- F1-Score: 0.912 | AUC-ROC: 0.942
- Evalúa lluvias 24h, focos satelitales e historial SINPAD.`;
    }

    return `Consulta CENEPRED '${query}':
Puedes preguntar por el riesgo de cualquier región (ej: Piura, Ica, Cusco) o el avance del presupuesto MEF.`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Chat Window Container with Animated Transition */}
      <div
        className={`
          w-[350px] sm:w-[390px] h-[480px] bg-white/95 backdrop-blur-2xl rounded-3xl
          shadow-[0_12px_45px_rgba(0,0,0,0.18)] border border-slate-200/90
          flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right
          ${isOpen
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
            : 'scale-75 opacity-0 translate-y-8 pointer-events-none absolute bottom-0 right-0'
          }
        `}
      >
        {/* Dynamic Glassmorphism Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-900 to-slate-900 text-white px-4 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-wide leading-tight">Asistente CENEPRED</h4>
              <span className="text-[10px] text-sky-200 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                En línea • Respuestas rápidas
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center cursor-pointer text-white"
            title="Cerrar asistente"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(suggestion)}
              className="whitespace-nowrap px-2.5 py-1 text-[10px] font-semibold bg-white text-slate-700 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-2.5 text-xs leading-relaxed bg-slate-50/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[88%] p-3 rounded-2xl shadow-2xs whitespace-pre-line ${
                msg.sender === 'user'
                  ? 'bg-sky-700 text-white self-end rounded-tr-xs font-medium'
                  : 'bg-white text-slate-800 border border-slate-200/90 self-start rounded-tl-xs'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {isListening && (
            <div className="bg-amber-50 text-amber-800 border border-amber-200/80 self-start rounded-2xl p-2.5 flex items-center gap-2 text-xs font-semibold animate-pulse">
              <span className="material-symbols-outlined text-amber-600 text-base">mic</span>
              <span>Escuchando... habla ahora</span>
            </div>
          )}

          {isTyping && (
            <div className="bg-white text-slate-500 border border-slate-200 self-start rounded-2xl rounded-tl-xs p-2.5 flex items-center gap-1.5 text-xs font-semibold shadow-2xs">
              <span className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-sky-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="ml-1 text-[10px]">Procesando...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-2.5 bg-white border-t border-slate-200">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Escuchando voz..." : "Escribe tu consulta..."}
              className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-3.5 pr-18 text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-400 font-medium"
            />

            {/* Mic button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-8 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'text-slate-400 hover:text-sky-600'
                }`}
                title={isListening ? "Detener voz" : "Dictar por voz"}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isListening ? 'mic_off' : 'mic'}
                </span>
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="absolute right-1 w-6 h-6 bg-sky-700 text-white rounded-full hover:bg-sky-800 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40"
              title="Enviar"
            >
              <span className="material-symbols-outlined text-[13px]">send</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Circle Button (FAB) with Smooth Vanishing/Reappearing Swap Animation */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          w-14 h-14 bg-gradient-to-r from-sky-700 to-sky-900 text-white rounded-full
          shadow-[0_6px_22px_rgba(2,132,199,0.45)] hover:shadow-[0_8px_28px_rgba(2,132,199,0.65)]
          flex items-center justify-center hover:scale-110 transition-all duration-300
          cursor-pointer origin-center
          ${isOpen
            ? 'scale-0 opacity-0 pointer-events-none absolute bottom-0 right-0'
            : 'scale-100 opacity-100 pointer-events-auto'
          }
        `}
        title="Abrir Asistente CENEPRED"
      >
        <span className="material-symbols-outlined text-[26px]">smart_toy</span>
      </button>

    </div>
  );
}
