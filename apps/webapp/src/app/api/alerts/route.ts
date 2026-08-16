import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      departamento = "CUSCO",
      nivelRiesgo = "Alto",
      precipitacionMax = 85.5,
      focosCalor = 12,
      sismos7d = 4,
      factoresRiesgo = ["Lluvias Intensas > 80mm", "Incremento de Focos de Calor"],
      destinatario = "yeshuachavezlozano@gmail.com",
      telegramChatId = process.env.TELEGRAM_CHAT_ID
    } = body;

    // Solo enviar alertas para niveles ALTO o CRÍTICO
    if (nivelRiesgo !== "Alto" && nivelRiesgo !== "Crítico") {
      return NextResponse.json({
        success: false,
        message: `No se requiere envío de alerta. El nivel de riesgo '${nivelRiesgo}' no supera el umbral crítico.`
      });
    }

    // Configuración del transporter Nodemailer (SMTP / Gmail / SendGrid / Azure SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "alertas.sat.cenepred@gmail.com",
        pass: process.env.SMTP_PASS || "demo-app-password-token"
      }
    });

    const isCritical = nivelRiesgo === "Crítico";
    const headerColor = isCritical ? "#dc2626" : "#ea580c";
    const statusBadge = isCritical ? "🚨 CRÍTICO" : "⚠️ ALTO";

    // Plantilla HTML formal para analistas de gestión de riesgos
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${headerColor}; padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px;">SISTEMA DE ALERTA TEMPRANA - CENEPRED</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Notificación Automática de Inferencia de Riesgo</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
          <div style="display: inline-block; background-color: ${headerColor}; color: white; padding: 6px 12px; border-radius: 4px; font-weight: bold; margin-bottom: 16px;">
            NIVEL DE RIESGO: ${statusBadge}
          </div>
          <h2 style="margin-top: 0; color: #0f172a;">Alerta Temprana en el Departamento de ${departamento}</h2>
          <p style="line-height: 1.5; color: #334155;">
            El modelo predictivo de Machine Learning ha detectado una condición de riesgo elevado para las próximas 24-72 horas en el departamento de <strong>${departamento}</strong>.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
                <th style="padding: 10px;">Variable Telegráfica</th>
                <th style="padding: 10px;">Valor Registrado (24h)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px;">Precipitación Máxima</td>
                <td style="padding: 10px; font-weight: bold;">${precipitacionMax} mm</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px;">Focos de Calor Activos</td>
                <td style="padding: 10px; font-weight: bold;">${focosCalor} focos</td>
              </tr>
              <tr>
                <td style="padding: 10px;">Actividad Sísmica (7 días)</td>
                <td style="padding: 10px; font-weight: bold;">${sismos7d} sismos</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #0f172a; margin-bottom: 8px;">Factores Determinantes (SHAP):</h3>
          <ul style="padding-left: 20px; color: #475569;">
            ${factoresRiesgo.map((f: string) => `<li style="margin-bottom: 4px;">${f}</li>`).join("")}
          </ul>

          <div style="margin-top: 24px; padding: 12px; background-color: #f1f5f9; border-left: 4px solid #0284c7; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #0369a1;">
              <strong>Acción Recomendada:</strong> Verificar planes de contingencia regionales y revisar la ejecución presupuestal PREVAED en el sistema SAT CENEPRED.
            </p>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Notificación generada automáticamente por el motor de inferencia CENEPRED SAT.<br/>
          Destinatario oficial: ${destinatario}
        </div>
      </div>
    `;

    // 1. Envío de Correo vía Nodemailer
    let emailSent = false;
    let emailStatus = "SIMULATED";
    try {
      if (process.env.SMTP_PASS && process.env.SMTP_PASS !== "demo-app-password-token") {
        await transporter.sendMail({
          from: '"SAT CENEPRED Alertas" <alertas.sat.cenepred@gmail.com>',
          to: destinatario,
          subject: `[ALERTA ${nivelRiesgo.toUpperCase()}] Riesgo de Desastre Detectado en ${departamento}`,
          html: htmlTemplate
        });
        emailSent = true;
        emailStatus = "DISPATCHED";
      } else {
        emailStatus = "PREPARED_SIMULATED (Configurar SMTP_PASS para transporte SMTP en vivo)";
      }
    } catch (e: any) {
      emailStatus = `SMTP_ERROR: ${e.message}`;
    }

    // 2. Envío Opcional de Alerta a Telegram Bot
    let telegramSent = false;
    if (process.env.TELEGRAM_BOT_TOKEN && telegramChatId) {
      try {
        const tgMessage = `🚨 *ALERTA SAT CENEPRED - RIESGO ${nivelRiesgo.toUpperCase()}*\n\n📍 *Departamento:* ${departamento}\n🌧️ *Precipitación Máx:* ${precipitacionMax} mm\n🔥 *Focos Calor:* ${focosCalor}\n🌋 *Sismos 7d:* ${sismos7d}\n\n📨 Notificación enviada a: ${destinatario}`;
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: tgMessage,
            parse_mode: "Markdown"
          })
        });
        telegramSent = true;
      } catch (err) {
        console.error("Error al enviar alerta a Telegram:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Alerta procesada exitosamente para ${departamento} (Riesgo: ${nivelRiesgo}).`,
      destinatario,
      emailStatus,
      emailSent,
      telegramSent,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
