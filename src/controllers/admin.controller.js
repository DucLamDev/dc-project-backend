import jwt from "jsonwebtoken";

export function login(req, res) {
  const adminPassword = process.env.ADMIN_PASSWORD || "stella-geovanni-2026";

  if (req.body.password !== adminPassword) {
    return res.status(401).json({ message: "Invalid password." });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "dev-wedding-secret", { expiresIn: "8h" });
  res.json({ token });
}
