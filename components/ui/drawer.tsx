"use client";
import { useId, useRef, useState, useEffect, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./button";
export function Drawer({title,children}:{title:string;children:ReactNode}) {
  const dialog=useRef<HTMLDialogElement>(null),id=useId(),[open,setOpen]=useState(false);
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;};},[open]);
  return <><Button variant="outline" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={()=>{dialog.current?.showModal();setOpen(true);}}><Menu className="size-4" aria-hidden="true" />{title}</Button><dialog id={id} ref={dialog} aria-labelledby={`${id}-title`} onClickCapture={event=>{if((event.target as Element).closest("a"))dialog.current?.close();}} onClose={()=>setOpen(false)} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(320px,90vw)] max-w-none overflow-y-auto overscroll-contain border-r bg-surface p-5 text-foreground shadow-xl backdrop:bg-black/45"><div className="mb-5 flex items-center justify-between gap-3"><h2 id={`${id}-title`} className="text-lg font-semibold">{title}</h2><Button variant="ghost" aria-label="Đóng điều hướng" onClick={()=>dialog.current?.close()}><X className="size-5" aria-hidden="true" /></Button></div>{children}</dialog></>;
}
