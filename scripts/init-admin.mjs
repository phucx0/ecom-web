import { createHash } from "node:crypto";
import { hash } from "bcryptjs";

const required = [
  "COUCHDB_URL",
  "COUCHDB_DATABASE",
  "COUCHDB_USERNAME",
  "COUCHDB_PASSWORD",
  "ADMIN_EMAIL",
  "ADMIN_NAME",
  "ADMIN_PASSWORD",
];
for (const key of required)
  if (!process.env[key]) throw new Error(`Thiếu biến môi trường ${key}.`);
if (process.env.ADMIN_PASSWORD.length < 12)
  throw new Error("ADMIN_PASSWORD phải có ít nhất 12 ký tự.");
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const id = `user:email:${createHash("sha256").update(email).digest("hex")}`;
const base = `${process.env.COUCHDB_URL.replace(/\/$/, "")}/${encodeURIComponent(process.env.COUCHDB_DATABASE)}`;
const authorization = `Basic ${Buffer.from(`${process.env.COUCHDB_USERNAME}:${process.env.COUCHDB_PASSWORD}`).toString("base64")}`;
const existing = await fetch(`${base}/${encodeURIComponent(id)}`, {
  headers: { authorization },
});
if (existing.ok) throw new Error("Admin đã tồn tại; script không ghi đè.");
if (existing.status !== 404)
  throw new Error(`Không thể kiểm tra Admin (HTTP ${existing.status}).`);
const document = {
  _id: id,
  type: "user",
  name: process.env.ADMIN_NAME.trim(),
  email,
  phone: "",
  role: "admin",
  password_hash: await hash(process.env.ADMIN_PASSWORD, 12),
  account_status: "active",
  created_at: new Date().toISOString(),
};
const response = await fetch(`${base}/${encodeURIComponent(id)}`, {
  method: "PUT",
  headers: { authorization, "content-type": "application/json" },
  body: JSON.stringify(document),
});
if (!response.ok)
  throw new Error(`Không thể tạo Admin (HTTP ${response.status}).`);
console.log("Đã tạo tài khoản Admin an toàn. Không ghi mật khẩu ra log.");
