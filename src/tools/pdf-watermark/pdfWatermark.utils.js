import { anchorCenter, rotatedBounds } from "../../utils/pdf/geometry.js";
import { textHeight } from "../../utils/pdf/stamp.js";

export const WATERMARK_IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"];
const MARGIN = 36;

// Approximate Helvetica-Bold advance width for the preview (≈0.6em per char).
const estimateTextWidth = (text, size) => text.length * size * 0.6;

/**
 * Where the watermark goes on a page (viewer space): its center and size.
 * Corner positions use the rotated bounding box so the mark stays inside the margin.
 * `font` (pdf-lib) gives exact text widths when exporting; the preview estimates.
 */
export function layoutWatermark(settings, viewer, imageSize, font) {
  let width;
  let height;
  if (settings.mode === "text") {
    if (!settings.text) return null;
    width = font ? font.widthOfTextAtSize(settings.text, settings.fontSize) : estimateTextWidth(settings.text, settings.fontSize);
    height = textHeight(settings.fontSize);
  } else {
    if (!imageSize) return null;
    width = (viewer.width * settings.scale) / 100;
    height = width * (imageSize.height / imageSize.width);
  }
  const bounds = rotatedBounds(width, height, settings.rotation);
  return { center: anchorCenter(settings.position, viewer.width, viewer.height, bounds.width, bounds.height, MARGIN), width, height };
}
