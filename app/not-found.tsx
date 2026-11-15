import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() { return <main id="main-content" tabIndex={-1} className="mx-auto max-w-xl px-4 py-20 text-center"><p className="text-sm font-semibold text-primary">404</p><h1 className="mt-3 text-3xl font-semibold">Không tìm thấy trang</h1><p className="mt-3 text-muted-foreground">Đường dẫn có thể đã thay đổi. Quay về cửa hàng để tiếp tục mua sắm.</p><Button asChild className="mt-6"><Link href="/">Về trang chủ</Link></Button></main>; }
