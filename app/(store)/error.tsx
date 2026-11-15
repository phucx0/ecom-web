"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function StoreError({reset}:{reset:()=>void}) {return <div className="panel mx-auto max-w-xl p-6 text-center sm:p-10"><h1 className="text-2xl font-semibold">Chưa thể tải nội dung</h1><p role="alert" className="mt-3 text-muted-foreground">Kết nối đang gặp sự cố. Thử tải lại hoặc quay về trang chủ.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Button onClick={reset}>Thử lại</Button><Button asChild variant="outline"><Link href="/">Về trang chủ</Link></Button></div></div>;}

