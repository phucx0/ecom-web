"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
export type CartItem={product_id:string;slug:string;name:string;price:number;stock:number;quantity:number};
type CartValue={items:CartItem[];add:(item:Omit<CartItem,"quantity">,quantity?:number)=>void;setQuantity:(id:string,n:number)=>void;remove:(id:string)=>void;clear:()=>void;count:number};
const CartContext=createContext<CartValue|null>(null),STORAGE_KEY="retail_shop_cart_v1";
export function CartProvider({children}:{children:React.ReactNode}){
 const[items,setItems]=useState<CartItem[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{queueMicrotask(()=>{try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");if(Array.isArray(saved))setItems(saved)}catch{}setReady(true)})},[]);
 useEffect(()=>{if(ready)localStorage.setItem(STORAGE_KEY,JSON.stringify(items))},[items,ready]);
 const value=useMemo<CartValue>(()=>({items,add:(item,quantity=1)=>setItems(current=>{const amount=Math.max(1,Math.min(Math.floor(quantity),item.stock));const old=current.find(i=>i.product_id===item.product_id);return old?current.map(i=>i.product_id===item.product_id?{...i,quantity:Math.min(i.quantity+amount,item.stock)}:i):[...current,{...item,quantity:amount}]}),setQuantity:(id,n)=>setItems(current=>current.map(i=>i.product_id===id?{...i,quantity:Math.max(1,Math.min(Math.floor(n)||1,i.stock))}:i)),remove:id=>setItems(current=>current.filter(i=>i.product_id!==id)),clear:()=>setItems([]),count:items.reduce((sum,i)=>sum+i.quantity,0)}),[items]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("CartProvider missing");return value}
