import { describeMime, detectImageMime } from "../../utils/image.js";

export const SUPPORTED_MIMES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/avif",
  "image/x-icon",
  "image/svg+xml",
];
// ~50 MB of decoded data.
export const MAX_INPUT_LENGTH = 70_000_000;

const DATA_URL = /^data:([^;,]*)((?:;[^;,]*)*),([\s\S]*)$/i;

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Parse a Base64 string or data URL into image bytes.
 * The actual type is detected from the bytes; the declared MIME is only a hint.
 */
export function parseBase64Image(input) {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, error: "Paste a Base64 string or a data URL." };
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { success: false, error: "This input is too large to decode in the browser (max ~50 MB of image data)." };
  }

  let declaredMime = null;
  let payload = trimmed;
  let bytes;

  const match = DATA_URL.exec(trimmed);
  if (match) {
    declaredMime = match[1].toLowerCase() || null;
    const isBase64 = /;base64/i.test(match[2]);
    payload = match[3];
    if (!isBase64) {
      // Plain (URL-encoded) data URLs are common for SVG.
      try {
        bytes = new TextEncoder().encode(decodeURIComponent(payload));
      } catch {
        return { success: false, error: "This data URL isn't Base64 and couldn't be URL-decoded." };
      }
    }
  } else if (/^data:/i.test(trimmed)) {
    return { success: false, error: "This data URL is malformed. Expected data:<mime>;base64,<data>." };
  }

  if (!bytes) {
    let base64 = payload.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64) || base64.length % 4 === 1) {
      return {
        success: false,
        error: "This isn't valid Base64. It may contain invalid characters or be cut off.",
      };
    }
    base64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    try {
      bytes = base64ToBytes(base64);
    } catch {
      return { success: false, error: "This isn't valid Base64 and couldn't be decoded." };
    }
  }

  if (bytes.length === 0) return { success: false, error: "The decoded data is empty." };

  const mime = detectImageMime(bytes);
  if (!mime || !SUPPORTED_MIMES.includes(mime)) {
    return {
      success: false,
      error: "The data decoded fine, but it isn't a recognized image (PNG, JPEG, WebP, GIF, BMP, AVIF, ICO or SVG).",
    };
  }

  const mismatch =
    declaredMime && declaredMime !== mime && !(declaredMime === "image/jpg" && mime === "image/jpeg")
      ? `The data URL says ${describeMime(declaredMime)}, but the content is actually ${describeMime(mime)}.`
      : null;

  return { success: true, mime, declaredMime, bytes, warning: mismatch };
}
