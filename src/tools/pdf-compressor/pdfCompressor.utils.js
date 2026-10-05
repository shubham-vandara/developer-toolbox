// What the compressor can genuinely do in a browser — no rasterizing pages:
//  1. Lossless: compress streams that are stored uncompressed (FlateDecode via
//     the browser's CompressionStream) and pack objects into object streams.
//  2. Lossy (optional): re-encode embedded JPEG photos at a lower quality
//     and/or resolution. Only images whose colour handling we can reproduce
//     exactly (8-bit RGB/Gray JPEGs, no masks-as-images or decode arrays)
//     are touched; everything else (text, fonts, vectors, other images) is kept.

export const COMPRESSION_LEVELS = {
  lossless: {
    label: "Low",
    title: "Lossless",
    description: "Optimizes file structure only. Nothing visible changes.",
    images: null,
  },
  balanced: {
    label: "Medium",
    title: "Balanced",
    description: "Also re-encodes photos at 75% quality, max 2000 px.",
    images: { quality: 0.75, maxSide: 2000 },
  },
  strong: {
    label: "High",
    title: "Strong",
    description: "Re-encodes photos at 55% quality, max 1400 px. Photos may look softer.",
    images: { quality: 0.55, maxSide: 1400 },
  },
};

// Only replace an image if it gets meaningfully smaller.
export const MIN_SAVING_RATIO = 0.9;
// Tiny streams aren't worth compressing.
export const MIN_STREAM_SIZE = 256;

/**
 * Decide whether an image XObject can be safely re-encoded as baseline RGB JPEG.
 * info: { filters: string[], bitsPerComponent, colorSpace: string, iccComponents, imageMask, hasDecode }
 */
export function canRecompressImage(info) {
  if (info.filters.length !== 1 || info.filters[0] !== "DCTDecode") return false;
  if (info.imageMask || info.hasDecode) return false;
  if (info.bitsPerComponent !== undefined && info.bitsPerComponent !== 8) return false;
  if (info.colorSpace === "DeviceRGB" || info.colorSpace === "DeviceGray") return true;
  if (info.colorSpace === "ICCBased") return info.iccComponents === 3 || info.iccComponents === 1;
  return false; // CMYK, Indexed, Separation, Lab… are left alone.
}

/** Uncompressed, non-image, non-metadata streams can be deflated losslessly. */
export function canDeflateStream({ hasFilter, type, subtype, size }) {
  if (hasFilter || size < MIN_STREAM_SIZE) return false;
  if (type === "XRef" || type === "ObjStm" || type === "Metadata") return false;
  if (subtype === "Image") return false; // raw image data with no filter is rare; leave as-is
  return true;
}

export function summarizeResult(originalSize, newSize) {
  if (newSize >= originalSize) {
    return { improved: false, message: "This PDF is already well optimized — compression couldn't make it smaller." };
  }
  return { improved: true, saved: originalSize - newSize, percent: ((originalSize - newSize) / originalSize) * 100 };
}
