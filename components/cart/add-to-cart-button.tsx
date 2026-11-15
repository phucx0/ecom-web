"use client";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { useCart } from "./cart-provider";
import type { ProductDocument } from "@/lib/catalog/types";
export function AddToCartButton({product}:{product:ProductDocument}) {
  const {add,items,ready}=useCart(),[quantity,setQuantity]=useState(1);
  const inCart=items.find(i=>i.product_id===product._id)?.quantity||0, remaining=Math.max(0,Math.min(99,product.stock)-inCart);
  function submit() {
    if(!remaining) { toast.info("Bạn đã chọn số lượng tối đa có thể mua."); return; }
    const amount=Math.min(quantity,remaining);
    add({product_id:product._id,slug:product.slug,name:product.name,price:product.price,stock:product.stock},amount);
    toast.success(`Đã thêm ${amount} sản phẩm vào giỏ hàng.`);
  }
  return <div className="space-y-3"><p className="text-sm font-medium">Số lượng</p><div className="flex flex-wrap items-center gap-3"><QuantitySelector value={Math.min(quantity,Math.max(1,remaining))} max={remaining} onChange={setQuantity} disabled={!remaining||!ready} /><Button size="lg" className="flex-1" disabled={!ready||!remaining} onClick={submit}><ShoppingBag className="size-5" aria-hidden="true" />{product.stock<1?"Hết hàng":remaining<1?"Đã đạt giới hạn":"Thêm vào giỏ hàng"}</Button></div>{inCart>0&&<p className="text-sm text-muted-foreground" role="status">Đã có {inCart} sản phẩm trong giỏ hàng.</p>}</div>;
}
