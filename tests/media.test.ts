import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, readdir, rmdir, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { MAX_IMAGE_BYTES } from "../lib/media/images";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/admin/security", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/admin/security")>(),
  requireAdminApi: vi.fn(),
}));

let upload: typeof import("../app/api/admin/uploads/route").POST;
let serve: typeof import("../app/uploads/products/[filename]/route").GET;
let save: typeof import("../lib/media/storage").saveProductImage;
let directory: string;
let png: Uint8Array<ArrayBuffer>;

beforeAll(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "retail-images-test-"));
  const cwd = vi.spyOn(process, "cwd").mockReturnValue(directory);
  try {
    save = (await import("../lib/media/storage")).saveProductImage;
    upload = (await import("../app/api/admin/uploads/route")).POST;
    serve = (await import("../app/uploads/products/[filename]/route")).GET;
  } finally { cwd.mockRestore(); }
  png = new Uint8Array(await sharp({ create: { width: 12, height: 8, channels: 3, background: "#008060" } }).png().toBuffer());
});
beforeEach(async () => {
  const { requireAdminApi } = await import("@/lib/admin/security");
  vi.mocked(requireAdminApi).mockResolvedValue({ user: { _id: "user:test-admin", type: "user", name: "Admin", email: "admin@example.com", phone: "", role: "admin", created_at: "2026-11-16" }, response: null });
});
afterAll(async () => {
  const images = path.join(directory, "uploads", "products");
  for (const name of await readdir(images).catch(() => [])) await unlink(path.join(images, name));
  await rmdir(images).catch(() => {});
  await rmdir(path.join(directory, "uploads")).catch(() => {});
  await rmdir(directory);
});

function request(file?: File) {
  const form = new FormData();
  if (file) form.append("file", file);
  return new Request("http://localhost/api/admin/uploads", { method: "POST", body: form });
}
const context = (filename: string) => ({ params: Promise.resolve({ filename }) });

describe("local product images", () => {
  it("uploads, persists and publicly serves a decoded WebP image", async () => {
    const response = await upload(request(new File([png], "../../arbitrary.png", { type: "image/png" })));
    expect(response.status).toBe(201);
    const { data } = await response.json();
    expect(data.url).toMatch(/^\/uploads\/products\/[a-f0-9-]+\.webp$/);
    expect(data.filename).not.toContain("arbitrary");
    const image = await serve(new Request(`http://localhost${data.url}`), context(data.filename));
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toBe("image/webp");
    expect(image.headers.get("x-content-type-options")).toBe("nosniff");
    expect(image.headers.get("cache-control")).toContain("immutable");
    const bytes = Buffer.from(await image.arrayBuffer());
    expect(bytes.length).toBe(data.size);
    expect(await sharp(bytes).metadata()).toMatchObject({ format: "webp", width: 12, height: 8 });
  });
  it.each([401, 403])("rejects uploads without admin access (%i)", async status => {
    const { requireAdminApi } = await import("@/lib/admin/security");
    vi.mocked(requireAdminApi).mockResolvedValue({ user: null, response: NextResponse.json({ error: { code: "DENIED", message: "Denied" } }, { status }) });
    expect((await upload(request())).status).toBe(status);
  });
  it("rejects cross-origin writes", async () => {
    const input = request(new File([png], "image.png", { type: "image/png" }));
    input.headers.set("origin", "https://other.example");
    expect((await upload(input)).status).toBe(403);
  });
  it("rejects missing and multiple files", async () => {
    expect((await upload(request())).status).toBe(400);
    const form = new FormData();
    form.append("file", new File([png], "a.png", { type: "image/png" }));
    form.append("file", new File([png], "b.png", { type: "image/png" }));
    expect((await upload(new Request("http://localhost/api/admin/uploads", { method: "POST", body: form }))).status).toBe(400);
  });
  it("rejects corrupt images, SVG and empty images", async () => {
    for (const file of [new File(["not a PNG"], "fake.png", { type: "image/png" }), new File(["<svg/>"], "image.svg", { type: "image/svg+xml" }), new File([], "empty.png", { type: "image/png" })]) {
      expect((await upload(request(file))).status).toBe(400);
    }
  });
  it("rejects files over 5 MB", async () => {
    expect((await upload(request(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", { type: "image/png" })))).status).toBe(413);
  });
  it("bounds a streamed request even without Content-Length", async () => {
    const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(MAX_IMAGE_BYTES + 65537)); controller.close(); } });
    const input = new Request("http://localhost/api/admin/uploads", { method: "POST", headers: { "Content-Type": "multipart/form-data; boundary=test" }, body, duplex: "half" } as RequestInit);
    expect((await upload(input)).status).toBe(413);
  });
  it("rejects malformed multipart bodies", async () => {
    const input = new Request("http://localhost/api/admin/uploads", { method: "POST", headers: { "Content-Type": "multipart/form-data" }, body: "invalid" });
    expect((await upload(input)).status).toBe(400);
  });
  it("resizes large valid images for display", async () => {
    const wide = new Uint8Array(await sharp({ create: { width: 3000, height: 10, channels: 3, background: "white" } }).png().toBuffer());
    const image = await save(new File([wide], "wide.png", { type: "image/png" }));
    const result = await serve(new Request("http://localhost"), context(image.filename));
    expect((await sharp(Buffer.from(await result.arrayBuffer())).metadata()).width).toBe(2000);
  });
  it.each(["../../README.md", "..%2F.env.local", ".gitkeep", "00000000-0000-4000-8000-000000000000.webp"])("returns 404 for invalid or missing paths: %s", async filename => {
    expect((await serve(new Request("http://localhost"), context(filename))).status).toBe(404);
  });
});
