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
    const headerColor = isCritical ? "#0c365a" : "#0284c7";
    const badgeColor = isCritical ? "#dc2626" : "#ea580c";
    const statusBadge = isCritical ? "CRÍTICO" : "ALTO";

    // Plantilla HTML formal e institucional con iconos SVG (sin emojis)
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: ${headerColor}; padding: 24px 20px; text-align: center; color: #ffffff;">
          <div style="margin-bottom: 8px; display: inline-block;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 style="margin: 0; font-size: 20px; letter-spacing: 0.5px; font-weight: 700;">SISTEMA DE ALERTA TEMPRANA - CENEPRED</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Reporte Institucional de Inferencia y Monitoreo de Riesgo</p>
        </div>
        
        <div style="padding: 28px 24px; color: #1e293b;">
          <div style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; padding: 6px 14px; border-radius: 4px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; margin-bottom: 20px;">
            NIVEL DE ALERTA: ${statusBadge}
          </div>
          
          <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px;">Evaluación de Riesgo: Departamento de ${departamento}</h2>
          <p style="line-height: 1.6; color: #334155; margin-bottom: 24px; font-size: 14px;">
            El motor de evaluación predictiva ha identificado una condición de riesgo elevado para el departamento de <strong>${departamento}</strong> durante las próximas 24 a 72 horas.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; background-color: #f1f5f9;">
                <th style="padding: 12px; font-size: 13px; color: #334155;">Variable Telegráfica</th>
                <th style="padding: 12px; font-size: 13px; color: #334155;">Valor Registrado (24h)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-size: 13px;">
                  <span style="vertical-align: middle; display: inline-block; margin-right: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  </span>
                  Precipitación Máxima
                </td>
                <td style="padding: 12px; font-weight: bold; font-size: 13px; color: #0f172a;">${precipitacionMax} mm</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-size: 13px;">
                  <span style="vertical-align: middle; display: inline-block; margin-right: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>
                  </span>
                  Focos de Calor Activos
                </td>
                <td style="padding: 12px; font-weight: bold; font-size: 13px; color: #0f172a;">${focosCalor} focos</td>
              </tr>
              <tr>
                <td style="padding: 12px; font-size: 13px;">
                  <span style="vertical-align: middle; display: inline-block; margin-right: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </span>
                  Actividad Sísmica (7 días)
                </td>
                <td style="padding: 12px; font-weight: bold; font-size: 13px; color: #0f172a;">${sismos7d} sismos</td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #0f172a; font-size: 14px; margin: 0 0 10px 0;">Factores Determinantes (Explicabilidad SHAP):</h3>
          <ul style="padding-left: 20px; color: #475569; margin: 0 0 24px 0; font-size: 13px; line-height: 1.6;">
            ${factoresRiesgo.map((f: string) => `<li style="margin-bottom: 6px;">${f}</li>`).join("")}
          </ul>

          <div style="padding: 14px 16px; background-color: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #0369a1; line-height: 1.5;">
              <strong>Acción Operativa Recomendada:</strong> Verificar los planes de contingencia regionales y dar seguimiento a la ejecución presupuestal del Programa PP 0068 en la plataforma SAT CENEPRED.
            </p>
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 14px 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Centro Nacional de Estimación, Prevención y Reducción del Riesgo de Desastres - CENEPRED<br/>
          Notificación dirigida a: <strong>${destinatario}</strong>
        </div>
      </div>
    `;

    // 1. Envío de Correo vía Nodemailer
    let emailSent = false;
    let emailStatus = "SIMULATED";
    try {
      if (process.env.SMTP_PASS && process.env.SMTP_PASS !== "demo-app-password-token") {
        await transporter.sendMail({
          from: '"CENEPRED SAT Alertas" <alertas.sat.cenepred@gmail.com>',
          to: destinatario,
          subject: `[ALERTA ${nivelRiesgo.toUpperCase()}] Evaluación de Riesgo en ${departamento}`,
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

    // 2. Envío Opcional de Alerta a Telegram Bot (sin emojis)
    let telegramSent = false;
    if (process.env.TELEGRAM_BOT_TOKEN && telegramChatId) {
      try {
        const tgMessage = `[ALERTA SAT CENEPRED - RIESGO ${nivelRiesgo.toUpperCase()}]\n\nDepartamento: ${departamento}\nPrecipitación Máx: ${precipitacionMax} mm\nFocos Calor: ${focosCalor}\nSismos 7d: ${sismos7d}\n\nNotificación enviada a: ${destinatario}`;
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: tgMessage
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
