import "server-only";
import { couchRequest } from "./client";
import { CouchDbError } from "./errors";

export type CouchDocument = { _id: string; _rev?: string; type: string; [key: string]: unknown };
export type WriteResult = { ok: boolean; id: string; rev: string };

export function getDocument<T extends CouchDocument>(id: string) {
  return couchRequest<T>(`/${encodeURIComponent(id)}`);
}

export function putDocument<T extends CouchDocument>(document: T) {
  if (!document._id || !document.type) throw new CouchDbError("Document thiếu _id hoặc type.", 400, "INVALID_DOCUMENT");
  return couchRequest<WriteResult>(`/${encodeURIComponent(document._id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(document),
  });
}

export function updateDocument<T extends CouchDocument>(document: T) {
  if (!document._rev) throw new CouchDbError("Cập nhật document bắt buộc có _rev.", 400, "REV_REQUIRED");
  return putDocument(document);
}

export function deleteDocument(id: string, rev: string) {
  if (!rev) throw new CouchDbError("Xóa document bắt buộc có _rev.", 400, "REV_REQUIRED");
  return couchRequest<WriteResult>(`/${encodeURIComponent(id)}?rev=${encodeURIComponent(rev)}`, { method: "DELETE" });
}

export async function mangoQuery<T extends CouchDocument>(selector: Record<string, unknown>, options: { limit?: number; skip?: number; sort?: unknown[] } = {}) {
  const limit = Math.min(Math.max(options.limit ?? 25, 1), 100);
  return couchRequest<{ docs: T[]; bookmark?: string }>("/_find", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selector, limit, ...(options.skip === undefined ? {} : { skip: options.skip }), ...(options.sort ? { sort: options.sort } : {}) }),
  });
}
