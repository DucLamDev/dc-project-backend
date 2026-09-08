import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Missing admin token." });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || "dev-wedding-secret");
    next();
  } catch {
    res.status(401).json({ message: "Invalid admin token." });
  }
}
