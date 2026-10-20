import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDocument } from "@/lib/couchdb/documents";
import { SESSION_COOKIE, createSessionToken, sessionTtlSeconds, verifySessionToken } from "./token";
import type { UserDocument, UserRole } from "./types";

export async function setSession(user: UserDocument) {
  const token = await createSessionToken({ userId: user._id, role: user.role, email: user.email });
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: sessionTtlSeconds() });
}

export async function clearSession() { (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 }); }

export async function currentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function currentUser(): Promise<UserDocument | null> {
  const session = await currentSession();
  if (!session) return null;
  try {
    const user = await getDocument<UserDocument>(session.userId);
    if (!user.password_hash || user.account_status === "disabled" || user.role !== session.role || user.email !== session.email) return null;
    return user;
  } catch { return null; }
}

export async function requireUser(role?: UserRole) {
  const user = await currentUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(role === "admin" ? "/admin" : "/account")}`);
  if (role && user.role !== role) redirect("/account?error=forbidden");
  return user;
}
