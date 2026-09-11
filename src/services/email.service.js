import nodemailer from "nodemailer";

export function getEmailConfigStatus() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  const missing = [
    ["SMTP_HOST", SMTP_HOST],
    ["SMTP_USER", SMTP_USER],
    ["SMTP_PASS", SMTP_PASS]
  ]
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);
  const port = parseSmtpPort(SMTP_PORT);

  return {
    configured: missing.length === 0,
    missing,
    host: SMTP_HOST?.trim() || "",
    port,
    secure: port === 465,
    user: SMTP_USER?.trim() || "",
    from: MAIL_FROM?.trim() || ""
  };
}

export function describeEmailError(error) {
  return {
    message: error?.message,
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
    response: error?.response
  };
}

export async function sendConfirmationEmail(rsvp) {
  return sendEmail({
    to: rsvp.email,
    subject: "Confirmation RSVP - Stella & Geovanni",
    html: buildConfirmationTemplate(rsvp),
    logContext: `Confirmation email skipped for ${rsvp.email}.`
  });
}

export async function sendTestEmail(to) {
  const sentAt = new Date().toISOString();

  return sendEmail({
    to,
    subject: "SMTP test - Stella & Geovanni",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;">
        <h1>SMTP test</h1>
        <p>This email confirms that the wedding backend can send email via SMTP.</p>
        <p><strong>Sent at:</strong> ${escapeHtml(sentAt)}</p>
      </div>
    `,
    logContext: `SMTP test email skipped for ${to}.`
  });
}

async function sendEmail({ to, subject, html, logContext }) {
  const { SMTP_PASS, SMTP_TIMEOUT_MS } = process.env;
  const config = getEmailConfigStatus();

  if (!config.configured) {
    console.info(`SMTP is not configured. Missing ${config.missing.join(", ")}. ${logContext}`);
    return { skipped: true, missing: config.missing };
  }

  const timeout = Number(SMTP_TIMEOUT_MS || 12000);
  const smtpPassword = SMTP_PASS.replace(/\s/g, "");
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout,
    auth: {
      user: config.user,
      pass: smtpPassword
    },
    tls: { minVersion: "TLSv1.2" }
  });

  await transporter.sendMail({
    from: config.from || `Stella & Geovanni <${config.user}>`,
    to,
    subject,
    html
  });

  return { skipped: false };
}

function parseSmtpPort(value) {
  const port = Number(value || 587);
  return Number.isInteger(port) && port > 0 ? port : 587;
}

function buildConfirmationTemplate(rsvp) {
  const attendanceLabels = {
    ceremony: "Présent à la cérémonie uniquement",
    reception: "Présent à la réception uniquement",
    both: "Présent aux deux",
    decline: "Absent"
  };
  const attendsCeremony = rsvp.attendance === "ceremony" || rsvp.attendance === "both";
  const attendsReception = rsvp.attendance === "reception" || rsvp.attendance === "both";
  const venueRows = [
    attendsCeremony ? "Cérémonie civile : 9h00, Mairie de Toulouse" : "",
    attendsReception ? "Vin d'honneur et réception : à partir de 16h00" : "",
    "Point GPS de rassemblement : https://www.google.com/maps/search/?api=1&query=Mairie+de+Toulouse"
  ].filter(Boolean);

  return `
    <div style="margin:0;padding:32px;background:#FDFBF7;color:#2C2824;font-family:Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;background:#fffaf4;border:1px solid #eadfd0;padding:32px;">
        <div style="font-family:Georgia,serif;font-size:44px;text-align:center;">S | G</div>
        <h1 style="font-family:Georgia,serif;text-align:center;font-size:34px;margin:22px 0 8px;">Merci pour votre réponse</h1>
        <p style="text-align:center;margin:0 0 24px;">Nous avons bien enregistré votre RSVP pour le mariage de Stella & Geovanni.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px;border-top:1px solid #eadfd0;">Nom</td><td style="padding:10px;border-top:1px solid #eadfd0;"><strong>${escapeHtml(rsvp.fullName)}</strong></td></tr>
          <tr><td style="padding:10px;border-top:1px solid #eadfd0;">Présence</td><td style="padding:10px;border-top:1px solid #eadfd0;"><strong>${attendanceLabels[rsvp.attendance] || escapeHtml(rsvp.attendance)}</strong></td></tr>
        </table>
        <div style="margin:24px 0 0;line-height:1.7;">
          <p style="margin:0 0 8px;"><strong>Date :</strong> 07 novembre 2026</p>
          <ul style="margin:0;padding-left:20px;">
            ${venueRows.map((row) => `<li>${escapeHtml(row)}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
