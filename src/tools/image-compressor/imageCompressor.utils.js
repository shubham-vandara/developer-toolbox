import { fitWithin, getFormatByMime, isEncodingSupported, OUTPUT_FORMATS } from "../../utils/image.js";

export const QUALITY_BOUNDS = { min: 0.05, max: 0.95 };

/**
 * "Auto" output: keep JPEG/WebP as-is; turn lossless/legacy formats (PNG, GIF,
 * BMP…) into WebP when the browser can encode it (keeps transparency), else JPEG.
 */
export function resolveAutoFormat(sourceMime, webpSupported = isEncodingSupported("image/webp")) {
  const source = getFormatByMime(sourceMime);
  if (source?.id === "jpeg") return OUTPUT_FORMATS.jpeg;
  if (source?.id === "webp" && webpSupported) return OUTPUT_FORMATS.webp;
  return webpSupported ? OUTPUT_FORMATS.webp : OUTPUT_FORMATS.jpeg;
}

// Output dimensions when the user opted to cap the longest side.
export function getCompressedDimensions(width, height, maxSide) {
  if (!maxSide || maxSide <= 0) return { width, height };
  return fitWithin(width, height, maxSide, maxSide);
}

/**
 * Binary-search the quality setting so the encoded file fits `targetBytes`.
 * `encodeAt(quality)` must resolve to a Blob. Returns the best fitting result,
 * or the smallest one we found if the target can't be reached.
 */
export async function findQualityForTargetSize(encodeAt, targetBytes, { iterations = 7, ...bounds } = {}) {
  let low = bounds.min ?? QUALITY_BOUNDS.min;
  let high = bounds.max ?? QUALITY_BOUNDS.max;
  let best = null;
  let smallest = null;

  for (let i = 0; i < iterations; i += 1) {
    const quality = (low + high) / 2;
    const blob = await encodeAt(quality);
    if (!smallest || blob.size < smallest.blob.size) smallest = { blob, quality };
    if (blob.size <= targetBytes) {
      if (!best || quality > best.quality) best = { blob, quality };
      low = quality;
    } else {
      high = quality;
    }
  }

  if (!best) {
    const blob = await encodeAt(low);
    if (blob.size <= targetBytes) return { blob, quality: low, reachedTarget: true };
    const fallback = blob.size < smallest.blob.size ? { blob, quality: low } : smallest;
    return { ...fallback, reachedTarget: false };
  }
  return { ...best, reachedTarget: true };
}
