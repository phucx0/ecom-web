"use client";

import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { ProductImage } from "@/components/catalog/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientRequest } from "@/lib/client-request";
import { IMAGE_UPLOAD_TYPES, MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/media/images";

export function ProductImages({ initialImages = [], onUploadingChange }: { initialImages?: string[]; onUploadingChange: (value: boolean) => void }) {
  const [value, setValue] = useState(initialImages.join("\n"));
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const images = value.split("\n").map(url => url.trim()).filter(Boolean);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    event.currentTarget.value = "";
    if (!files.length || busy.current) return;
    setError("");
    setStatus("");
    if (images.length + files.length > MAX_PRODUCT_IMAGES) {
      setError(`Mỗi sản phẩm tối đa ${MAX_PRODUCT_IMAGES} ảnh. Bạn có thể thêm ${Math.max(0, MAX_PRODUCT_IMAGES - images.length)} ảnh.`);
      return;
    }
    const invalid = files.find(file => !IMAGE_UPLOAD_TYPES.includes(file.type) || file.size === 0 || file.size > MAX_IMAGE_BYTES);
    if (invalid) {
      setError(`${invalid.name}: chọn ảnh JPG, PNG, WebP hoặc GIF không rỗng, tối đa 5 MB.`);
      return;
    }
    busy.current = true;
    setUploading(true);
    onUploadingChange(true);
    let uploaded = 0;
    try {
      for (const file of files) {
        setStatus(`Đang tải ảnh ${uploaded + 1}/${files.length}: ${file.name}`);
        const form = new FormData();
        form.append("file", file);
        const result = await clientRequest<{ url: string }>("/api/admin/uploads", { method: "POST", body: form });
        setValue(previous => [previous.trim(), result.url].filter(Boolean).join("\n"));
        uploaded++;
      }
      setStatus(`Đã tải ${uploaded} ảnh. Lưu sản phẩm để áp dụng.`);
    } catch (error) {
      setError((error as Error).message);
      setStatus(uploaded ? `Đã giữ ${uploaded} ảnh tải thành công. Chọn lại các ảnh còn lại để thử lại.` : "");
    } finally {
      busy.current = false;
      setUploading(false);
      onUploadingChange(false);
    }
  }

  return <div className="space-y-4 sm:col-span-2" aria-busy={uploading}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Label htmlFor="product-image-files" className="flex items-center gap-2"><ImagePlus className="size-4" aria-hidden="true" />Hình ảnh sản phẩm</Label>
      <span className="text-sm text-muted-foreground">{images.length}/{MAX_PRODUCT_IMAGES} ảnh</span>
    </div>
    <div className="space-y-3 rounded-xl border border-dashed bg-subtle p-4">
      <p id="image-upload-hint" className="text-sm text-muted-foreground">Chọn ảnh từ máy tính. JPG, PNG, WebP hoặc GIF, tối đa 5 MB/ảnh. Ảnh đầu tiên là ảnh đại diện; GIF được lưu thành ảnh tĩnh.</p>
      <Input id="product-image-files" type="file" multiple accept={IMAGE_UPLOAD_TYPES.join(",")} disabled={uploading || images.length >= MAX_PRODUCT_IMAGES} onChange={upload} aria-describedby="image-upload-hint image-upload-status" aria-invalid={!!error} className="min-h-11 cursor-pointer bg-surface file:mr-3 file:cursor-pointer file:font-medium" />
      <p id="image-upload-status" role="status" className="flex items-center gap-2 text-sm text-muted-foreground">{uploading && <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />}{status || (images.length ? "Ảnh đã chọn sẽ hiển thị sau khi lưu sản phẩm." : "Chưa có ảnh. Bạn có thể chọn nhiều ảnh cùng lúc.")}</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
    {images.length > 0 && <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Ảnh sản phẩm đã chọn">
      {images.map((src, index) => <li key={`${src}-${index}`} className="min-w-0 overflow-hidden rounded-xl border bg-surface">
        <div className="relative aspect-square bg-subtle"><ProductImage src={src} alt={`Ảnh sản phẩm ${index + 1}`} sizes="(max-width: 640px) 40vw, 180px" /></div>
        <div className="space-y-2 p-2">
          <div className="flex items-center justify-between gap-1"><span className="text-xs font-medium">{index === 0 ? "Ảnh đại diện" : `Ảnh ${index + 1}`}</span><Button type="button" variant="ghost" disabled={uploading} onClick={() => setValue(images.filter((_, i) => i !== index).join("\n"))} aria-label={`Gỡ ảnh ${index + 1} khỏi sản phẩm`} className="size-11 shrink-0 p-0"><X className="size-4" aria-hidden="true" /></Button></div>
          {index > 0 && <Button type="button" variant="outline" className="min-h-11 w-full whitespace-normal text-xs" disabled={uploading} onClick={() => setValue([src, ...images.filter((_, i) => i !== index)].join("\n"))}>Đặt làm ảnh đại diện</Button>}
        </div>
      </li>)}
    </ul>}
    <details className="rounded-lg border p-3">
      <summary className="cursor-pointer text-sm font-medium">Nhập hoặc chỉnh sửa đường dẫn ảnh</summary>
      <div className="mt-3 space-y-2"><Label htmlFor="images">Đường dẫn ảnh</Label><Textarea id="images" name="images" value={value} onChange={event => setValue(event.target.value)} disabled={uploading} aria-describedby="images-hint" /><p id="images-hint" className="text-xs text-muted-foreground">Mỗi dòng một URL hoặc đường dẫn ảnh local được trả về sau khi tải lên. Gỡ ảnh chỉ bỏ liên kết khỏi sản phẩm.</p></div>
    </details>
  </div>;
}
