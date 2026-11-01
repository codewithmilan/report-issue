import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "civic-report-super-secret-jwt-key-2026";
const JWT_EXPIRES_IN = "7d";

export const AUTH_COOKIE_NAME = "civic_auth_token";

export interface JWTPayload {
  id: string;
  email: string;
  role: "admin" | "user";
  name: string;
}

export function signJwt(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

