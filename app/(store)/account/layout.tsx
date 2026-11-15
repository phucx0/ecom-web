import { requireUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/auth/logout-button";
import { SectionNav } from "@/components/shared/section-nav";
export default async function AccountLayout({children}:{children:React.ReactNode}) {
  const user=await requireUser();
  return <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="panel min-w-0 p-4"><div className="mb-4 border-b pb-4"><div className="mb-3 flex size-11 items-center justify-center rounded-full bg-subtle text-lg font-semibold text-primary" aria-hidden="true">{user.name.slice(0,1)}</div><p className="font-semibold">{user.name}</p><p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p></div><SectionNav label="Điều hướng tài khoản" items={[{href:"/account/profile",label:"Thông tin cá nhân"},{href:"/account/orders",label:"Đơn hàng của tôi"}]} /><div className="mt-4 border-t pt-4"><LogoutButton /></div></aside><section className="min-w-0">{children}</section></div>;
}
