import Link from "next/link";
import { Store, ShoppingBag } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { Drawer } from "@/components/ui/drawer";
export default async function Layout({children}:{children:React.ReactNode}) {
  const user=await requireUser("admin");
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[232px_minmax(0,1fr)]"><aside className="min-w-0 border-b bg-surface p-4 lg:border-r lg:border-b-0 lg:p-5"><Link href="/admin" className="flex min-h-11 items-center gap-2 px-2 text-lg font-bold"><ShoppingBag className="size-6 text-primary" aria-hidden="true" />Retail Admin</Link><div className="mt-6 hidden lg:block"><AdminNav /></div><div className="mt-3 lg:hidden"><Drawer title="Điều hướng quản trị"><AdminNav/><div className="mt-5 border-t pt-5"><LogoutButton/></div></Drawer></div><div className="mt-6 hidden border-t pt-5 lg:block"><p className="truncate px-2 text-sm font-medium">{user.name}</p><Link href="/" className="my-3 flex min-h-11 items-center gap-2 px-2 text-sm text-muted-foreground hover:text-primary"><Store className="size-4" aria-hidden="true" />Về cửa hàng</Link><LogoutButton /></div></aside><div className="min-w-0"><header className="flex flex-wrap items-center justify-between gap-3 border-b bg-surface px-4 py-3 sm:px-8"><p className="text-sm font-medium">Quản lý cửa hàng</p><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-primary hover:underline"><Store className="size-4" aria-hidden="true" />Xem cửa hàng</Link></header><main id="main-content" tabIndex={-1} className="mx-auto min-w-0 max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
