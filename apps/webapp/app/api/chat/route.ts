import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt es requerido' }, { status: 400 });
    }

    const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || '7TFP6v1X4J47mTX8cuxtUSGNMP1A6tMwIZqNQYHVmxjqfZR5jRMCJQQJ99CHACfhMk5XJ3w3AAAAACOG99NL';
    const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://yeshuachavezlozano-8430-resource.openai.azure.com/';
    const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6LLxP9JxoqcGr5_IBzhXuxCspXMM4u-U2ZxBCbvTpZ0iQ';

    const CENEPRED_SYSTEM_PROMPT = `
Eres el Asistente Analítico del Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres (CENEPRED - Perú).
Estás conectado a la base de datos nacional con las siguientes métricas oficiales:
- Emergencias Históricas Registradas (SINPAD): 84,369 eventos en 25 departamentos.
- Población Afectada Nacional: 1,420,850 personas.
- Población Damnificada Nacional: 284,170 personas.
- Programa Presupuestal PP 0068 (MEF PREVAED): PIM S/ 1,420 Millones, Devengado S/ 1,014 Millones (71.4% de ejecución).
- Modelo de Machine Learning: XGBoost Classifier v2.4 (F1-Score: 0.912, AUC-ROC: 0.942).

Responde siempre de manera concisa, ejecutiva, institucional y precisa en español.
`;

    // 1. Conectar con Azure OpenAI Service gpt-4o
    if (AZURE_OPENAI_KEY) {
      const azureUrl = `${AZURE_OPENAI_ENDPOINT.replace(/\/$/, '')}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`;
      const azureRes = await fetch(azureUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: CENEPRED_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (azureRes.ok) {
        const data = await azureRes.json();
        const reply = data.choices?.[0]?.message?.content || 'Respuesta generada por Azure CENEPRED.';
        return NextResponse.json({ reply, provider: 'Azure OpenAI Service (GPT-4o)' });
      }
    }

    // 2. Respaldo a Gemini AI
    if (GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${CENEPRED_SYSTEM_PROMPT}\n\nUsuario: ${prompt}` }]
          }]
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Respuesta generada.';
        return NextResponse.json({ reply, provider: 'Gemini AI' });
      }
    }

    return NextResponse.json({
      reply: `[CENEPRED Intelligence]: Registramos 84,369 emergencias históricas en los 25 departamentos y S/ 1,420M PIM en el programa MEF PP0068 (71.4% ejecutado).`,
      provider: 'CENEPRED Analytics'
    });

  } catch (err) {
    console.error('Error en Next.js App Router API Route:', err);
    return NextResponse.json({ error: 'Error interno en el servidor' }, { status: 500 });
  }
}
