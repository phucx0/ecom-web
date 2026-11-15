import Link from "next/link";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/catalog/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { listCategories, listProducts } from "@/lib/catalog/repository";
type Query = { q?: string; category?: string; sort?: string; page?: string };
function href(p: Query, page: number) { const q = new URLSearchParams(); Object.entries({...p,page:String(page)}).forEach(([k,v])=>v&&q.set(k,v)); return `?${q}`; }
export const metadata = { title: "Sản phẩm" };
export default async function ProductsPage({searchParams}:{searchParams:Promise<Query>}) {
  const p=await searchParams, [found,categories]=await Promise.all([listProducts({search:p.q,categoryId:p.category}),listCategories()]);
  const sorted=[...found];
  if(p.sort==="price-asc") sorted.sort((a,b)=>a.price-b.price);
  else if(p.sort==="price-desc") sorted.sort((a,b)=>b.price-a.price);
  else if(p.sort==="name") sorted.sort((a,b)=>a.name.localeCompare(b.name,"vi"));
  const size=12,pages=Math.max(1,Math.ceil(sorted.length/size)),page=Math.min(pages,Math.max(1,Math.floor(Number(p.page)||1))),products=sorted.slice((page-1)*size,page*size);
  const category=categories.find(c=>c._id===p.category);
  return <div className="space-y-6"><Breadcrumbs items={[{label:"Trang chủ",href:"/"},{label:"Sản phẩm"}]} /><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{category?.name || "Khám phá sản phẩm"}</h1><p className="mt-2 text-muted-foreground">{p.q ? `Kết quả tìm kiếm cho “${p.q}”` : "Chọn sản phẩm phù hợp với nhu cầu của bạn."}</p></div><span className="text-sm text-muted-foreground">{sorted.length} sản phẩm</span></div>
    <form className="panel grid items-end gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,220px)_minmax(0,190px)_auto]" aria-label="Tìm kiếm và lọc sản phẩm"><div className="space-y-1.5"><Label htmlFor="catalog-search">Tìm kiếm</Label><Input id="catalog-search" type="search" name="q" defaultValue={p.q} placeholder="Tên hoặc mô tả sản phẩm…" autoComplete="off" /></div><div className="space-y-1.5"><Label htmlFor="catalog-category">Danh mục</Label><Select id="catalog-category" name="category" defaultValue={p.category||""}><option value="">Tất cả danh mục</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</Select></div><div className="space-y-1.5"><Label htmlFor="catalog-sort">Sắp xếp</Label><Select id="catalog-sort" name="sort" defaultValue={p.sort||"newest"}><option value="newest">Mới nhất</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option><option value="name">Tên A–Z</option></Select></div><Button type="submit"><Search className="size-4" aria-hidden="true" />Áp dụng</Button></form>
    {(p.q||p.category) && <Link href="/products" className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">Xóa bộ lọc</Link>}
    {products.length ? <><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{products.map((product,index)=><ProductCard key={product._id} product={product} priority={index<4} category={categories.find(c=>c._id===product.category_id)?.name} />)}</div><nav aria-label="Phân trang sản phẩm" className="flex flex-wrap items-center justify-between gap-4 border-t pt-5"><p className="text-sm text-muted-foreground">Hiển thị {(page-1)*size+1}–{Math.min(page*size,sorted.length)} / {sorted.length}</p><div className="flex items-center gap-2">{page>1 ? <Button asChild variant="outline"><Link href={href(p,page-1)}>Trước</Link></Button> : <Button variant="outline" disabled>Trước</Button>}<span className="px-1 text-sm tabular-nums">{page} / {pages}</span>{page<pages ? <Button asChild variant="outline"><Link href={href(p,page+1)}>Sau</Link></Button> : <Button variant="outline" disabled>Sau</Button>}</div></nav></> : <EmptyState title="Không tìm thấy sản phẩm" description="Thử từ khóa ngắn hơn hoặc chọn một danh mục khác." href="/products" label="Xem tất cả sản phẩm" />}</div>;
}
