"use client";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Price } from "@/components/catalog/price";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderSummary } from "./order-summary";
export function CartPage() {
  const {items,setQuantity,remove,add,ready,count}=useCart();
  if(!ready) return <div aria-busy="true" role="status"><span className="sr-only">Đang tải giỏ hàng…</span><Skeleton className="h-60 w-full" /></div>;
  const subtotal=items.reduce((sum,item)=>sum+item.price*item.quantity,0);
  function removeItem(item: typeof items[number]) {
    remove(item.product_id);
    toast("Đã xóa sản phẩm khỏi giỏ.", {action:{label:"Hoàn tác",onClick:()=>add(item,item.quantity)}});
  }
  return <div className="space-y-6"><Breadcrumbs items={[{label:"Trang chủ",href:"/"},{label:"Giỏ hàng"}]} /><div><h1 className="text-3xl font-semibold tracking-tight">Giỏ hàng của bạn</h1><p className="mt-2 text-muted-foreground">{count} sản phẩm đã chọn</p></div>{items.length?<div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]"><div className="min-w-0 space-y-3">{items.map(item=><article key={item.product_id} className="panel grid min-w-0 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5"><div className="min-w-0"><Link href={`/products/${item.slug}`} className="font-semibold hover:text-primary">{item.name}</Link><p className="mt-1 text-sm text-muted-foreground">Đơn giá: <Price amount={item.price} /></p></div><Price amount={item.price*item.quantity} className="text-primary sm:text-right" /><div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-2"><QuantitySelector label={`Số lượng ${item.name}`} value={item.quantity} max={item.stock} onChange={n=>setQuantity(item.product_id,n)} /><Button variant="ghost" aria-label={`Xóa ${item.name} khỏi giỏ hàng`} onClick={()=>removeItem(item)}><Trash2 className="size-4" aria-hidden="true" />Xóa</Button></div></article>)}<Button asChild variant="ghost"><Link href="/products">Tiếp tục mua sắm</Link></Button></div><OrderSummary subtotal={subtotal} count={count}><Button asChild className="w-full" size="lg"><Link href="/checkout">Tiến hành đặt hàng</Link></Button></OrderSummary></div>:<EmptyState title="Giỏ hàng đang trống" description="Khám phá sản phẩm và thêm những lựa chọn bạn thích vào giỏ." href="/products" label="Khám phá sản phẩm" />}</div>;
}
