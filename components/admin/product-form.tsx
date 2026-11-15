"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CategoryDocument,ProductDocument } from "@/lib/catalog/types";
import { clientRequest } from "@/lib/client-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
export function ProductForm({categories,product}:{categories:CategoryDocument[];product?:ProductDocument}) {
  const router=useRouter(),[error,setError]=useState(""),[saving,setSaving]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>) {
    e.preventDefault();setSaving(true);setError("");
    const f=new FormData(e.currentTarget),body={_rev:product?._rev,name:f.get("name"),slug:f.get("slug"),category_id:f.get("category_id"),price:Number(f.get("price")),stock:Number(f.get("stock")),description:f.get("description"),images:String(f.get("images")||"").split("\n").map(x=>x.trim()).filter(Boolean),is_active:f.get("is_active")==="on"};
    try {await clientRequest(product?`/api/admin/products/${encodeURIComponent(product._id)}`:"/api/admin/products",{method:product?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});toast.success(product?"Đã cập nhật sản phẩm.":"Đã tạo sản phẩm.");router.push("/admin/products");router.refresh();}
    catch(e){setError((e as Error).message);}finally{setSaving(false);}
  }
  return <form onSubmit={submit} className="panel space-y-6 p-5 sm:p-6"><fieldset disabled={saving} className="grid min-w-0 gap-5 sm:grid-cols-2"><legend className="mb-5 text-lg font-semibold">Thông tin sản phẩm</legend><Field label="Tên sản phẩm" name="name" defaultValue={product?.name} required minLength={2} maxLength={160} /><Field label="Đường dẫn (slug)" name="slug" defaultValue={product?.slug} required minLength={2} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" /><div className="space-y-2"><Label htmlFor="category_id">Danh mục</Label><Select id="category_id" name="category_id" defaultValue={product?.category_id||""} required><option value="" disabled>Chọn danh mục</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}{!c.is_active?" (đang ẩn)":""}</option>)}</Select>{!categories.length&&<Link href="/admin/categories" className="text-sm text-primary underline">Tạo danh mục trước khi thêm sản phẩm</Link>}</div><Field label="Giá bán (VND)" name="price" type="number" min="0" step="1" defaultValue={product?.price} required /><Field label="Số lượng tồn kho" name="stock" type="number" min="0" step="1" defaultValue={product?.stock} required /><label className="flex min-h-11 items-center gap-3 self-end"><input type="checkbox" name="is_active" className="size-4 accent-emerald-800" defaultChecked={product?.is_active??true} />Hiển thị tại cửa hàng</label><div className="space-y-2 sm:col-span-2"><Label htmlFor="description">Mô tả sản phẩm</Label><Textarea id="description" name="description" defaultValue={product?.description} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="images">Đường dẫn ảnh</Label><Textarea id="images" name="images" defaultValue={product?.images.join("\n")} aria-describedby="images-hint" /><p id="images-hint" className="text-xs text-muted-foreground">Mỗi dòng một URL ảnh. Có thể để trống nếu chưa có hình.</p></div></fieldset>{error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</p>}<div className="flex flex-wrap gap-3 border-t pt-5"><Button disabled={saving||!categories.length}>{saving?"Đang lưu…":"Lưu sản phẩm"}</Button><Button type="button" disabled={saving} variant="outline" onClick={()=>router.back()}>Quay lại</Button></div></form>;
}
function Field({label,name,...props}:{label:string;name:string}&React.ComponentProps<typeof Input>){return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} {...props} /></div>;}
