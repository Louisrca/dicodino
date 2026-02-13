import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret-key";

export type JwtPayload = { playerId: string; username: string };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: "Token manquant" });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ ok: false, error: "Token invalide ou expiré" });
  }
  (req as Request & { jwtPlayer: JwtPayload }).jwtPlayer = payload;
  next();
}