import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata={title:"Đăng ký"};
export default function RegisterPage() {return <div className="mx-auto max-w-md py-2 sm:py-6"><div className="panel p-6 sm:p-8"><h1 className="text-2xl font-semibold">Tạo tài khoản của bạn</h1><p className="mb-7 mt-3 text-sm leading-6 text-muted-foreground">Lưu thông tin liên hệ và theo dõi đơn hàng tại một nơi.</p><Suspense fallback={<p role="status">Đang tải…</p>}><AuthForm mode="register" /></Suspense></div></div>;}
