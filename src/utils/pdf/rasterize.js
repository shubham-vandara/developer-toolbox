import { assertCanvasSize, canvasToBlob, ImageToolError, releaseCanvas } from "../image.js";
import { renderPage, yieldToBrowser } from "./engine.js";

export const DPI_OPTIONS = [72, 150, 200, 300];

/**
 * Render pages of a PDF.js document to image blobs, one page at a time so
 * only a single page bitmap exists in memory at once.
 * format: an OUTPUT_FORMATS entry from utils/image.js.
 */
export async function rasterizePages(doc, pageNumbers, { dpi = 150, format, quality = 0.9 }, report) {
  const results = [];
  for (let i = 0; i < pageNumbers.length; i += 1) {
    const pageNumber = pageNumbers[i];
    report?.(i, pageNumbers.length, "Rendering page");
    const page = await doc.getPage(pageNumber);
    const scale = dpi / 72;
    const viewport = page.getViewport({ scale, rotation: page.rotate });
    try {
      assertCanvasSize(Math.floor(viewport.width), Math.floor(viewport.height));
    } catch {
      throw new ImageToolError(`Page ${pageNumber} is too large to render at ${dpi} DPI. Choose a lower resolution.`);
    }
    const canvas = document.createElement("canvas");
    try {
      await renderPage(page, canvas, { scale }).promise;
      const blob = await canvasToBlob(canvas, format.mime, format.lossy ? quality : undefined);
      results.push({ pageNumber, blob, width: canvas.width, height: canvas.height });
    } finally {
      releaseCanvas(canvas);
      page.cleanup();
    }
    await yieldToBrowser();
  }
  return results;
}
