import { z } from "zod";

const email = z.string().trim().email("Email không hợp lệ.").max(254).transform((value) => value.toLowerCase());
const password = z.string().min(10, "Mật khẩu phải có ít nhất 10 ký tự.").max(128).regex(/[a-z]/, "Mật khẩu cần chữ thường.").regex(/[A-Z]/, "Mật khẩu cần chữ hoa.").regex(/[0-9]/, "Mật khẩu cần chữ số.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự.").max(100),
  email,
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ.").max(20).regex(/^[0-9+(). -]+$/, "Số điện thoại không hợp lệ."),
  password,
});

export const loginSchema = z.object({ email, password: z.string().min(1, "Vui lòng nhập mật khẩu.").max(128) });
export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
