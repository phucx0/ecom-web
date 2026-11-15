"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientRequest } from "@/lib/client-request";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
export function CancelOrderButton({id,rev}:{id:string;rev:string}) {
  const router=useRouter();
  async function cancel() {await clientRequest(`/api/orders/${encodeURIComponent(id)}/cancel`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({_rev:rev})});toast.success("Đã hủy đơn hàng.");router.refresh();}
  return <ConfirmDialog title="Hủy đơn hàng?" description="Đơn sẽ được hủy. Tồn kho đã giữ sẽ được hoàn lại theo trạng thái đơn. Bạn không thể hoàn tác." triggerLabel="Hủy đơn" confirmLabel="Xác nhận hủy" destructive onConfirm={cancel} />;
}
