import { createCanvas, canvasToBlob, detectImageMime, releaseCanvas } from "../image.js";
import { loadPdfLib, savePdf, yieldToBrowser } from "./engine.js";
import { placeImage, resolvePageSize } from "./geometry.js";

/**
 * EXIF orientation (1–8) of a JPEG, or 1 if absent. Browsers apply it when
 * displaying, but a JPEG embedded byte-for-byte in a PDF would ignore it.
 */
export function getJpegOrientation(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return 1;
  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    const marker = view.getUint16(offset);
    const length = view.getUint16(offset + 2);
    if (marker === 0xffe1 && offset + 10 <= view.byteLength && view.getUint32(offset + 4) === 0x45786966) {
      const tiff = offset + 10;
      if (tiff + 8 > view.byteLength) return 1;
      const little = view.getUint16(tiff) === 0x4949;
      const ifd = tiff + view.getUint32(tiff + 4, little);
      if (ifd + 2 > view.byteLength) return 1;
      const entries = view.getUint16(ifd, little);
      for (let i = 0; i < entries; i += 1) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > view.byteLength) return 1;
        if (view.getUint16(entry, little) === 0x0112) return view.getUint16(entry + 8, little) || 1;
      }
      return 1;
    }
    if ((marker & 0xff00) !== 0xff00 || marker === 0xffda) return 1; // reached image data
    offset += 2 + length;
  }
  return 1;
}

async function toEmbeddable(file, bytes, mime) {
  if (mime === "image/png") return { kind: "png", bytes };
  if (mime === "image/jpeg" && getJpegOrientation(bytes) === 1) return { kind: "jpg", bytes };
  // Other formats (and rotated JPEGs): let the browser decode — applying EXIF
  // orientation — then re-encode losslessly as PNG (JPEG for opaque photos).
  const bitmap = await createImageBitmap(file);
  const { canvas, ctx } = createCanvas(bitmap.width, bitmap.height);
  try {
    ctx.drawImage(bitmap, 0, 0);
    const asJpeg = mime === "image/jpeg";
    const blob = await canvasToBlob(canvas, asJpeg ? "image/jpeg" : "image/png", asJpeg ? 0.95 : undefined);
    return { kind: asJpeg ? "jpg" : "png", bytes: new Uint8Array(await blob.arrayBuffer()) };
  } finally {
    bitmap.close();
    releaseCanvas(canvas);
  }
}

/**
 * Build a PDF with one image per page.
 * images: [{ file, width, height }] (display dimensions after EXIF orientation)
 * options: { pageSize: "a4"|"letter"|"original", orientation, fit, margin (pt) }
 */
export async function buildImagesPdf(images, { pageSize = "a4", orientation = "auto", fit = "fit", margin = 0 }, report) {
  const { PDFDocument, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } = await loadPdfLib();
  const doc = await PDFDocument.create();
  for (let i = 0; i < images.length; i += 1) {
    report?.(i, images.length, "Adding image");
    const { file, width, height } = images[i];
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = detectImageMime(bytes.subarray(0, 64));
    const source = await toEmbeddable(file, bytes, mime);
    const embedded = source.kind === "jpg" ? await doc.embedJpg(source.bytes) : await doc.embedPng(source.bytes);
    const size = resolvePageSize(pageSize, orientation, width, height);
    const page = doc.addPage([size.width, size.height]);
    const pageMargin = pageSize === "original" ? 0 : margin;
    const place = placeImage(width, height, size.width, size.height, { fit, margin: pageMargin });
    if (fit === "fill") {
      // Crop the overflowing image to the content box.
      const c = place.clip;
      page.pushOperators(pushGraphicsState(), rectangle(c.x, c.y, c.width, c.height), clip(), endPath());
      page.drawImage(embedded, place);
      page.pushOperators(popGraphicsState());
    } else {
      page.drawImage(embedded, place);
    }
    await yieldToBrowser();
  }
  report?.(0, 0, "Saving PDF…");
  return { blob: await savePdf(doc), pages: doc.getPageCount() };
}
