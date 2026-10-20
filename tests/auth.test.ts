import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { createSessionToken, verifySessionToken } from "../lib/auth/token";
import { loginSchema, registerSchema } from "../lib/auth/validation";

process.env.SESSION_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
describe("auth validation", () => {
  it("chuẩn hóa email và chấp nhận mật khẩu mạnh", () => { const value = registerSchema.parse({ name: "Nguyễn Văn A", email: " TEST@Example.COM ", phone: "0901234567", password: "SecurePass1" }); expect(value.email).toBe("test@example.com"); });
  it("từ chối mật khẩu yếu", () => { expect(registerSchema.safeParse({ name: "Nguyễn Văn A", email: "a@example.com", phone: "0901234567", password: "weak" }).success).toBe(false); });
  it("không tiết lộ yêu cầu mật khẩu ở login validation", () => { expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(false); });
});
describe("session token", () => {
  it("ký và xác minh session", async () => { const token = await createSessionToken({ userId: "user:test", role: "customer", email: "test@example.com" }); expect(await verifySessionToken(token)).toMatchObject({ userId: "user:test", role: "customer" }); });
  it("từ chối token giả", async () => { expect(await verifySessionToken("invalid.token.value")).toBeNull(); });
  it("từ chối session hết hạn", async () => { const token = await new SignJWT({ userId: "user:test", role: "customer", email: "test@example.com" }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("0s").sign(new TextEncoder().encode(process.env.SESSION_SECRET)); expect(await verifySessionToken(token)).toBeNull(); });
});
