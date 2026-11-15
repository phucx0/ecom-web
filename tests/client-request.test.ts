import { afterEach, describe, expect, it, vi } from "vitest";
import { clientRequest } from "../lib/client-request";
afterEach(() => vi.unstubAllGlobals());
describe("client request feedback", () => {
  it("returns real API data and preserves method, payload and idempotency header", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ data: { _id: "order:test" } }));
    vi.stubGlobal("fetch", fetcher);
    const init = { method: "POST", headers: { "Idempotency-Key": "same-attempt-key" }, body: "{}" };
    expect(await clientRequest("/api/orders", init)).toEqual({ _id: "order:test" });
    expect(fetcher).toHaveBeenCalledWith("/api/orders", init);
  });
  it("keeps actionable business errors from the API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { message: "Sản phẩm không đủ tồn kho." } }, { status: 409 })));
    await expect(clientRequest("/api/orders")).rejects.toThrow("Sản phẩm không đủ tồn kho.");
  });
  it("reports a recoverable message when offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(clientRequest("/api/orders")).rejects.toThrow("Kiểm tra mạng rồi thử lại");
  });
  it("handles HTML error pages without leaking raw responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>internal error</html>", { status: 502 })));
    await expect(clientRequest("/api/orders")).rejects.toThrow("Không thể đọc phản hồi");
  });
});
