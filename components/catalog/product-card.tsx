import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import type { ProductDocument } from "@/lib/catalog/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function ProductCard({ product }: { product: ProductDocument }) { return <Card className="overflow-hidden"><div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100">{product.images[0] ? <Image src={product.images[0]} alt={product.name} fill unoptimized className="object-cover" /> : <ImageIcon className="size-10 text-slate-400" />}</div><CardHeader><CardTitle><Link href={`/products/${product.slug}`} className="hover:text-emerald-700">{product.name}</Link></CardTitle></CardHeader><CardContent><p className="line-clamp-2 min-h-10 text-sm text-slate-600">{product.description}</p><div className="mt-4 flex items-center justify-between"><strong className="text-lg text-emerald-700">{product.price.toLocaleString("vi-VN")} ₫</strong><span className="text-xs text-slate-500">Còn {product.stock}</span></div></CardContent></Card>; }
