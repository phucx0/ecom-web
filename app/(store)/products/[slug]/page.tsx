import { notFound } from "next/navigation";
import { PackageCheck, Wallet } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { Price } from "@/components/catalog/price";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { CatalogError, productBySlug, listCategories } from "@/lib/catalog/repository";
export default async function ProductDetail({params}:{params:Promise<{slug:string}>}) {
  let product;
  try { product=await productBySlug((await params).slug); } catch(e) { if(e instanceof CatalogError&&e.status===404) notFound(); throw e; }
  const categories=await listCategories(),category=categories.find(c=>c._id===product.category_id);
  return <div className="space-y-6"><Breadcrumbs items={[{label:"Trang chủ",href:"/"},{label:"Sản phẩm",href:"/products"},{label:product.name}]} /><article className="grid items-start gap-7 lg:grid-cols-2 lg:gap-12"><ProductGallery images={product.images} name={product.name} /><div className="min-w-0 space-y-6">{category && <p className="text-sm font-medium text-primary">{category.name}</p>}<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1><Price amount={product.price} className="block text-3xl text-primary" /><p className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${product.stock>0?"bg-subtle text-primary":"bg-slate-100 text-slate-600"}`}>{product.stock>0 ? `Còn ${product.stock} sản phẩm` : "Tạm hết hàng"}</p><div className="border-y py-6"><AddToCartButton product={product} /></div><dl className="space-y-3 text-sm"><div className="flex items-start gap-3"><Wallet className="size-5 shrink-0 text-primary" aria-hidden="true" /><div><dt className="font-medium">Thanh toán khi nhận hàng</dt><dd className="mt-1 text-muted-foreground">Phương thức COD khi đặt hàng.</dd></div></div><div className="flex items-start gap-3"><PackageCheck className="size-5 shrink-0 text-primary" aria-hidden="true" /><div><dt className="font-medium">Phí vận chuyển rõ ràng</dt><dd className="mt-1 text-muted-foreground">30.000 ₫ / đơn. Miễn phí với đơn từ 500.000 ₫.</dd></div></div></dl><section className="border-t pt-5"><h2 className="text-lg font-semibold">Thông tin sản phẩm</h2><p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{product.description||"Sản phẩm chưa có mô tả bổ sung."}</p></section></div></article></div>;
}
