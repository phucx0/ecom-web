import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = { title: { default: "Retail Shop — Mua sắm mỗi ngày", template: "%s | Retail Shop" }, description: "Khám phá sản phẩm, lựa chọn theo nhu cầu và theo dõi đơn hàng tại Retail Shop." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><a className="skip-link" href="#main-content">Đến nội dung chính</a><CartProvider>{children}</CartProvider><Toaster richColors closeButton position="top-right" /></body></html>;
}
