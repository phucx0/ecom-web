import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = { title: "Retail Shop", description: "Hệ thống quản lý bán lẻ với CouchDB" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><CartProvider>{children}</CartProvider><Toaster richColors position="top-right" /></body></html>;
}
