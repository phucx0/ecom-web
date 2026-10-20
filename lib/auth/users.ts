import "server-only";
import { createHash } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { getDocument, mangoQuery, putDocument } from "@/lib/couchdb/documents";
import { CouchDbError } from "@/lib/couchdb/errors";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "./validation";
import type { UserDocument } from "./types";

export class AuthError extends Error { constructor(public code: string, message: string, public status = 400) { super(message); } }
export function userIdForEmail(email: string) { return `user:email:${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}`; }

async function findByEmail(email: string): Promise<UserDocument | null> {
  const normalized = email.trim().toLowerCase();
  try { return await getDocument<UserDocument>(userIdForEmail(normalized)); } catch (error) { if (!(error instanceof CouchDbError) || error.status !== 404) throw error; }
  const result = await mangoQuery<UserDocument>({ type: "user", email: normalized }, { limit: 2 });
  return result.docs[0] ?? null;
}

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) throw new AuthError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  if (await findByEmail(parsed.data.email)) throw new AuthError("EMAIL_EXISTS", "Email đã được sử dụng.", 409);
  const user: UserDocument = { _id: userIdForEmail(parsed.data.email), type: "user", name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, role: "customer", password_hash: await hash(parsed.data.password, 12), account_status: "active", created_at: new Date().toISOString() };
  try { await putDocument(user); } catch (error) { if (error instanceof CouchDbError && error.status === 409) throw new AuthError("EMAIL_EXISTS", "Email đã được sử dụng.", 409); throw error; }
  return user;
}

export async function authenticateUser(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) throw new AuthError("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng.", 401);
  const user = await findByEmail(parsed.data.email);
  if (!user?.password_hash || user.account_status === "disabled" || !(await compare(parsed.data.password, user.password_hash))) throw new AuthError("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng.", 401);
  return user;
}
