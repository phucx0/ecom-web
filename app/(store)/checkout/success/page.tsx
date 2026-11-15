import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Price } from "@/components/catalog/price";
import { requireUser } from "@/lib/auth/session";
import { ManagementError, orderForUser } from "@/lib/orders/management";
export default async function Page({searchParams}:{searchParams:Promise<{order?:string}>}) {
  const user=await requireUser(),id=(await searchParams).order;
  if(!id) return <EmptyState title="Chưa có đơn hàng để hiển thị" description="Bạn có thể xem các đơn đã đặt trong tài khoản." href="/account/orders" label="Xem đơn hàng của tôi" />;
  let result;
  try { result=await orderForUser(id,user); } catch(e) {if(e instanceof ManagementError&&e.status===404)return <EmptyState title="Không tìm thấy đơn hàng" description="Kiểm tra lại đơn hàng trong tài khoản của bạn." href="/account/orders" label="Xem đơn hàng của tôi" />;throw e;}
  const order=result.order;
  const received=order.inventory_state==="reserved"&&order.status!=="failed"&&order.status!=="cancelled";
  return <div className="panel mx-auto max-w-2xl p-6 text-center sm:p-9">{received&&<CheckCircle2 className="mx-auto size-14 text-primary" aria-hidden="true" />}<h1 className="mt-5 text-3xl font-semibold">{received?"Đơn hàng đã được ghi nhận":"Thông tin đơn hàng"}</h1><p className="mt-3 text-muted-foreground">Bạn có thể xem tiến trình xử lý và thông tin nhận hàng trong chi tiết đơn.</p><div className="my-6"><StatusBadge status={order.status} /></div><div className="rounded-xl bg-subtle p-4"><p className="break-all text-sm text-muted-foreground">Mã đơn: {order._id}</p><Price amount={order.total} className="mt-2 inline-block text-2xl text-primary" /></div><div className="mt-7 flex flex-wrap justify-center gap-3"><Button asChild><Link href={`/account/orders/${encodeURIComponent(order._id)}`}>Xem chi tiết đơn</Link></Button><Button asChild variant="outline"><Link href="/products">Tiếp tục mua sắm</Link></Button></div></div>;
}
