"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { CategoryDocument } from "@/lib/catalog/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";

async function request(url:string,init?:RequestInit){const response=await fetch(url,{...init,headers:{"Content-Type":"application/json",...init?.headers}});const body=await response.json();if(!response.ok)throw new Error(body.error?.message||"Không thể xử lý yêu cầu.");return body.data}

export function CategoryManager({initial}:{initial:CategoryDocument[]}){
 const [items,setItems]=useState(initial),[editing,setEditing]=useState<CategoryDocument|null>(null),[creating,setCreating]=useState(false);
 async function reload(){setItems(await request("/api/admin/categories"))}
 async function remove(item:CategoryDocument){try{await request(`/api/admin/categories/${encodeURIComponent(item._id)}?rev=${encodeURIComponent(item._rev||"")}`,{method:"DELETE"});await reload();toast.success("Đã xóa danh mục.")}catch(error){toast.error((error as Error).message)}}
 return <div className="space-y-5">
  <div className="flex justify-end"><Button onClick={()=>{setCreating(true);setEditing(null)}}><Plus className="mr-2 size-4"/>Thêm danh mục</Button></div>
  {(creating||editing)&&<form onSubmit={async event=>{event.preventDefault();const form=new FormData(event.currentTarget);try{await request(editing?`/api/admin/categories/${encodeURIComponent(editing._id)}`:"/api/admin/categories",{method:editing?"PATCH":"POST",body:JSON.stringify({_rev:editing?._rev,name:form.get("name"),slug:form.get("slug"),is_active:form.get("is_active")==="on"})});await reload();setEditing(null);setCreating(false);toast.success("Đã lưu danh mục.")}catch(error){toast.error((error as Error).message)}}} className="rounded-xl border bg-white p-5">
   <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{editing?"Chỉnh sửa":"Thêm"} danh mục</h2><Button type="button" variant="ghost" size="sm" onClick={()=>{setEditing(null);setCreating(false)}}><X className="size-4"/></Button></div>
   <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto]"><div className="space-y-2"><Label htmlFor="name">Tên</Label><Input id="name" name="name" defaultValue={editing?.name} required/></div><div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" defaultValue={editing?.slug} required/></div><label className="flex items-end gap-2 pb-2"><input type="checkbox" name="is_active" defaultChecked={editing?.is_active??true}/> Hoạt động</label><Button className="self-end">Lưu</Button></div>
  </form>}
  <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Tên</th><th className="p-4">Slug</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody>{items.map(item=><tr key={item._id} className="border-t"><td className="p-4 font-medium">{item.name}</td><td className="p-4 text-slate-500">{item.slug}</td><td className="p-4"><StatusBadge status={item.is_active?"active":"disabled"}/></td><td className="p-4"><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={()=>{setEditing(item);setCreating(false)}} aria-label={`Sửa ${item.name}`}><Pencil className="size-4"/></Button><ConfirmDialog title="Xóa danh mục?" description="Chỉ nên xóa danh mục không còn được sản phẩm sử dụng." confirmLabel="Xóa" onConfirm={()=>remove(item)} trigger={<Button variant="outline" size="sm" aria-label={`Xóa ${item.name}`}><Trash2 className="size-4 text-red-700"/></Button>}/></div></td></tr>)}</tbody></table></div>
 </div>
}
