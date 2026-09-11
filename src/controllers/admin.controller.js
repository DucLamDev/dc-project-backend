import jwt from "jsonwebtoken";
import { describeEmailError, sendTestEmail } from "../services/email.service.js";

export function login(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD || "stella-geovanni-2026";

  if (req.body.password !== adminPassword) {
    return res.status(401).json({ message: "Invalid password." });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "dev-wedding-secret", { expiresIn: "8h" });
  res.json({ token });
}

export async function testEmail(req, res) {
  const to = String(req.body.to || process.env.SMTP_USER || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ message: "A valid recipient email is required." });
  }

  try {
    const result = await sendTestEmail(to);

    if (result.skipped) {
      return res.status(503).json({
        ok: false,
        message: "SMTP is not configured.",
        missing: result.missing
      });
    }

    res.json({ ok: true, to });
  } catch (error) {
    res.status(502).json({
      ok: false,
      message: "SMTP test failed.",
      error: describeEmailError(error)
    });
  }
}
