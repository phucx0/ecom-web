import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "./types";

export const SESSION_COOKIE = "retail_session";
export type SessionPayload = { userId: string; role: UserRole; email: string };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự.");
  return new TextEncoder().encode(value);
}

export function sessionTtlSeconds() {
  const ttl = Number(process.env.SESSION_TTL_SECONDS ?? 28800);
  return Number.isInteger(ttl) && ttl >= 60 && ttl <= 604800 ? ttl : 28800;
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${sessionTtlSeconds()}s`).sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || (payload.role !== "customer" && payload.role !== "admin")) return null;
    return { userId: payload.userId, email: payload.email, role: payload.role };
  } catch { return null; }
}
