"use client";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";
export function ProductImage({ src, alt, sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px", priority = false }: { src?: string; alt: string; sizes?: string; priority?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  return src && failedSrc !== src ? <Image src={src} alt={alt} fill unoptimized sizes={sizes} priority={priority} className="object-contain p-4" onError={() => setFailedSrc(src)} /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground"><ImageIcon className="size-9 opacity-50" aria-hidden="true" /><span className="text-xs">Chưa có hình ảnh</span></div>;
}
