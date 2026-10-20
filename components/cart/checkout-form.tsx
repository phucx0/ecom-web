"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { checkoutSchema } from "@/lib/orders/validation";
import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CheckoutFields={customer:{name:string;phone:string};shipping_address:{line1:string;city:string};payment_method:"COD"};
export function CheckoutForm({name,phone}:{name:string;phone:string}){
 const{items,clear}=useCart(),router=useRouter(),[error,setError]=useState("");
 const form=useForm<CheckoutFields>({defaultValues:{customer:{name,phone},shipping_address:{line1:"",city:""},payment_method:"COD"}});
 async function submit(fields:CheckoutFields){
  setError("");
  const payload={...fields,items:items.map(item=>({product_id:item.product_id,quantity:item.quantity}))};
  const parsed=checkoutSchema.safeParse(payload);
  if(!parsed.success){setError(parsed.error.issues[0]?.message??"Thông tin đặt hàng không hợp lệ.");return}
  const response=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(parsed.data)});
  const body=await response.json();
  if(!response.ok){setError(body.error?.message||"Không thể đặt hàng.");return}
  clear();router.push(`/checkout/success?order=${encodeURIComponent(body.data._id)}`);
 }
 return <form onSubmit={form.handleSubmit(submit)} className="mx-auto max-w-2xl space-y-5" noValidate><h1 className="text-3xl font-bold">Thanh toán COD</h1><FormField label="Họ tên" error={form.formState.errors.customer?.name?.message}><Input {...form.register("customer.name",{required:"Vui lòng nhập họ tên."})}/></FormField><FormField label="Số điện thoại" error={form.formState.errors.customer?.phone?.message}><Input {...form.register("customer.phone",{required:"Vui lòng nhập số điện thoại."})}/></FormField><FormField label="Địa chỉ" error={form.formState.errors.shipping_address?.line1?.message}><Input {...form.register("shipping_address.line1",{required:"Vui lòng nhập địa chỉ."})}/></FormField><FormField label="Tỉnh / thành phố" error={form.formState.errors.shipping_address?.city?.message}><Input {...form.register("shipping_address.city",{required:"Vui lòng nhập tỉnh/thành phố."})}/></FormField><div className="rounded-lg bg-slate-100 p-4"><strong>Thanh toán khi nhận hàng (COD)</strong><p className="text-sm text-slate-600">Máy chủ sẽ kiểm tra lại giá và tồn kho.</p></div><p className="text-sm text-slate-600">Giỏ hàng có {items.reduce((sum,item)=>sum+item.quantity,0)} sản phẩm.</p>{error&&<p role="alert" className="rounded-md bg-red-50 p-3 text-red-700">{error}</p>}<Button className="w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting?"Đang tạo đơn...":"Đặt hàng"}</Button></form>;
}
function FormField({label,error,children}:{label:string;error?:string;children:React.ReactNode}){return <div className="space-y-2"><Label>{label}</Label>{children}{error&&<p className="text-sm text-red-700">{error}</p>}</div>}
