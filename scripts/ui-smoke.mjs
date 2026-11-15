// Read-only checks against a running real application. No fixtures, seeding, or database writes.
import assert from "node:assert/strict";
const base = process.env.UI_SMOKE_URL || "http://127.0.0.1:3100";
const checks = [];
async function get(path, options) {
  const response = await fetch(new URL(path, base), options);
  return response;
}
async function html(path) {
  const response = await get(path);
  assert.equal(response.status, 200, path);
  const text = await response.text();
  assert.match(text, /id="main-content"/, `${path}: main landmark`);
  assert.match(text, /lang="vi"/, `${path}: Vietnamese locale`);
  assert.doesNotMatch(text, /NEXT_HTTP_ERROR_FALLBACK;500|data-next-error-message=/, `${path}: server rendering error`);
  return text;
}
async function check(name, fn) { await fn(); checks.push(name); console.log(`PASS ${name}`); }
const products = (await (await get("/api/products")).json()).data;
const categories = (await (await get("/api/categories")).json()).data;
assert.ok(Array.isArray(products)); assert.ok(Array.isArray(categories));
await check("CouchDB health", async () => assert.equal((await (await get("/api/health")).json()).status, "ok"));
await check("Home uses real catalog and customer copy", async () => {
  const text = await html("/");
  for (const product of products.slice(0, 8)) assert.ok(text.includes(product.name), "real product name");
  assert.doesNotMatch(text, /CouchDB thật|Đồ án quản trị|Sản phẩm từ dữ liệu CouchDB/);
});
await check("Catalog, search, sorting and out-of-range pagination", async () => {
  await html("/products");
  const text = await html("/products?sort=price-asc&page=999");
  const sorted=[...products].sort((a,b)=>a.price-b.price);
  const lastPage=sorted.slice(Math.floor(Math.max(0,sorted.length-1)/12)*12);
  for(const product of lastPage) assert.ok(text.includes(product.name));
  const firstPage=await html("/products?sort=price-asc");
  const positions=sorted.slice(0,12).map(product=>firstPage.indexOf(product.name));
  assert.ok(positions.every((position,index)=>position>=0&&(index===0||position>=positions[index-1])));
  if (products.length) {
    const query = new URLSearchParams({ q: products[0].name });
    const result = await (await get(`/api/products?${query}`)).json();
    assert.ok(result.data.some(product => product._id === products[0]._id));
  }
});
await check("Category filtering uses real IDs", async () => {
  if (!categories.length) return;
  const query = new URLSearchParams({ category: categories[0]._id });
  await html(`/products?${query}`);
  const result = await (await get(`/api/products?${query}`)).json();
  assert.ok(result.data.every(product => product.category_id === categories[0]._id));
});
await check("Catalog empty state", async () => assert.ok((await html("/products?q=__ui_smoke_no_matching_product_71380__")).includes("Không tìm thấy sản phẩm")));
await check("Real product details and missing-product handling", async () => {
  for (const product of products.slice(0, 4)) assert.ok((await html(`/products/${product.slug}`)).includes(product.name));
  assert.equal((await get("/api/products/__ui_smoke_missing_71380__")).status, 404);
  const missing = await get("/products/__ui_smoke_missing_71380__");
  const text=await missing.text();
  assert.ok(missing.status===404 || text.includes("NEXT_HTTP_ERROR_FALLBACK;404"));
});
await check("Auth forms and cart shell render", async () => {
  for (const path of ["/login", "/register", "/cart"]) await html(path);
  assert.ok((await html("/login?returnTo=%2Fcheckout")).includes('autoComplete="current-password"'));
});
await check("Protected pages redirect without a session", async () => {
  for (const path of ["/account/profile", "/account/orders", "/checkout", "/admin", "/admin/products", "/admin/categories", "/admin/orders", "/admin/users", "/admin/database"]) {
    const r=await get(path,{redirect:"manual"});const body=await r.text();
    assert.ok((r.status===307&&r.headers.get("location")?.startsWith("/login"))||body.includes("NEXT_REDIRECT"), path);
  }
});
await check("Private APIs reject anonymous reads", async () => {
  for (const path of ["/api/auth/me", "/api/orders", "/api/admin/auth-check", "/api/admin/products", "/api/admin/categories", "/api/admin/users", "/api/admin/database/overview", "/api/admin/database/backups"]) assert.equal((await get(path)).status,401,path);
});
console.log(JSON.stringify({ passed: checks.length, products: products.length, categories: categories.length, base }, null, 2));
