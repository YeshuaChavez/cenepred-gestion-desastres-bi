'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { PERU_DEPARTAMENTOS, NATIONAL_META } from '../data/mockData';

const QUICK_SUGGESTIONS = [
  { label: 'Regiones en mayor riesgo', icon: 'bolt', prompt: '¿Qué regiones están en mayor riesgo?' },
  { label: 'Presupuesto de prevención', icon: 'account_balance_wallet', prompt: '¿Cómo va el presupuesto de prevención?' },
  { label: 'Lluvias por región', icon: 'water_drop', prompt: '¿Dónde ha llovido más?' },
  { label: 'Focos de calor', icon: 'local_fire_department', prompt: '¿Qué regiones tienen más focos de calor?' }
];

const stripAccents = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Respondedor local basado en los datos reales de cada región. Actúa como cerebro del asistente
// cuando el servicio de inteligencia externo no está disponible, respondiendo según la intención.
function localAnswer(prompt: string): string {
  const q = stripAccents(prompt.trim());
  const deptos = Object.values(PERU_DEPARTAMENTOS);
  const fmt = (n: number) => n.toLocaleString('es-PE', { maximumFractionDigits: 1 });
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 1) Región específica mencionada (con límites de palabra para no confundir nombres cortos)
  const dep = deptos.find((d) => new RegExp('\\b' + esc(stripAccents(d.name)) + '\\b').test(q));
  if (dep) {
    return `${dep.name}: riesgo estimado ${dep.prob}% (${dep.tag}).\n`
      + `- Lluvia acumulada (30 días): ${fmt(dep.precip30d ?? 0)} mm\n`
      + `- Focos de calor (30 días): ${dep.focos30d ?? 0}\n`
      + `- Ejecución del presupuesto de prevención: ${dep.pctEjecucion ?? 0}%`;
  }
  // 2) Saludo
  if (/^(hola|buenas|buenos dias|buen dia|hey|saludos|que tal)\b/.test(q)) {
    return 'Hola. Puedo darte el nivel de riesgo de una región, las lluvias, los focos de calor o el presupuesto de prevención. Escribe el nombre de un departamento o elige una de las sugerencias.';
  }
  // 3) Capacidades
  if (/(que puedes|que haces|ayuda|opciones|para que sirves|como funcionas)/.test(q)) {
    return 'Puedo consultar: el riesgo por región, las regiones en mayor riesgo, las lluvias acumuladas, los focos de calor, el registro histórico de emergencias y el presupuesto de prevención (PP0068). Escribe una región o un tema.';
  }
  // 4) Presupuesto
  if (/(presupuesto|mef|pp0068|prevaed|prevenc|inversion|ejecucion|gasto|dinero|financ)/.test(q)) {
    const worst = [...deptos].sort((a, b) => (a.pctEjecucion ?? 0) - (b.pctEjecucion ?? 0)).slice(0, 3);
    return `Presupuesto de prevención (PP0068): S/ ${fmt(NATIONAL_META.totalPimMillones)}M asignados, ${NATIONAL_META.pctEjecucionNacional}% ejecutado a nivel nacional.\n`
      + 'Regiones con menor avance de ejecución:\n' + worst.map((d) => `- ${d.name}: ${d.pctEjecucion ?? 0}%`).join('\n');
  }
  // 5) Lluvias
  if (/(lluvia|precipit|llov|inundac)/.test(q)) {
    const top = [...deptos].filter((d) => (d.precip30d ?? 0) > 0).sort((a, b) => (b.precip30d ?? 0) - (a.precip30d ?? 0)).slice(0, 4);
    if (!top.length) return 'No hay precipitación acumulada relevante en la última ventana disponible.';
    return 'Mayor lluvia acumulada (últimos 30 días):\n' + top.map((d) => `- ${d.name}: ${fmt(d.precip30d ?? 0)} mm`).join('\n');
  }
  // 6) Focos de calor
  if (/(foco|calor|incendio|fuego|quema|termic)/.test(q)) {
    const top = [...deptos].filter((d) => (d.focos30d ?? 0) > 0).sort((a, b) => (b.focos30d ?? 0) - (a.focos30d ?? 0)).slice(0, 4);
    if (!top.length) return 'No se registran focos de calor activos en la última ventana disponible.';
    return 'Regiones con más focos de calor (últimos 30 días):\n' + top.map((d) => `- ${d.name}: ${d.focos30d} focos`).join('\n');
  }
  // 7) Modelo
  if (/(model|predic|f1|auc|algoritmo|machine|xgboost|recall)/.test(q)) {
    return 'El modelo estima la probabilidad de una emergencia hidrometeorológica severa a 7 días por región. Desempeño sobre el periodo de prueba: F1-score 0.751, AUC-ROC 0.860 y recall 0.845.';
  }
  // 8) Emergencias / histórico
  if (/(emergencia|afectad|damnific|historic|sinpad|desastre|evento)/.test(q)) {
    return `Registro histórico oficial (SINPAD, 2012-2023): ${NATIONAL_META.totalEmergencias.toLocaleString('es-PE')} emergencias y ${NATIONAL_META.totalAfectados.toLocaleString('es-PE')} personas afectadas en el Perú.`;
  }
  // 9) Riesgo (genérico)
  if (/(riesgo|peligro|criti|alerta|vulnerab|mayor)/.test(q)) {
    const top = [...deptos].sort((a, b) => b.prob - a.prob).slice(0, 5);
    return 'Regiones con mayor riesgo estimado:\n' + top.map((d) => `- ${d.name}: ${d.prob}% (${d.tag})`).join('\n');
  }
  // 10) Por defecto
  return 'Puedo ayudarte con el riesgo por región, las regiones en mayor riesgo, las lluvias, los focos de calor, las emergencias históricas o el presupuesto de prevención. Escribe el nombre de un departamento o una de esas opciones.';
}

export default function AIChatbotModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: '¡Hola! Soy el asistente de CENEPRED. ¿Qué información regional o presupuestal deseas consultar?'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isListening]);

  // Permite abrir el asistente desde cualquier parte de la app (p. ej. el enlace del Home) y
  // cerrarlo automáticamente al cambiar de sección para que no tape la vista siguiente.
  useEffect(() => {
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    window.addEventListener('open-cenepred-assistant', open);
    window.addEventListener('close-cenepred-assistant', close);
    return () => {
      window.removeEventListener('open-cenepred-assistant', open);
      window.removeEventListener('close-cenepred-assistant', close);
    };
  }, []);

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

      let reply: string | null = null;
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        // Solo se usa la respuesta del servicio si es una respuesta real de inteligencia;
        // si vino marcada como fallback (servicio no disponible), se responde localmente.
        if (data && data.reply && !data.fallback) reply = data.reply;
      }
      if (!reply) reply = localAnswer(textToSend);
      setMessages(prev => [...prev, { sender: 'bot', text: reply as string }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: localAnswer(textToSend) }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window Panel */}
      <div
        className={`
          w-[calc(100vw-1.5rem)] sm:w-[420px] h-[560px] max-h-[85vh]
          bg-white dark:bg-[#0c1833] rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800
          flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto
          ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-90 opacity-0 pointer-events-none hidden'}
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-800 via-sky-900 to-[#0a2540] dark:from-sky-950 dark:via-[#091f3d] dark:to-[#060d1f] p-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500/30 flex items-center justify-center border border-sky-400/40">
              <span className="material-symbols-outlined text-lg text-sky-200">support_agent</span>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Asistente CENEPRED</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span className="text-[10px] text-sky-200 font-medium">En línea</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar chat"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Message History Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70 dark:bg-[#060d1f]/90 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-sky-700 dark:bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <span className="material-symbols-outlined text-xs">support_agent</span>
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-2xs whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-600 to-sky-800 text-white self-end rounded-tr-xs font-semibold'
                    : 'bg-white dark:bg-[#0c1833] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 self-start rounded-tl-xs font-medium'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isListening && (
            <div className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 self-start rounded-2xl p-2.5 flex items-center gap-2 text-[11px] font-semibold animate-pulse">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm">mic</span>
              <span>Escuchando voz... habla ahora</span>
            </div>
          )}

          {isTyping && (
            <div className="flex items-center gap-2 self-start">
              <div className="w-6 h-6 rounded-full bg-sky-700 dark:bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-xs">support_agent</span>
              </div>
              <div className="bg-white dark:bg-[#0c1833] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-2.5 flex items-center gap-1.5 text-[11px] font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 bg-sky-600 dark:bg-sky-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-sky-600 dark:bg-sky-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-sky-600 dark:bg-sky-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[10px] font-bold text-sky-700 dark:text-sky-400">Analizando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-2.5 py-1.5 bg-slate-100/90 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="group whitespace-nowrap px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-[#0c1833] text-sky-900 dark:text-sky-300 hover:text-white hover:bg-sky-600 dark:hover:bg-sky-600 border border-sky-200/90 dark:border-sky-800/80 rounded-full transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sky-600 dark:text-sky-400 group-hover:text-white text-xs">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom Input Box Area */}
        <div className="p-2.5 bg-white dark:bg-[#0c1833] border-t border-slate-200 dark:border-slate-800">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Escuchando voz..." : "Consulta sobre riesgos, regiones o presupuesto..."}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-3.5 pr-18 text-slate-800 dark:text-slate-100 text-[11px] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all placeholder:text-slate-400 font-medium"
            />

            {/* Voice button */}
            {speechSupported && (
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-9 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse shadow-md'
                    : 'text-slate-400 hover:text-sky-700 dark:hover:text-sky-400'
                }`}
                title={isListening ? "Detener voz" : "Dictar por voz"}
              >
                <span className="material-symbols-outlined text-sm">
                  {isListening ? 'mic_off' : 'mic'}
                </span>
              </button>
            )}

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="absolute right-1 w-6 h-6 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-xs active:scale-95"
              title="Enviar"
            >
              <span className="material-symbols-outlined text-[13px]">send</span>
            </button>
          </div>
        </div>

      </div>

      {/* Floating Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          w-12 h-12 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded-full
          shadow-[0_4px_20px_rgba(2,132,199,0.45)] hover:shadow-[0_6px_25px_rgba(2,132,199,0.65)]
          flex items-center justify-center hover:scale-105 transition-all duration-300
          cursor-pointer pointer-events-auto shrink-0 border border-white/20
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none hidden' : 'scale-100 opacity-100'}
        `}
        title="Abrir Asistente CENEPRED"
      >
        <span className="material-symbols-outlined text-2xl">support_agent</span>
      </button>

    </div>
  );
}
