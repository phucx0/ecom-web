import { z } from "zod";
export const slugSchema = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang.");
export const categorySchema = z.object({ name: z.string().trim().min(2).max(100), slug: slugSchema, is_active: z.boolean() });
export const productSchema = z.object({ name: z.string().trim().min(2).max(160), slug: slugSchema, category_id: z.string().startsWith("category:"), price: z.coerce.number().int().min(0), stock: z.coerce.number().int().min(0), description: z.string().trim().max(2000), images: z.array(z.string().url()).max(10), is_active: z.boolean() });
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
