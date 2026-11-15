"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
export type CartItem={product_id:string;slug:string;name:string;price:number;stock:number;quantity:number};
type CartValue={items:CartItem[];ready:boolean;add:(item:Omit<CartItem,"quantity">,quantity?:number)=>void;setQuantity:(id:string,n:number)=>void;remove:(id:string)=>void;clear:()=>void;count:number};
const CartContext=createContext<CartValue|null>(null),STORAGE_KEY="retail_shop_cart_v1";
export function CartProvider({children}:{children:React.ReactNode}){
 const[items,setItems]=useState<CartItem[]>([]),[ready,setReady]=useState(false);
 useEffect(()=>{queueMicrotask(()=>{try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");if(Array.isArray(saved))setItems(saved.filter((i:CartItem)=>i&&typeof i.product_id==="string"&&i.product_id.startsWith("product:")&&typeof i.slug==="string"&&typeof i.name==="string"&&Number.isFinite(i.price)&&i.price>=0&&Number.isInteger(i.stock)&&i.stock>0&&Number.isInteger(i.quantity)&&i.quantity>0).map((i:CartItem)=>({...i,quantity:Math.min(i.quantity,i.stock,99)})))}catch{}setReady(true)})},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}catch{}},[items,ready]);
 const value=useMemo<CartValue>(()=>({items,ready,add:(item,quantity=1)=>setItems(current=>{if(item.stock<1)return current;const amount=Math.max(1,Math.min(Math.floor(quantity)||1,item.stock,99));const old=current.find(i=>i.product_id===item.product_id);return old?current.map(i=>i.product_id===item.product_id?{...item,quantity:Math.min(i.quantity+amount,item.stock,99)}:i):[...current,{...item,quantity:amount}]}),setQuantity:(id,n)=>setItems(current=>current.map(i=>i.product_id===id?{...i,quantity:Math.max(1,Math.min(Math.floor(n)||1,i.stock,99))}:i)),remove:id=>setItems(current=>current.filter(i=>i.product_id!==id)),clear:()=>setItems([]),count:items.reduce((sum,i)=>sum+i.quantity,0)}),[items,ready]);
 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart(){const value=useContext(CartContext);if(!value)throw new Error("CartProvider missing");return value}
