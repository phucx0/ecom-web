"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-provider";
export function CartLink() {
  const { count } = useCart();
  return <Link href="/cart" className="flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm hover:border-primary hover:bg-subtle" aria-label={`Giỏ hàng, ${count} sản phẩm`}><ShoppingBag className="size-5" aria-hidden="true" /><span className="hidden sm:inline">Giỏ hàng</span><span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white" aria-live="polite">{count}</span></Link>;
}
