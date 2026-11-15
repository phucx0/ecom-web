"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientRequest } from "@/lib/client-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function ProfileForm({name,email,phone}:{name:string;email:string;phone:string}) {
  const router=useRouter(),[error,setError]=useState(""),[saving,setSaving]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setSaving(true);setError("");const data=new FormData(e.currentTarget);
    try {await clientRequest("/api/account/profile",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:data.get("name"),phone:data.get("phone")})});toast.success("Đã cập nhật thông tin cá nhân.");router.refresh();}
    catch(e){setError((e as Error).message);}finally{setSaving(false);}
  }
  return <form onSubmit={submit} className="panel space-y-5 p-5 sm:p-6"><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="profile-name">Họ và tên</Label><Input id="profile-name" name="name" autoComplete="name" minLength={2} maxLength={100} defaultValue={name} required /></div><div className="space-y-2"><Label htmlFor="profile-phone">Số điện thoại</Label><Input id="profile-phone" name="phone" type="tel" autoComplete="tel" minLength={8} maxLength={20} defaultValue={phone} required /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-email">Email đăng nhập</Label><Input id="profile-email" name="email" value={email} readOnly aria-describedby="email-hint" className="bg-slate-50 text-muted-foreground" /><p id="email-hint" className="text-xs text-muted-foreground">Email đăng nhập không thể thay đổi tại đây.</p></div></div>{error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</p>}<div className="border-t pt-5"><Button disabled={saving}>{saving?"Đang lưu…":"Lưu thay đổi"}</Button></div></form>;
}
