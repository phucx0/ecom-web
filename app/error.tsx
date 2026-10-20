"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error(error); }, [error]); return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Đã xảy ra lỗi</h1><p className="mt-3 text-slate-600">Không thể tải nội dung. Vui lòng thử lại.</p><Button className="mt-6" onClick={reset}>Thử lại</Button></main>; }
