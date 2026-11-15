import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";
import { listCategories, listProducts } from "@/lib/catalog/repository";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Price } from "@/components/catalog/price";
export const dynamic="force-dynamic";
type Query={q?:string;category?:string;page?:string};
function pageHref(query:Query,page:number){const params=new URLSearchParams();Object.entries({...query,page:String(page)}).forEach(([key,value])=>value&&params.set(key,value));return `?${params}`;}
export default async function Page({searchParams}:{searchParams:Promise<Query>}) {
  const p=await searchParams,[all,categories]=await Promise.all([listProducts({includeInactive:true,search:p.q,categoryId:p.category}),listCategories(true)]);
  const size=10,pages=Math.max(1,Math.ceil(all.length/size)),page=Math.min(pages,Math.max(1,Math.floor(Number(p.page)||1))),products=all.slice((page-1)*size,page*size);
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><PageHeader title="Sản phẩm" description={`${all.length} sản phẩm phù hợp. Quản lý giá, tồn kho và trạng thái hiển thị.`} /><Button asChild><Link href="/admin/products/new"><Plus className="size-4" aria-hidden="true" />Thêm sản phẩm</Link></Button></div><form className="panel grid items-end gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)_auto]"><div className="space-y-1.5"><Label htmlFor="admin-search">Tìm sản phẩm</Label><Input id="admin-search" name="q" type="search" defaultValue={p.q} placeholder="Tên hoặc mô tả…" /></div><div className="space-y-1.5"><Label htmlFor="admin-category">Danh mục</Label><Select id="admin-category" name="category" defaultValue={p.category||""}><option value="">Tất cả danh mục</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</Select></div><Button><Search className="size-4" aria-hidden="true" />Lọc</Button></form>
    {products.length?<><div className="panel overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm" aria-label="Danh sách sản phẩm"><thead className="bg-subtle"><tr>{["Sản phẩm","Giá bán","Tồn kho","Trạng thái","Thao tác"].map(label=><th key={label} scope="col" className="p-4">{label}</th>)}</tr></thead><tbody>{products.map(product=><tr key={product._id} className="border-t"><td className="max-w-xs p-4"><p className="font-semibold">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{categories.find(c=>c._id===product.category_id)?.name||product.category_id}</p></td><td className="p-4"><Price amount={product.price} /></td><td className="p-4 tabular-nums">{product.stock}</td><td className="p-4"><StatusBadge status={product.is_active?"active":"disabled"} /></td><td className="p-4"><Button asChild size="sm" variant="outline"><Link href={`/admin/products/${encodeURIComponent(product._id)}/edit`} aria-label={`Chỉnh sửa ${product.name}`}><Pencil className="size-4" aria-hidden="true" />Sửa</Link></Button></td></tr>)}</tbody></table></div><nav aria-label="Phân trang sản phẩm" className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>Trang {page} / {pages}</span><div className="flex gap-2">{page>1?<Button asChild variant="outline"><Link href={pageHref(p,page-1)}>Trước</Link></Button>:<Button disabled variant="outline">Trước</Button>}{page<pages?<Button asChild variant="outline"><Link href={pageHref(p,page+1)}>Sau</Link></Button>:<Button disabled variant="outline">Sau</Button>}</div></nav></>:<EmptyState title="Không có sản phẩm" description="Thử thay đổi bộ lọc hoặc tạo sản phẩm mới." href="/admin/products/new" label="Thêm sản phẩm" />}</div>;
}
