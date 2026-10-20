import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function RegisterPage() { return <div className="mx-auto max-w-md"><Card><CardHeader><CardTitle>Tạo tài khoản</CardTitle><p className="text-sm text-slate-600">Thông tin được kiểm tra và mật khẩu được hash trước khi lưu.</p></CardHeader><CardContent><Suspense fallback={<p>Đang tải...</p>}><AuthForm mode="register" /></Suspense></CardContent></Card></div>; }
