"use client";
import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import { Button } from "./button";
export function QuantitySelector({ value, max, onChange, label = "Số lượng", disabled = false }: { value: number; max: number; onChange: (n: number) => void; label?: string; disabled?: boolean }) {
  const id=useId(), limit=Math.max(1,Math.min(99,Math.floor(max)));
  const change=(n:number)=>onChange(Math.max(1,Math.min(limit,Math.floor(n)||1)));
  return <div className="inline-flex max-w-full items-center rounded-lg border bg-surface"><Button variant="ghost" type="button" className="w-11 px-0" disabled={disabled||value<=1} aria-label={`Giảm ${label.toLowerCase()}`} onClick={()=>change(value-1)}><Minus className="size-4" aria-hidden="true" /></Button><label htmlFor={id} className="sr-only">{label}</label><input id={id} type="number" inputMode="numeric" min={1} max={limit} step={1} value={value} disabled={disabled} onChange={e=>change(Number(e.target.value))} className="h-11 w-12 min-w-0 border-x bg-transparent text-center text-base tabular-nums" /><Button variant="ghost" type="button" className="w-11 px-0" disabled={disabled||value>=limit} aria-label={`Tăng ${label.toLowerCase()}`} onClick={()=>change(value+1)}><Plus className="size-4" aria-hidden="true" /></Button></div>;
}
