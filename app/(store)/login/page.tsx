import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function LoginPage() { return <div className="mx-auto max-w-md"><Card><CardHeader><CardTitle>Đăng nhập</CardTitle><p className="text-sm text-slate-600">Sử dụng tài khoản đã có mật khẩu bảo mật.</p></CardHeader><CardContent><Suspense fallback={<p>Đang tải...</p>}><AuthForm mode="login" /></Suspense></CardContent></Card></div>; }
