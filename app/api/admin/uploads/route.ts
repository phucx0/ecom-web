import { NextResponse } from "next/server";
import { rejectCrossOrigin, requireAdminApi } from "@/lib/admin/security";
import { MAX_IMAGE_BYTES } from "@/lib/media/images";
import { ImageUploadError, saveProductImage } from "@/lib/media/storage";

export const runtime = "nodejs";
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;

async function readUpload(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    throw new ImageUploadError("Gửi ảnh bằng multipart/form-data với trường file.");
  }
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_BYTES) {
    throw new ImageUploadError("Mỗi ảnh tối đa 5 MB.", 413);
  }
  if (!request.body) throw new ImageUploadError("Vui lòng chọn một ảnh.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new ImageUploadError("Mỗi ảnh tối đa 5 MB.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try {
    return await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch { throw new ImageUploadError("Dữ liệu tải ảnh không hợp lệ."); }
}

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;
  const rejected = rejectCrossOrigin(request);
  if (rejected) return rejected;
  try {
    const form = await readUpload(request);
    const files = form.getAll("file");
    if (files.length !== 1 || !(files[0] instanceof File)) throw new ImageUploadError("Vui lòng chọn đúng một ảnh cho mỗi yêu cầu.");
    return NextResponse.json({ data: await saveProductImage(files[0]) }, { status: 201 });
  } catch (error) {
    if (error instanceof ImageUploadError) {
      return NextResponse.json({ error: { code: "INVALID_IMAGE", message: error.message } }, { status: error.status });
    }
    console.error("Không thể lưu ảnh sản phẩm:", error);
    return NextResponse.json({ error: { code: "IMAGE_UPLOAD_FAILED", message: "Không thể lưu ảnh. Vui lòng thử lại." } }, { status: 500 });
  }
}
