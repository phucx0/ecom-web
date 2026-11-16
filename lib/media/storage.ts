import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { IMAGE_UPLOAD_TYPES, MAX_IMAGE_BYTES, PRODUCT_IMAGE_PREFIX, productImageFilenamePattern } from "./images";

const imageDirectory = path.join(process.cwd(), "uploads", "products");

export class ImageUploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function saveProductImage(file: File) {
  if (!IMAGE_UPLOAD_TYPES.includes(file.type)) {
    throw new ImageUploadError("Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF.");
  }
  if (file.size === 0) throw new ImageUploadError("File ảnh không được để trống.");
  if (file.size > MAX_IMAGE_BYTES) throw new ImageUploadError("Mỗi ảnh tối đa 5 MB.", 413);

  let image: Buffer;
  try {
    // Decode and re-encode instead of trusting the extension or MIME type.
    // Limit decoded pixels; strip metadata and normalize orientation for display.
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25_000_000 });
    const metadata = await input.metadata();
    if (!["jpeg", "png", "webp", "gif"].includes(metadata.format || "")) throw new Error("Unsupported image");
    image = await input.rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch {
    throw new ImageUploadError("Ảnh không hợp lệ, bị hỏng hoặc vượt quá 25 triệu điểm ảnh.");
  }

  const filename = `${randomUUID()}.webp`;
  await mkdir(imageDirectory, { recursive: true });
  await writeFile(path.join(imageDirectory, filename), image, { flag: "wx" });
  return { url: `${PRODUCT_IMAGE_PREFIX}${filename}`, filename, size: image.length, type: "image/webp" };
}

export async function readProductImage(filename: string) {
  // A strict generated filename prevents directory traversal and arbitrary file reads.
  if (!productImageFilenamePattern.test(filename)) return null;
  try {
    return await readFile(path.join(imageDirectory, filename));
  } catch (error) {
    if (["ENOENT", "ENOTDIR"].includes((error as NodeJS.ErrnoException).code || "")) return null;
    throw error;
  }
}
