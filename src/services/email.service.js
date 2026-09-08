import nodemailer from "nodemailer";

export async function sendConfirmationEmail(rsvp) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.info(`SMTP is not configured. Confirmation email skipped for ${rsvp.email}.`);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: rsvp.email,
    subject: "Confirmation RSVP - Danielle & Chris",
    html: buildConfirmationTemplate(rsvp)
  });

  return { skipped: false };
}

function buildConfirmationTemplate(rsvp) {
  const attendanceLabels = {
    ceremony: "Cérémonie uniquement",
    reception: "Réception uniquement",
    both: "Cérémonie et réception",
    decline: "Ne pourra pas assister"
  };

  return `
    <div style="margin:0;padding:32px;background:#FDFBF7;color:#2C2824;font-family:Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;background:#fffaf4;border:1px solid #eadfd0;padding:32px;">
        <div style="font-family:Georgia,serif;font-size:44px;text-align:center;">D | C</div>
        <h1 style="font-family:Georgia,serif;text-align:center;font-size:34px;margin:22px 0 8px;">Merci pour votre réponse</h1>
        <p style="text-align:center;margin:0 0 24px;">Nous avons bien enregistré votre RSVP.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px;border-top:1px solid #eadfd0;">Nom</td><td style="padding:10px;border-top:1px solid #eadfd0;"><strong>${rsvp.fullName}</strong></td></tr>
          <tr><td style="padding:10px;border-top:1px solid #eadfd0;">Présence</td><td style="padding:10px;border-top:1px solid #eadfd0;"><strong>${attendanceLabels[rsvp.attendance] || rsvp.attendance}</strong></td></tr>
          <tr><td style="padding:10px;border-top:1px solid #eadfd0;">Personnes</td><td style="padding:10px;border-top:1px solid #eadfd0;">${rsvp.partySize}</td></tr>
          <tr><td style="padding:10px;border-top:1px solid #eadfd0;">Menu</td><td style="padding:10px;border-top:1px solid #eadfd0;">${rsvp.menuChoice || "-"}</td></tr>
        </table>
        <p style="margin:24px 0 0;line-height:1.7;">
          Rendez-vous le 10 octobre 2026 à Coto de Caza, Californie.
          Point GPS: 33.5945, -117.5867.
        </p>
      </div>
    </div>
  `;
}
