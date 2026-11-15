import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata={title:"Đăng nhập"};
export default function LoginPage() {return <div className="mx-auto max-w-md py-2 sm:py-6"><div className="panel p-6 sm:p-8"><h1 className="text-2xl font-semibold">Chào mừng bạn trở lại</h1><p className="mb-7 mt-3 text-sm leading-6 text-muted-foreground">Đăng nhập để đặt hàng và theo dõi những lựa chọn của bạn.</p><Suspense fallback={<p role="status">Đang tải…</p>}><AuthForm mode="login" /></Suspense></div></div>;}
