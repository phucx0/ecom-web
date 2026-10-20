import type { CouchDocument } from "@/lib/couchdb/documents";
export interface CategoryDocument extends CouchDocument { type: "category"; name: string; slug: string; is_active: boolean }
export interface ProductDocument extends CouchDocument { type: "product"; name: string; slug: string; category_id: string; price: number; stock: number; description: string; images: string[]; is_active: boolean; created_at: string }
