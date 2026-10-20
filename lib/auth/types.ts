import type { CouchDocument } from "@/lib/couchdb/documents";

export type UserRole = "customer" | "admin";

export interface UserDocument extends CouchDocument {
  type: "user";
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  password_hash?: string;
  account_status?: "active" | "disabled";
}

export type SafeUser = Pick<UserDocument, "_id" | "name" | "email" | "phone" | "role" | "created_at">;

export function toSafeUser(user: UserDocument): SafeUser {
  const { _id, name, email, phone, role, created_at } = user;
  return { _id, name, email, phone, role, created_at };
}
