"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { mode: "login" | "register" };
export function AuthForm({ mode }: Props) {
  const router = useRouter(); const params = useSearchParams(); const [serverError, setServerError] = useState("");
  const schema = mode === "login" ? loginSchema : registerSchema;
  const form = useForm<LoginInput | RegisterInput>({ resolver: zodResolver(schema), defaultValues: mode === "login" ? { email: "", password: "" } : { name: "", email: "", phone: "", password: "" } });
  async function submit(values: LoginInput | RegisterInput) { setServerError(""); const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const body = await response.json(); if (!response.ok) { setServerError(body.error?.message ?? "Không thể xử lý yêu cầu."); return; } const safeReturn = params.get("returnTo"); router.push(safeReturn?.startsWith("/") && !safeReturn.startsWith("//") ? safeReturn : "/account"); router.refresh(); }
  const errors = form.formState.errors as Record<string, { message?: string }>;
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
    {mode === "register" && <><div className="space-y-2"><Label htmlFor="name">Họ và tên</Label><Input id="name" autoComplete="name" {...form.register("name" as "email")} />{errors.name && <p className="text-sm text-red-700">{errors.name.message}</p>}</div><div className="space-y-2"><Label htmlFor="phone">Số điện thoại</Label><Input id="phone" autoComplete="tel" {...form.register("phone" as "email")} />{errors.phone && <p className="text-sm text-red-700">{errors.phone.message}</p>}</div></>}
    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" {...form.register("email")} />{errors.email && <p className="text-sm text-red-700">{errors.email.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="password">Mật khẩu</Label><Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} {...form.register("password")} />{errors.password && <p className="text-sm text-red-700">{errors.password.message}</p>}</div>
    {serverError && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{serverError}</p>}
    <Button className="w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</Button>
    <p className="text-center text-sm text-slate-600">{mode === "login" ? "Chưa có tài khoản?" : "Đã có tài khoản?"} <Link className="font-medium text-emerald-700 hover:underline" href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Đăng ký" : "Đăng nhập"}</Link></p>
  </form>;
}
