export const MAX_PRODUCT_IMAGES = 10;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const PRODUCT_IMAGE_PREFIX = "/uploads/products/";
export const productImageFilenamePattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.webp$/;

export function isLocalProductImage(value: string) {
  return value.startsWith(PRODUCT_IMAGE_PREFIX) && productImageFilenamePattern.test(value.slice(PRODUCT_IMAGE_PREFIX.length));
}
