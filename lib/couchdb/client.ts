import "server-only";
import { CouchDbConflictError, CouchDbError } from "./errors";

type CouchConfig = { baseUrl: string; database: string; authorization: string; timeoutMs: number };

function config(): CouchConfig {
  const baseUrl = process.env.COUCHDB_URL;
  const database = process.env.COUCHDB_DATABASE;
  const username = process.env.COUCHDB_USERNAME;
  const password = process.env.COUCHDB_PASSWORD;
  const timeoutMs = Number(process.env.COUCHDB_TIMEOUT_MS ?? 5000);
  if (!baseUrl || !database || !username || !password) {
    throw new CouchDbError("Thiếu cấu hình CouchDB phía server.", 500, "COUCHDB_CONFIG_ERROR");
  }
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new CouchDbError("COUCHDB_TIMEOUT_MS không hợp lệ.", 500, "COUCHDB_CONFIG_ERROR");
  }
  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    database,
    authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
    timeoutMs,
  };
}

async function request<T>(url:string,init:RequestInit={}) {
  const cfg = config();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: { Accept: "application/json", Authorization: cfg.authorization, ...init.headers },
    });
    if (!response.ok) {
      if (response.status === 409) throw new CouchDbConflictError();
      throw new CouchDbError("CouchDB trả về lỗi.", response.status, `COUCHDB_HTTP_${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof CouchDbError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new CouchDbError("Kết nối CouchDB quá thời gian.", 504, "COUCHDB_TIMEOUT");
    }
    throw new CouchDbError("Không thể kết nối CouchDB.", 503, "COUCHDB_UNAVAILABLE");
  } finally {
    clearTimeout(timeout);
  }
}

export function couchRequest<T>(path="",init:RequestInit={}){const cfg=config();return request<T>(`${cfg.baseUrl}/${encodeURIComponent(cfg.database)}${path}`,init)}
export function couchDatabaseRequest<T>(database:string,path="",init:RequestInit={}){const cfg=config();return request<T>(`${cfg.baseUrl}/${encodeURIComponent(database)}${path}`,init)}
export function couchServerRequest<T>(path="",init:RequestInit={}){const cfg=config();return request<T>(`${cfg.baseUrl}${path}`,init)}

export function couchDatabaseName() {
  return process.env.COUCHDB_DATABASE ?? "retail_shop";
}
