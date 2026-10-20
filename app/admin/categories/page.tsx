import { CategoryManager } from "@/components/admin/category-manager";
import { PageHeader } from "@/components/shared/page-header";
import { listCategories } from "@/lib/catalog/repository";
export const dynamic="force-dynamic";
export default async function Page(){const categories=await listCategories(true);return <div className="space-y-6"><PageHeader eyebrow="Catalog" title="Danh mục" description="Tổ chức sản phẩm theo các nhóm mua sắm."/><CategoryManager initial={categories}/></div>}
