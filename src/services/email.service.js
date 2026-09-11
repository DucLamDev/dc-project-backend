import nodemailer from "nodemailer";

export async function sendConfirmationEmail(rsvp) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, SMTP_TIMEOUT_MS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.info(`SMTP is not configured. Confirmation email skipped for ${rsvp.email}.`);
    return { skipped: true };
  }

  const port = Number(SMTP_PORT || 587);
  const timeout = Number(SMTP_TIMEOUT_MS || 12000);
  const smtpPassword = SMTP_PASS.replace(/\s/g, "");
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout,
    auth: {
      user: SMTP_USER.trim(),
      pass: smtpPassword
    },
    tls: { minVersion: "TLSv1.2" }
  });

  await transporter.sendMail({
    from: MAIL_FROM?.trim() || `Stella & Geovanni <${SMTP_USER.trim()}>`,
    to: rsvp.email,
    subject: "Confirmation RSVP - Stella & Geovanni",
    html: buildConfirmationTemplate(rsvp)
  });

  return { skipped: false };
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
