import { RASTER_MIMES } from "../../hooks/useImageFile.js";
import { describeMime, detectImageMime, ImageToolError, isTruncatedImage, loadImage, MAX_IMAGE_FILE_SIZE, RASTER_IMAGE_ACCEPT, validateImageFile } from "../image.js";

export const IMAGE_ACCEPT = RASTER_IMAGE_ACCEPT;

// Validate an image by its real bytes and read its display size (EXIF applied).
export async function analyzeImageFile(file) {
  validateImageFile(file, { maxSize: MAX_IMAGE_FILE_SIZE });
  const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
  const mime = detectImageMime(head);
  if (!mime || !RASTER_MIMES.includes(mime)) {
    throw new ImageToolError(mime ? `${describeMime(mime)} images aren't supported here.` : "This file isn't a supported image.");
  }
  const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 4096)).arrayBuffer());
  if (isTruncatedImage(mime, head, tail, file.size)) throw new ImageToolError("This image appears to be incomplete or corrupted.");
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    return { mime, width: image.naturalWidth, height: image.naturalHeight, url };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function releaseImageItem(item) {
  if (item.meta?.url) URL.revokeObjectURL(item.meta.url);
}

// pdf-lib embeds PNG and JPEG; convert anything else (WebP) to PNG first.
export async function imageFileToEmbeddableBytes(file, mime) {
  if (mime === "image/png" || mime === "image/jpeg") return new Uint8Array(await file.arrayBuffer());
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  canvas.width = 0;
  return new Uint8Array(await blob.arrayBuffer());
}
