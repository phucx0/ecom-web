import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ProductDocument } from "@/lib/catalog/types";
import { ProductImage } from "./product-image";
import { Price } from "./price";
export function ProductCard({ product, category, priority = false, headingLevel = "h2" }: { product: ProductDocument; category?: string; priority?: boolean; headingLevel?: "h2"|"h3" }) {
  const Heading=headingLevel;
  return <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border bg-surface transition-colors hover:border-primary/50">
    <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-slate-50" aria-label={`Xem ${product.name}`}><ProductImage src={product.images[0]} alt={product.name} priority={priority} />{product.stock < 1 && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-muted-foreground">Hết hàng</span>}</Link>
    <div className="flex flex-1 flex-col p-3 sm:p-4">{category && <p className="mb-1 truncate text-xs text-muted-foreground">{category}</p>}<Heading className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 sm:text-base sm:leading-6"><Link className="hover:text-primary" href={`/products/${product.slug}`}>{product.name}</Link></Heading><div className="mt-3 flex flex-wrap items-end justify-between gap-2"><div><Price amount={product.price} className="text-sm text-primary sm:text-lg" /><p className="mt-1 text-xs text-muted-foreground">{product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Tạm hết hàng"}</p></div><Link href={`/products/${product.slug}`} aria-label={`Chi tiết ${product.name}`} className="flex size-11 items-center justify-center rounded-full bg-subtle text-primary transition-colors hover:bg-primary hover:text-white"><ArrowUpRight className="size-5" aria-hidden="true" /></Link></div></div>
  </article>;
}
