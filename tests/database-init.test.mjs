import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { compare } from "bcryptjs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSeedDocuments } from "../database/seed.mjs";
import { createClient, initializeDatabase, seedDatabase } from "../scripts/init-db.mjs";
import { categorySchema, productSchema } from "../lib/catalog/validation";
import { checkoutSchema } from "../lib/orders/validation";
import { canTransition } from "../lib/orders/state-machine";

const password = "TestCustomer2026!";
const quiet = () => {};

function memoryDatabase({ exists = true, documents = [], failType, indexes = [], reports } = {}) {
  const stored = new Map(documents.map((doc) => [doc._id, structuredClone(doc)]));
  const calls = [];
  let databaseExists = exists;
  let sequence = 0;
  let currentReports = reports;
  const request = async (path = "", { method = "GET", body } = {}) => {
    calls.push({ path, method, body: structuredClone(body) });
    if (path === "") {
      if (method === "PUT") { databaseExists = true; return { status: 201, data: { ok: true } }; }
      return { status: databaseExists ? 200 : 404, data: { db_name: "test_db" } };
    }
    if (path === "/_index") {
      if (method === "POST") {
        indexes.push({ name: body.name, type: body.type, def: { fields: body.index.fields.map((key) => ({ [key]: "asc" })) } });
        return { status: 200, data: { result: "created" } };
      }
      return { status: 200, data: { indexes } };
    }
    if (path === "/_design/reports") {
      if (method === "PUT") currentReports = structuredClone(body);
      return { status: currentReports ? 200 : 404, data: structuredClone(currentReports) };
    }
    if (path.startsWith("/_design/reports/_view/")) return { status: 200, data: { rows: [] } };
    if (path === "/_all_docs?include_docs=true") {
      return { status: 200, data: { rows: body.keys.map((key) => {
        const doc = stored.get(key);
        return doc ? { key, value: { rev: doc._rev }, doc: structuredClone(doc) } : { key, error: "not_found" };
      }) } };
    }
    if (path === "/_bulk_docs") {
      return { status: 201, data: body.docs.map((doc) => {
        if (stored.has(doc._id)) return { id: doc._id, error: "conflict" };
        if (doc.type === failType) return { id: doc._id, error: "forbidden" };
        const rev = `1-test-${++sequence}`;
        stored.set(doc._id, { ...structuredClone(doc), _rev: rev });
        return { id: doc._id, ok: true, rev };
      }) };
    }
    throw new Error(`Unexpected test request: ${method} ${path}`);
  };
  return { request, stored, calls };
}

afterEach(() => vi.unstubAllGlobals());

describe("CouchDB sample data", () => {
  it("có đủ document, tham chiếu, tổng tiền và lịch sử trạng thái hợp lệ", () => {
    const docs = createSeedDocuments();
    const byId = new Map(docs.map((doc) => [doc._id, doc]));
    expect(byId.size).toBe(23);
    expect(createSeedDocuments()).toEqual(docs);
    const counts = {};
    for (const doc of docs) {
      counts[doc.type] = (counts[doc.type] ?? 0) + 1;
      expect(doc._rev).toBeUndefined();
      if (doc.type === "category") expect(categorySchema.safeParse(doc).success).toBe(true);
      if (doc.type === "product") {
        expect(productSchema.safeParse(doc).success).toBe(true);
        expect(byId.get(doc.category_id)?.type).toBe("category");
      }
      if (doc.type === "order") {
        expect(byId.get(doc.user_id)?.type).toBe("user");
        expect(doc._id).toBe(`order:${createHash("sha256").update(`${doc.user_id}:${doc.idempotency_key}`).digest("hex")}`);
        expect(checkoutSchema.safeParse(doc).success).toBe(true);
        expect(doc.subtotal).toBe(doc.items.reduce((sum, item) => {
          expect(byId.get(item.product_id)?.price).toBe(item.unit_price);
          return sum + item.quantity * item.unit_price;
        }, 0));
        expect(doc.shipping_fee).toBe(doc.subtotal >= 500000 ? 0 : 30000);
        expect(doc.total).toBe(doc.subtotal + doc.shipping_fee);
        expect(doc.status_history.at(-1).status).toBe(doc.status);
        for (let index = 1; index < doc.status_history.length; index++) {
          expect(canTransition(doc.status_history[index - 1].status, doc.status_history[index].status)).toBe(true);
          expect(doc.status_history[index].at > doc.status_history[index - 1].at).toBe(true);
        }
        expect(doc.inventory_state).toBe(doc.status === "cancelled" ? "released" : "reserved");
      }
      if (doc.type === "delivery") {
        expect(byId.get(doc.order_id)?.status).toBe(doc.status);
        expect(doc.history.at(-1).status).toBe(doc.status);
      }
    }
    expect(counts).toEqual({ user: 2, category: 3, product: 6, order: 8, delivery: 4 });
    expect(new Set(docs.filter((doc) => doc.type === "order").map((doc) => doc.status)).size).toBe(7);
    expect(docs.filter((doc) => doc.type === "order" && doc.status === "delivered" && doc.payment_status === "paid")
      .reduce((sum, doc) => sum + doc.total, 0)).toBe(1400000);
  });
});

describe("CouchDB initialization", () => {
  it("tạo database mới, index và reports; chạy lại không ghi đè", async () => {
    const db = memoryDatabase({ exists: false });
    await initializeDatabase(db.request, quiet);
    expect(db.calls.filter((call) => call.method === "POST" && call.path === "/_index")).toHaveLength(8);
    expect(db.calls.some((call) => call.method === "PUT" && call.path === "")).toBe(true);
    db.calls.length = 0;
    await initializeDatabase(db.request, quiet);
    expect(db.calls.every((call) => call.method === "GET")).toBe(true);
  });

  it("dừng khi index cùng tên có định nghĩa khác", async () => {
    const db = memoryDatabase({ indexes: [{ name: "idx_type", type: "json", def: { fields: [{ email: "asc" }] } }] });
    await expect(initializeDatabase(db.request, quiet)).rejects.toThrow("định nghĩa khác");
    expect(db.calls.every((call) => call.method === "GET")).toBe(true);
  });

  it("giữ nguyên design document hiện có và báo thiếu view", async () => {
    const db = memoryDatabase({ reports: { _id: "_design/reports", _rev: "1-existing", views: {} } });
    await expect(initializeDatabase(db.request, quiet)).rejects.toThrow("thiếu view");
    expect(db.calls.some((call) => call.method === "PUT")).toBe(false);
  });
});

describe("CouchDB seed", () => {
  it("hash mật khẩu và bảo toàn dữ liệu đã sửa khi chạy lại", async () => {
    const db = memoryDatabase();
    expect(await seedDatabase(db.request, { SEED_CUSTOMER_PASSWORD: password }, quiet)).toEqual({ created: 23, skipped: 0 });
    const user = [...db.stored.values()].find((doc) => doc.type === "user");
    expect(await compare(password, user.password_hash)).toBe(true);
    expect(JSON.stringify([...db.stored.values()])).not.toContain(password);
    db.stored.get("product:demo-notebook").stock = 7;
    const before = structuredClone([...db.stored.values()]);
    db.calls.length = 0;
    expect(await seedDatabase(db.request, {}, quiet)).toEqual({ created: 0, skipped: 23 });
    expect([...db.stored.values()]).toEqual(before);
    expect(db.calls.some((call) => call.path === "/_bulk_docs")).toBe(false);
  });

  it("thiếu mật khẩu thì không chèn document", async () => {
    const db = memoryDatabase();
    await expect(seedDatabase(db.request, {}, quiet)).rejects.toThrow("SEED_CUSTOMER_PASSWORD");
    expect(db.stored.size).toBe(0);
  });

  it("không khôi phục tombstone và không chèn tham chiếu tới document đã xóa", async () => {
    const db = memoryDatabase({ documents: [{ _id: "category:demo-stationery", _rev: "2-deleted", _deleted: true }] });
    await expect(seedDatabase(db.request, { SEED_CUSTOMER_PASSWORD: password }, quiet)).rejects.toThrow("tham chiếu");
    expect(db.calls.some((call) => call.path === "/_bulk_docs")).toBe(false);
  });

  it("phát hiện lỗi từng document trong bulk HTTP 201 và dừng nhóm phụ thuộc", async () => {
    const existingUsers = createSeedDocuments().filter((doc) => doc.type === "user");
    const db = memoryDatabase({ documents: existingUsers, failType: "category" });
    await expect(seedDatabase(db.request, {}, quiet)).rejects.toThrow("forbidden");
    expect([...db.stored.values()].some((doc) => doc.type === "product")).toBe(false);
  });
});

describe("CouchDB HTTP client", () => {
  const env = { COUCHDB_URL: "http://localhost:5984", COUCHDB_DATABASE: "test_db", COUCHDB_USERNAME: "admin", COUCHDB_PASSWORD: "private-password" };

  it("lỗi xác thực không bị hiểu nhầm là database chưa có", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }));
    vi.stubGlobal("fetch", fetch);
    await expect(initializeDatabase(createClient(env), quiet)).rejects.toThrow("HTTP 401");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].method).toBe("GET");
  });

  it("ẩn thông tin kết nối khi fetch lỗi", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(env.COUCHDB_PASSWORD)));
    await expect(createClient(env)()).rejects.toThrow("kiểm tra kết nối");
    await expect(createClient(env)()).rejects.not.toThrow(env.COUCHDB_PASSWORD);
  });

  it("view chỉ tính order và chỉ ghi nhận doanh thu delivered đã paid", async () => {
    const reports = JSON.parse(await readFile(new URL("../database/reports.json", import.meta.url), "utf8"));
    const documents = createSeedDocuments();
    const statusRows = [];
    const revenueRows = [];
    for (const doc of documents) {
      runInNewContext(`(${reports.views.orders_by_status.map})(doc)`, { doc, emit: (key, value) => statusRows.push({ key, value }) });
      runInNewContext(`(${reports.views.revenue_by_day.map})(doc)`, { doc, emit: (key, value) => revenueRows.push({ key, value }) });
    }
    expect(statusRows).toHaveLength(8);
    expect(statusRows.filter((row) => row.key === "delivered")).toHaveLength(2);
    expect(revenueRows).toHaveLength(2);
    expect(revenueRows.reduce((sum, row) => sum + row.value, 0)).toBe(1400000);
    const delivered = documents.find((doc) => doc.type === "order" && doc.status === "delivered");
    runInNewContext(`(${reports.views.revenue_by_day.map})(doc)`, {
      doc: { ...delivered, payment_status: "unpaid" }, emit: () => { throw new Error("Không tính đơn chưa thanh toán"); },
    });
  });
});
