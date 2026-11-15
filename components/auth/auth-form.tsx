"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/auth/validation";
import { clientRequest } from "@/lib/client-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function AuthForm({mode}:{mode:"login"|"register"}) {
  const router=useRouter(),params=useSearchParams(),[serverError,setServerError]=useState("");
  const form=useForm<LoginInput|RegisterInput>({resolver:zodResolver(mode==="login"?loginSchema:registerSchema),defaultValues:mode==="login"?{email:"",password:""}:{name:"",email:"",phone:"",password:""}});
  const errors=form.formState.errors as Record<string,{message?:string}>;
  async function submit(values:LoginInput|RegisterInput) {
    setServerError("");
    try {
      await clientRequest(`/api/auth/${mode}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
      const safeReturn=params.get("returnTo");
      router.push(safeReturn?.startsWith("/")&&!safeReturn.startsWith("//")?safeReturn:"/account");router.refresh();
    } catch(e) {setServerError((e as Error).message);}
  }
  const fields=[...(mode==="register"?[{key:"name",label:"Họ và tên",type:"text",complete:"name"},{key:"phone",label:"Số điện thoại",type:"tel",complete:"tel"}]:[]),{key:"email",label:"Email",type:"email",complete:"email"},{key:"password",label:"Mật khẩu",type:"password",complete:mode==="login"?"current-password":"new-password"}];
  const returnTo=params.get("returnTo");
  const otherHref=(mode==="login"?"/register":"/login")+(returnTo?`?returnTo=${encodeURIComponent(returnTo)}`:"");
  return <form onSubmit={form.handleSubmit(submit)} className="space-y-5" noValidate>{fields.map(field=><div key={field.key} className="space-y-2"><Label htmlFor={field.key}>{field.label}</Label><Input id={field.key} type={field.type} autoComplete={field.complete} spellCheck={field.key==="email"?false:undefined} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key]?`${field.key}-error`:field.key==="password"&&mode==="register"?"password-hint":undefined} {...form.register(field.key as keyof RegisterInput)} />{field.key==="password"&&mode==="register"&&<p id="password-hint" className="text-xs leading-5 text-muted-foreground">Ít nhất 10 ký tự, gồm chữ hoa, chữ thường và chữ số.</p>}{errors[field.key]&&<p id={`${field.key}-error`} className="text-sm text-destructive">{errors[field.key].message}</p>}</div>)}{serverError&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{serverError}</p>}<Button className="w-full" size="lg" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting?"Đang xử lý…":mode==="login"?"Đăng nhập":"Tạo tài khoản"}</Button><p className="text-center text-sm text-muted-foreground">{mode==="login"?"Chưa có tài khoản?":"Đã có tài khoản?"} <Link href={otherHref} className="font-semibold text-primary hover:underline">{mode==="login"?"Đăng ký":"Đăng nhập"}</Link></p></form>;
}
