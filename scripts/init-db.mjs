import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { hash } from "bcryptjs";
import { createSeedDocuments } from "../database/seed.mjs";

export function createClient(env = process.env) {
  for (const key of ["COUCHDB_URL", "COUCHDB_DATABASE", "COUCHDB_USERNAME", "COUCHDB_PASSWORD"]) {
    if (!env[key]) throw new Error(`Thiếu biến môi trường ${key}.`);
  }
  const url = new URL(env.COUCHDB_URL);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("COUCHDB_URL phải là URL HTTP(S), không chứa credentials, query hoặc fragment.");
  }
  if (!/^[a-z][a-z0-9_$()+/-]*$/.test(env.COUCHDB_DATABASE)) throw new Error("Tên database CouchDB không hợp lệ.");
  const timeoutMs = Number(env.COUCHDB_TIMEOUT_MS ?? 5000);
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new Error("COUCHDB_TIMEOUT_MS phải là số nguyên dương.");
  const base = `${url.toString().replace(/\/$/, "")}/${encodeURIComponent(env.COUCHDB_DATABASE)}`;
  const authorization = `Basic ${Buffer.from(`${env.COUCHDB_USERNAME}:${env.COUCHDB_PASSWORD}`).toString("base64")}`;
  return async function request(path = "", { method = "GET", body, allow = [] } = {}) {
    let response;
    try {
      response = await fetch(`${base}${path}`, {
        method, redirect: "error", signal: AbortSignal.timeout(timeoutMs),
        headers: { authorization, accept: "application/json", "content-type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const data = await response.json();
      if (!response.ok && !allow.includes(response.status)) {
        throw new Error(`CouchDB ${method} ${path || "/<database>"}: HTTP ${response.status}.`);
      }
      return { status: response.status, data };
    } catch (error) {
      if (response && error instanceof Error && error.message.startsWith("CouchDB ")) throw error;
      // Không in URL, Authorization hoặc lỗi fetch gốc có thể chứa thông tin kết nối.
      throw new Error(`Không thể đọc phản hồi CouchDB ${method} ${path || "/<database>"}; kiểm tra kết nối và timeout.`);
    }
  };
}

async function readDefinition(name) {
  return JSON.parse(await readFile(new URL(`../database/${name}.json`, import.meta.url), "utf8"));
}

export async function initializeDatabase(request, log = console.log) {
  const info = await request("", { allow: [404] });
  if (info.status === 404) {
    const result = await request("", { method: "PUT", allow: [412] });
    log(result.status === 412 ? "Database đã tồn tại; giữ nguyên." : "Đã tạo database.");
  } else {
    log("Database đã tồn tại; giữ nguyên.");
  }
  const { data: database } = await request();
  if (database.props?.partitioned) throw new Error("Ứng dụng yêu cầu database không phân vùng (partitioned=false).");
  const definitions = await readDefinition("indexes");
  const { data: existing } = await request("/_index");
  for (const definition of definitions) {
    const matches = existing.indexes.filter((index) => index.name === definition.name);
    if (matches.length) {
      const compatible = matches.some((index) => index.type === "json" &&
        JSON.stringify(index.def.fields) === JSON.stringify(definition.fields.map((field) => ({ [field]: "asc" }))) &&
        !index.def.partial_filter_selector);
      if (!compatible) throw new Error(`Index ${definition.name} đã tồn tại với định nghĩa khác; giữ nguyên, cần kiểm tra thủ công.`);
      log(`Giữ index ${definition.name}.`);
      continue;
    }
    await request("/_index", {
      method: "POST",
      body: { index: { fields: definition.fields }, name: definition.name, ddoc: "retail_shop_indexes", type: "json" },
    });
    log(`Đã tạo index ${definition.name}.`);
  }
  const reports = await readDefinition("reports");
  let current = await request("/_design/reports", { allow: [404] });
  if (current.status === 404) {
    await request("/_design/reports", { method: "PUT", body: reports, allow: [409] });
    current = await request("/_design/reports");
  }
  for (const name of Object.keys(reports.views)) {
    if (!current.data.views?.[name]) throw new Error(`_design/reports thiếu view ${name}; giữ nguyên document, cần kiểm tra thủ công.`);
    await request(`/_design/reports/_view/${name}?group=true`);
  }
  log("Đã kiểm tra 2 view trong _design/reports.");
}

export async function seedDatabase(request, env = process.env, log = console.log) {
  await request(); // db:seed yêu cầu đã chạy db:init.
  const documents = createSeedDocuments();
  const { data: existing } = await request("/_all_docs?include_docs=true", {
    method: "POST", body: { keys: documents.map((document) => document._id) },
  });
  // Giữ cả tombstone: không khôi phục lại document đã bị xóa bằng seed.
  const known = new Set(existing.rows.filter((row) => !row.error).map((row) => row.key));
  const pending = documents.filter((document) => !known.has(document._id));
  const available = new Map(existing.rows.filter((row) => row.doc && !row.doc._deleted)
    .map((row) => [row.key, row.doc]));
  for (const document of pending) available.set(document._id, document);
  for (const document of pending) {
    const references = document.type === "product" ? [[document.category_id, "category"]]
      : document.type === "order" ? [[document.user_id, "user"], ...document.items.map((item) => [item.product_id, "product"])]
      : document.type === "delivery" ? [[document.order_id, "order"]] : [];
    for (const [id, type] of references) {
      if (available.get(id)?.type !== type) {
        throw new Error(`Không seed ${document._id}: tham chiếu ${id} bị thiếu, đã xóa hoặc sai type. Không ghi dữ liệu.`);
      }
    }
  }
  const users = pending.filter((document) => document.type === "user");
  if (users.length) {
    const password = env.SEED_CUSTOMER_PASSWORD ?? "";
    if (password.length < 10 || Buffer.byteLength(password, "utf8") > 72 ||
        !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      throw new Error("Đặt SEED_CUSTOMER_PASSWORD có ít nhất 10 ký tự, gồm chữ hoa, chữ thường, số và tối đa 72 byte UTF-8.");
    }
    for (const user of users) user.password_hash = await hash(password, 12);
  }
  // Ghi lần lượt theo quan hệ để khi có lỗi, chưa chèn document phụ thuộc vào nhóm bị lỗi.
  let created = 0;
  let skipped = known.size;
  for (const type of ["user", "category", "product", "order", "delivery"]) {
    const batch = pending.filter((document) => document.type === type);
    if (!batch.length) continue;
    const { data: result } = await request("/_bulk_docs", { method: "POST", body: { docs: batch } });
    const failures = result.filter((row) => !row.ok && row.error !== "conflict");
    created += result.filter((row) => row.ok).length;
    skipped += result.filter((row) => row.error === "conflict").length;
    if (failures.length) {
      throw new Error(`Seed ${type} có lỗi: ${failures.map((row) => `${row.id} (${row.error})`).join(", ")}. Đã thêm ${created} document; có thể chạy lại để bổ sung phần thiếu.`);
    }
  }
  log(`Seed hoàn tất: thêm ${created}, bỏ qua ${skipped} document đã tồn tại hoặc đã xóa.`);
  return { created, skipped };
}

export async function main(args = process.argv.slice(2)) {
  if (args.length > 1 || (args.length === 1 && !["--init-only", "--seed-only"].includes(args[0]))) {
    throw new Error("Dùng npm run db:init, db:seed hoặc db:setup.");
  }
  const request = createClient();
  if (args[0] !== "--seed-only") await initializeDatabase(request);
  if (args[0] !== "--init-only") await seedDatabase(request);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Khởi tạo CouchDB thất bại.");
    process.exitCode = 1;
  });
}
