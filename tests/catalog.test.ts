import { describe, expect, it } from "vitest";
import { categorySchema, productImageSchema, productSchema, slugSchema } from "../lib/catalog/validation";
describe("catalog validation", () => {
  it("chấp nhận URL cũ và đường dẫn ảnh local", () => {
    expect(productImageSchema.safeParse("https://example.com/photo.jpg").success).toBe(true);
    expect(productImageSchema.safeParse("/uploads/products/19e7aa80-e4ef-44a4-842a-94a576b3dc59.webp").success).toBe(true);
  });
  it.each(["/uploads/products/../../.env.local", "//example.com/a.png", "/uploads/products/fake.svg", "C:\\photos\\image.jpg"])("từ chối đường dẫn không hợp lệ: %s", value => {
    expect(productImageSchema.safeParse(value).success).toBe(false);
  });
  it("chấp nhận slug hợp lệ", () => expect(slugSchema.safeParse("ban-phim-co-f75").success).toBe(true));
  it("từ chối slug viết hoa hoặc có khoảng trắng", () => expect(slugSchema.safeParse("Ban phim").success).toBe(false));
  it("từ chối tồn kho âm", () => expect(productSchema.safeParse({ name: "Sản phẩm", slug: "san-pham", category_id: "category:C1", price: 1000, stock: -1, description: "", images: [], is_active: true }).success).toBe(false));
  it("từ chối ảnh không phải URL", () => expect(productSchema.safeParse({ name: "Sản phẩm", slug: "san-pham", category_id: "category:C1", price: 1000, stock: 1, description: "", images: ["not-url"], is_active: true }).success).toBe(false));
  it("chấp nhận danh mục hợp lệ", () => expect(categorySchema.safeParse({ name: "Bàn phím", slug: "ban-phim", is_active: true }).success).toBe(true));
});
