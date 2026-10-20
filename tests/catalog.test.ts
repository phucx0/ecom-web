import { describe, expect, it } from "vitest";
import { categorySchema, productSchema, slugSchema } from "../lib/catalog/validation";
describe("catalog validation", () => {
  it("chấp nhận slug hợp lệ", () => expect(slugSchema.safeParse("ban-phim-co-f75").success).toBe(true));
  it("từ chối slug viết hoa hoặc có khoảng trắng", () => expect(slugSchema.safeParse("Ban phim").success).toBe(false));
  it("từ chối tồn kho âm", () => expect(productSchema.safeParse({ name: "Sản phẩm", slug: "san-pham", category_id: "category:C1", price: 1000, stock: -1, description: "", images: [], is_active: true }).success).toBe(false));
  it("từ chối ảnh không phải URL", () => expect(productSchema.safeParse({ name: "Sản phẩm", slug: "san-pham", category_id: "category:C1", price: 1000, stock: 1, description: "", images: ["not-url"], is_active: true }).success).toBe(false));
  it("chấp nhận danh mục hợp lệ", () => expect(categorySchema.safeParse({ name: "Bàn phím", slug: "ban-phim", is_active: true }).success).toBe(true));
});
