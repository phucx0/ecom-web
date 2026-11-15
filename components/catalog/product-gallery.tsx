"use client";
import { useState } from "react";
import { ProductImage } from "./product-image";
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active,setActive]=useState(0);
  return <div className="min-w-0 space-y-3"><div className="panel relative aspect-square overflow-hidden"><ProductImage key={images[active] || "empty"} src={images[active]} alt={`${name} — ảnh ${active+1}`} priority sizes="(max-width: 1024px) 90vw, 540px" /></div>{images.length>1&&<div className="flex flex-wrap gap-2" role="group" aria-label="Chọn ảnh sản phẩm">{images.map((src,index)=><button key={`${src}-${index}`} type="button" aria-label={`Xem ảnh ${index+1} của ${name}`} aria-pressed={index===active} onClick={()=>setActive(index)} className={`relative size-16 overflow-hidden rounded-lg border-2 bg-white ${index===active?"border-primary":"border-border hover:border-slate-400"}`}><ProductImage src={src} alt="" sizes="64px" /></button>)}</div>}</div>;
}
