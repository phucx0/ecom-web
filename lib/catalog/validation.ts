import { z } from "zod";
import { isLocalProductImage, MAX_PRODUCT_IMAGES } from "../media/images";
export const productImageSchema = z.union([z.string().url().refine(value => /^https?:\/\//i.test(value), "URL ảnh phải dùng HTTP hoặc HTTPS."), z.string().refine(isLocalProductImage, "Đường dẫn ảnh local không hợp lệ.")]);
export const slugSchema = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang.");
export const categorySchema = z.object({ name: z.string().trim().min(2).max(100), slug: slugSchema, is_active: z.boolean() });
export const productSchema = z.object({ name: z.string().trim().min(2).max(160), slug: slugSchema, category_id: z.string().startsWith("category:"), price: z.coerce.number().int().min(0), stock: z.coerce.number().int().min(0), description: z.string().trim().max(2000), images: z.array(productImageSchema).max(MAX_PRODUCT_IMAGES), is_active: z.boolean() });
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
