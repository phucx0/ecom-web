"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { clientRequest } from "@/lib/client-request";
import { Button } from "@/components/ui/button";
export function LogoutButton() {
  const router=useRouter(),[busy,setBusy]=useState(false);
  return <Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true);try{await clientRequest("/api/auth/logout",{method:"POST"});router.push("/");router.refresh();}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}}><LogOut className="size-4" aria-hidden="true" />{busy?"Đang đăng xuất…":"Đăng xuất"}</Button>;
}
