import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { currentUser } from "@/lib/auth/session";
export default async function Page() {
  const user=await currentUser();
  if(!user) redirect("/login?returnTo=%2Fcheckout");
  return <div className="space-y-7"><nav aria-label="Tiến trình đặt hàng"><ol className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm"><li><Link href="/cart" className="block rounded-lg bg-subtle p-3 text-primary hover:underline">1. Giỏ hàng</Link></li><li aria-current="step" className="rounded-lg bg-primary p-3 font-semibold text-white">2. Nhận hàng</li><li className="rounded-lg border p-3 text-muted-foreground">3. Hoàn tất</li></ol></nav><CheckoutForm name={user.name} phone={user.phone} /></div>;
}
