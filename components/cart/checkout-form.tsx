"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { checkoutSchema } from "@/lib/orders/validation";
import { clientRequest } from "@/lib/client-request";
import { useCart } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummary } from "./order-summary";
import { Price } from "@/components/catalog/price";
type CheckoutFields={customer:{name:string;phone:string};shipping_address:{line1:string;city:string};payment_method:"COD"};
export function CheckoutForm({name,phone}:{name:string;phone:string}) {
  const {items,clear,ready,count}=useCart(),router=useRouter(),[error,setError]=useState(""),errorRef=useRef<HTMLParagraphElement>(null),attempt=useRef<{payload:string;key:string}|null>(null);
  const form=useForm<CheckoutFields>({defaultValues:{customer:{name,phone},shipping_address:{line1:"",city:""},payment_method:"COD"}});
  async function submit(fields:CheckoutFields) {
    setError("");
    const payload={...fields,items:items.map(item=>({product_id:item.product_id,quantity:item.quantity}))};
    const parsed=checkoutSchema.safeParse(payload);
    if(!parsed.success) {
      const fieldNames=["customer.name","customer.phone","shipping_address.line1","shipping_address.city"] as const;
      let first=true;
      for(const issue of parsed.error.issues) {
        const field=fieldNames.find(key=>key===issue.path.join("."));
        if(field) {form.setError(field,{message:"Vui lòng kiểm tra độ dài và thông tin đã nhập."},{shouldFocus:first});first=false;}
        else setError("Giỏ hàng không hợp lệ. Vui lòng kiểm tra lại sản phẩm.");
      }
      return;
    }
    try {
      const serialized=JSON.stringify(parsed.data);
      if(attempt.current?.payload!==serialized) {
        let saved;
        try {saved=JSON.parse(sessionStorage.getItem("retail_checkout_attempt")||"null");} catch {}
        attempt.current=saved?.payload===serialized&&typeof saved.key==="string"?saved:{payload:serialized,key:crypto.randomUUID()};
        try {sessionStorage.setItem("retail_checkout_attempt",JSON.stringify(attempt.current));} catch {}
      }
      const order=await clientRequest<{_id:string;status:string;inventory_state:string}>("/api/orders",{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":attempt.current!.key},body:serialized});
      if(order.status==="failed"||order.inventory_state!=="reserved") throw new Error("Đơn hàng chưa hoàn tất kiểm tra tồn kho. Vui lòng kiểm tra mục Đơn hàng trước khi đặt lại.");
      clear();
      try {sessionStorage.removeItem("retail_checkout_attempt");} catch {}
      router.push(`/checkout/success?order=${encodeURIComponent(order._id)}`);
    } catch(e) {setError(e instanceof Error?e.message:"Không thể đặt hàng. Vui lòng thử lại.");requestAnimationFrame(()=>errorRef.current?.focus());}
  }
  if(!ready) return <div role="status" aria-busy="true"><span className="sr-only">Đang tải đơn hàng…</span><Skeleton className="h-72" /></div>;
  if(!items.length) return <EmptyState title="Chưa có sản phẩm để đặt hàng" description="Thêm sản phẩm vào giỏ để tiếp tục." href="/products" label="Khám phá sản phẩm" />;
  const fields=[{key:"customer.name",label:"Họ và tên",autoComplete:"name",type:"text",error:form.formState.errors.customer?.name?.message,rule:{required:"Vui lòng nhập họ tên.",minLength:{value:2,message:"Họ tên cần ít nhất 2 ký tự."},maxLength:{value:100,message:"Họ tên tối đa 100 ký tự."}}},{key:"customer.phone",label:"Số điện thoại",autoComplete:"tel",type:"tel",error:form.formState.errors.customer?.phone?.message,rule:{required:"Vui lòng nhập số điện thoại.",minLength:{value:8,message:"Số điện thoại cần ít nhất 8 ký tự."},maxLength:{value:20,message:"Số điện thoại tối đa 20 ký tự."}}},{key:"shipping_address.line1",label:"Địa chỉ nhận hàng",autoComplete:"street-address",type:"text",error:form.formState.errors.shipping_address?.line1?.message,rule:{required:"Vui lòng nhập địa chỉ.",minLength:{value:5,message:"Địa chỉ cần ít nhất 5 ký tự."},maxLength:{value:200,message:"Địa chỉ tối đa 200 ký tự."}}},{key:"shipping_address.city",label:"Tỉnh / thành phố",autoComplete:"address-level1",type:"text",error:form.formState.errors.shipping_address?.city?.message,rule:{required:"Vui lòng nhập tỉnh/thành phố.",minLength:{value:2,message:"Tên tỉnh/thành phố cần ít nhất 2 ký tự."},maxLength:{value:100,message:"Tên tỉnh/thành phố tối đa 100 ký tự."}}}] as const;
  return <form onSubmit={event=>void form.handleSubmit(submit)(event)} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_350px]"><div className="space-y-5"><section className="panel p-5 sm:p-6"><h1 className="text-2xl font-semibold">Thông tin nhận hàng</h1><p className="mt-2 text-sm text-muted-foreground">Nhập thông tin để cửa hàng gửi đơn đến bạn.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{fields.map(field=><div key={field.key} className={field.key==="shipping_address.line1"?"space-y-2 sm:col-span-2":"space-y-2"}><Label htmlFor={field.key}>{field.label} <span aria-hidden="true">*</span></Label><Input id={field.key} type={field.type} autoComplete={field.autoComplete} aria-required="true" aria-invalid={!!field.error} aria-describedby={field.error?`${field.key}-error`:undefined} {...form.register(field.key,field.rule)} />{field.error&&<p id={`${field.key}-error`} className="text-sm text-destructive">{field.error}</p>}</div>)}</div></section><section className="panel p-5 sm:p-6"><h2 className="text-lg font-semibold">Phương thức thanh toán</h2><p className="mt-3 rounded-lg bg-subtle p-4 text-sm font-medium text-primary">Thanh toán khi nhận hàng (COD)</p></section><section className="panel p-5 sm:p-6"><h2 className="text-lg font-semibold">Sản phẩm đã chọn</h2><ul className="mt-3 divide-y">{items.map(item=><li key={item.product_id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="min-w-0 flex-1 break-words">{item.name} × {item.quantity}</span><Price amount={item.price*item.quantity} /></li>)}</ul><Link href="/cart" className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">Chỉnh sửa giỏ hàng</Link></section></div><OrderSummary count={count} subtotal={items.reduce((s,i)=>s+i.price*i.quantity,0)}>{error&&<p ref={errorRef} tabIndex={-1} role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-destructive">{error}</p>}<Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting?"Đang tạo đơn…":"Xác nhận đặt hàng"}</Button></OrderSummary></form>;
}
