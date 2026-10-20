import Link from "next/link";
import { Database, PackageCheck, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const foundations = [{ icon: Database, title: "CouchDB thật", text: "Kết nối chỉ qua server và kiểm tra bằng API health." }, { icon: PackageCheck, title: "Đơn hàng rõ ràng", text: "Schema và lifecycle đã được đặc tả cho các phase tiếp theo." }, { icon: Truck, title: "Theo dõi giao hàng", text: "Nền tảng sẵn sàng mở rộng mà chưa triển khai nghiệp vụ sớm." }];
export default function HomePage() {
  return <div className="space-y-12"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><PageHeader eyebrow="Cửa hàng trực tuyến" title="Sản phẩm từ dữ liệu CouchDB" description="Khám phá danh mục, tìm kiếm và xem chi tiết sản phẩm đang hoạt động." /><Button asChild size="lg"><Link href="/products">Xem sản phẩm</Link></Button></div><section className="grid gap-4 md:grid-cols-3" aria-label="Nền tảng hệ thống">{foundations.map(({ icon: Icon, title, text }) => <Card key={title}><CardHeader><Icon className="mb-3 size-6 text-emerald-700" aria-hidden="true" /><CardTitle>{title}</CardTitle></CardHeader><CardContent className="text-sm leading-6 text-slate-600">{text}</CardContent></Card>)}</section></div>;
}
