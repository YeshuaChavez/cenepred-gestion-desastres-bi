import { NextResponse } from 'next/server';

interface ShapFactor { name: string; val: string; pct: number }

export async function POST(request: Request) {
  try {
    const d = await request.json();

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'El servicio de generación de diagnósticos no está configurado en el servidor.' },
        { status: 500 }
      );
    }

    const factores = Array.isArray(d.shap)
      ? (d.shap as ShapFactor[]).map((s) => `- ${s.name}: ${s.val} (contribución ${s.pct}%)`).join('\n')
      : 'No disponibles';

    const prompt = `Actúa como analista de gestión del riesgo de desastres del CENEPRED (Perú). Redacta un diagnóstico ejecutivo para el departamento indicado, en español institucional sobrio, directo y accionable (máximo ~320 palabras).

Reglas de estilo:
- Escribe como un informe técnico oficial, NO como una respuesta de asistente. No te presentes, no menciones que eres una IA ni cómo se generó el informe, no describas herramientas, plataformas ni tecnologías.
- Sin emojis. Usa cifras solo de los datos provistos; no inventes datos.
- Formato en Markdown, con esta estructura EXACTA de encabezados y viñetas:

## 1. Diagnóstico territorial
Un párrafo breve sobre el nivel de riesgo (${d.prob}%) y la vulnerabilidad del departamento.

## 2. Factores determinantes
- Una viñeta por cada factor relevante, interpretando su peso.

## 3. Recomendaciones de prevención
- Entre 3 y 4 viñetas con acciones priorizadas y concretas.

## 4. Evaluación presupuestal
Un párrafo sobre la ejecución del PP0068 y la brecha por ejecutar.

Usa negritas (**...**) para resaltar las cifras clave.

Datos reales del departamento:
- Departamento: ${d.name} (zona ${d.tag}), riesgo estimado ${d.prob}%
- Emergencias históricas registradas: ${d.emergencias}
- Población afectada: ${d.afectados} · damnificada: ${d.damnificados}
- Telemetría reciente: precipitación acumulada ${d.precip24h ?? 'n/d'} mm (24h) y ${d.precip30d ?? 'n/d'} mm (30 días), ${d.focos30d ?? 'n/d'} focos de calor (30 días), ${d.sismos7d ?? 'n/d'} sismos (7 días)
- Factores determinantes:
${factores}
- Presupuesto de prevención (PP0068): asignado S/ ${d.pimM}M, ejecutado S/ ${d.devengadoM}M, avance ${d.pctEjecucion}%`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 },
      }),
    });

    if (!geminiRes.ok) {
      const detail = await geminiRes.text();
      return NextResponse.json(
        { error: `El servicio de generación de diagnósticos respondió con un error (${geminiRes.status}).`, detail: detail.slice(0, 300) },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const report = parts.map((p: { text?: string }) => p.text).filter(Boolean).join('\n').trim();

    if (!report) {
      return NextResponse.json({ error: 'El servicio de generación no devolvió contenido.' }, { status: 502 });
    }

    return NextResponse.json({ report, provider: 'CENEPRED' });
  } catch (err) {
    console.error('Error en /api/report:', err);
    return NextResponse.json({ error: 'Error interno generando el reporte.' }, { status: 500 });
  }
}
