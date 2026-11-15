"use client";
import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { CategoryDocument } from "@/lib/catalog/types";
import { clientRequest } from "@/lib/client-request";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
export function CategoryManager({initial}:{initial:CategoryDocument[]}) {
  const [items,setItems]=useState(initial),[editing,setEditing]=useState<CategoryDocument|null>(null),[creating,setCreating]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function reload(){setItems(await clientRequest<CategoryDocument[]>("/api/admin/categories"));}
  async function remove(item:CategoryDocument){await clientRequest(`/api/admin/categories/${encodeURIComponent(item._id)}?rev=${encodeURIComponent(item._rev||"")}`,{method:"DELETE"});await reload();toast.success("Đã xóa danh mục.");}
  async function save(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);
    try {await clientRequest(editing?`/api/admin/categories/${encodeURIComponent(editing._id)}`:"/api/admin/categories",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({_rev:editing?._rev,name:form.get("name"),slug:form.get("slug"),is_active:form.get("is_active")==="on"})});await reload();setEditing(null);setCreating(false);toast.success("Đã lưu danh mục.");}
    catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  return <div className="space-y-5"><div className="flex justify-end"><Button disabled={busy} onClick={()=>{setCreating(true);setEditing(null);setError("");}}><Plus className="size-4" aria-hidden="true" />Thêm danh mục</Button></div>{(creating||editing)&&<form key={editing?._id||"new"} onSubmit={save} className="panel p-5"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{editing?"Chỉnh sửa danh mục":"Thêm danh mục"}</h2><Button type="button" aria-label="Đóng biểu mẫu danh mục" disabled={busy} variant="ghost" onClick={()=>{setEditing(null);setCreating(false);}}><X className="size-4" aria-hidden="true" /></Button></div><fieldset disabled={busy} className="grid min-w-0 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]"><div className="space-y-2"><Label htmlFor="category-name">Tên danh mục</Label><Input id="category-name" name="name" defaultValue={editing?.name} required minLength={2} maxLength={100} /></div><div className="space-y-2"><Label htmlFor="category-slug">Đường dẫn (slug)</Label><Input id="category-slug" name="slug" defaultValue={editing?.slug} required minLength={2} maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" /></div><label className="flex min-h-11 items-center gap-2"><input type="checkbox" name="is_active" defaultChecked={editing?.is_active??true} />Hoạt động</label><Button disabled={busy}>{busy?"Đang lưu…":"Lưu danh mục"}</Button></fieldset>{error&&<p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}</form>}
    {items.length?<div className="panel overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm" aria-label="Danh sách danh mục"><thead className="bg-subtle"><tr>{["Tên danh mục","Đường dẫn","Trạng thái","Thao tác"].map(label=><th scope="col" key={label} className="p-4">{label}</th>)}</tr></thead><tbody>{items.map(item=><tr key={item._id} className="border-t"><td className="p-4 font-medium">{item.name}</td><td className="p-4 text-muted-foreground">{item.slug}</td><td className="p-4"><StatusBadge status={item.is_active?"active":"disabled"} /></td><td className="p-4"><div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={()=>{setEditing(item);setCreating(false);setError("");}} aria-label={`Sửa ${item.name}`}><Pencil className="size-4" aria-hidden="true" /></Button><ConfirmDialog title="Xóa danh mục?" description="Danh mục đang được sản phẩm sử dụng sẽ không thể xóa." confirmLabel="Xóa danh mục" destructive onConfirm={()=>remove(item)} trigger={<Button variant="outline" disabled={busy} aria-label={`Xóa ${item.name}`}><Trash2 className="size-4 text-destructive" aria-hidden="true" /></Button>} /></div></td></tr>)}</tbody></table></div>:<EmptyState title="Chưa có danh mục" description="Thêm danh mục đầu tiên để tổ chức sản phẩm trong cửa hàng." />}</div>;
}
