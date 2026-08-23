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

    const prompt = `Eres analista del Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres (CENEPRED, Perú). Redacta un DIAGNÓSTICO EJECUTIVO de riesgo de desastres para el departamento indicado, en español institucional sobrio, SIN emojis, conciso y accionable (máximo ~350 palabras).

Usa EXCLUSIVAMENTE estos datos reales; no inventes cifras:
- Departamento: ${d.name} (zona ${d.tag})
- Score de riesgo climático (modelo predictivo validado; F1 0.751 / AUC-ROC 0.860; validación temporal 2012-20 / 21-23): ${d.prob}%
- Emergencias históricas registradas (SINPAD): ${d.emergencias}
- Población afectada: ${d.afectados}
- Población damnificada: ${d.damnificados}
- Telemetría 24h: precipitación ${d.precipitacionMm} mm, ${d.focosCalor} focos de calor activos, ${d.sismos7d ?? 'n/d'} sismos en 7 días
- Factores determinantes del riesgo:
${factores}
- Presupuesto MEF PP0068: PIM S/ ${d.pimM}M, devengado S/ ${d.devengadoM}M, ejecución ${d.pctEjecucion}%

Estructura la respuesta en 4 secciones numeradas:
1) Diagnóstico territorial y vulnerabilidad
2) Interpretación de los factores determinantes del riesgo
3) Recomendaciones de acción preventiva priorizadas
4) Evaluación financiera de la prevención (usa el PP0068 y la brecha por ejecutar)`;

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
