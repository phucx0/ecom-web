import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { currentUser } from "@/lib/auth/session";
import { CartLink } from "@/components/cart/cart-link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionNav } from "@/components/shared/section-nav";
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return <div className="flex min-h-screen flex-col">
    <div className="bg-primary px-4 py-2 text-center text-xs text-white sm:text-sm">Miễn phí vận chuyển cho đơn từ 500.000 ₫ · Thanh toán khi nhận hàng</div>
    <header className="border-b bg-surface">
      <div className="shop-container flex flex-wrap items-center gap-x-5 gap-y-4 py-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight"><span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white"><ShoppingBag className="size-5" aria-hidden="true" /></span>Retail<span className="font-normal text-primary">Shop</span></Link>
        <form action="/products" role="search" className="order-3 flex w-full gap-2 sm:order-none sm:ml-3 sm:w-auto sm:flex-1"><label className="sr-only" htmlFor="header-search">Tìm sản phẩm</label><Input id="header-search" type="search" name="q" placeholder="Bạn đang tìm sản phẩm gì…" autoComplete="off" /><Button type="submit" variant="outline" aria-label="Tìm kiếm"><Search className="size-5" aria-hidden="true" /></Button></form>
        <div className="ml-auto flex items-center gap-2 sm:ml-0"><Link href={user ? "/account" : "/login"} className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm hover:bg-subtle"><UserRound className="size-5 shrink-0" aria-hidden="true" /><span className="max-w-28 truncate">{user ? user.name : "Đăng nhập"}</span></Link><CartLink /></div>
      </div>
      <div className="border-t"><div className="shop-container py-1"><SectionNav label="Điều hướng cửa hàng" items={[{href:"/",label:"Trang chủ",exact:true},{href:"/products",label:"Sản phẩm"},...(user ? [{href:"/account/orders",label:"Đơn hàng của tôi"}] : []),...(user?.role === "admin" ? [{href:"/admin",label:"Quản trị"}] : [])]} /></div></div>
    </header>
    <main id="main-content" tabIndex={-1} className="shop-container flex-1 py-8 sm:py-10">{children}</main>
    <footer className="mt-8 border-t bg-surface"><div className="shop-container grid gap-6 py-8 sm:grid-cols-[1fr_auto_auto] sm:gap-12"><div><Link href="/" className="text-lg font-bold">Retail Shop</Link><p className="mt-2 max-w-sm text-sm text-muted-foreground">Chọn sản phẩm phù hợp cho nhu cầu mỗi ngày.</p></div><nav aria-label="Liên kết cuối trang" className="flex flex-col gap-3 text-sm"><Link className="hover:text-primary" href="/products">Khám phá sản phẩm</Link><Link className="hover:text-primary" href="/cart">Giỏ hàng của bạn</Link></nav><div className="text-sm text-muted-foreground"><p className="font-medium text-foreground">Mua sắm thuận tiện</p><p className="mt-2">Thanh toán khi nhận hàng (COD)</p><Link href="/account/orders" className="mt-2 inline-block hover:text-primary">Theo dõi đơn hàng</Link></div></div></footer>
  </div>;
}
