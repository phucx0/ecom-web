import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <main className="mx-auto max-w-xl px-4 py-20 text-center"><p className="text-sm font-semibold text-emerald-700">404</p><h1 className="mt-3 text-3xl font-bold">Không tìm thấy trang</h1><Button asChild className="mt-6"><Link href="/">Về trang chủ</Link></Button></main>; }
