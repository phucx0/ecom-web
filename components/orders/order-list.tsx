import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { OrderDocument } from "@/lib/orders/service";
import { formatDate } from "@/lib/format";
import { Price } from "@/components/catalog/price";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
export function OrderList({orders,basePath}:{orders:OrderDocument[];basePath:string}) {
  if(!orders.length) return <EmptyState title="Chưa có đơn hàng" description="Các đơn hàng sau khi đặt sẽ xuất hiện tại đây." href="/products" label="Khám phá sản phẩm" />;
  return <div className="space-y-3">{orders.map(order=><Link key={order._id} href={`${basePath}/${encodeURIComponent(order._id)}`} className="panel group block p-4 transition-colors hover:border-primary sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 flex-1 basis-48"><time dateTime={order.created_at} className="text-xs text-muted-foreground">{formatDate(order.created_at)}</time><h2 className="mt-2 line-clamp-2 text-base font-semibold group-hover:text-primary">{order.items.map(item=>item.name).join(", ")}</h2><p className="mt-2 text-sm text-muted-foreground">{order.items.reduce((s,i)=>s+i.quantity,0)} sản phẩm</p></div><div className="flex flex-wrap items-center gap-3"><StatusBadge status={order.status} /><ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" /></div></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3"><p className="max-w-full break-all text-xs text-muted-foreground">Mã đơn: {order._id}</p><Price amount={order.total} className="ml-auto text-primary" /></div></Link>)}</div>;
}
