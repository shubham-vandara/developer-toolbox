// Browser-only image helpers shared by the image tools. Everything runs on a
// local <canvas>; no image data ever leaves the page.
import { MB } from "./file.js";

// Errors carrying a message that is safe to show to users as-is.
export class ImageToolError extends Error {
  constructor(message) {
    super(message);
    this.name = "ImageToolError";
  }
}

export const MAX_IMAGE_FILE_SIZE = 50 * MB;
// Decoded pixels cost ~4 bytes each, so 100 MP is already ~400 MB of RAM.
export const MAX_IMAGE_PIXELS = 100_000_000;
// Conservative cross-browser canvas limits (Safari/iOS are the strictest).
export const MAX_CANVAS_SIDE = 16384;
export const MAX_CANVAS_PIXELS = 16384 * 16384;

export const RASTER_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif,.png,.jpg,.jpeg,.webp,.gif,.bmp,.avif";

export const OUTPUT_FORMATS = {
  png: { id: "png", label: "PNG", mime: "image/png", extension: "png", lossy: false, alpha: true },
  jpeg: { id: "jpeg", label: "JPEG", mime: "image/jpeg", extension: "jpg", lossy: true, alpha: false },
  webp: { id: "webp", label: "WebP", mime: "image/webp", extension: "webp", lossy: true, alpha: true },
  bmp: { id: "bmp", label: "BMP", mime: "image/bmp", extension: "bmp", lossy: false, alpha: false },
};

const MIME_LABELS = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/jpg": "JPEG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/x-ms-bmp": "BMP",
  "image/avif": "AVIF",
  "image/svg+xml": "SVG",
  "image/x-icon": "ICO",
  "image/vnd.microsoft.icon": "ICO",
};

const MIME_EXTENSIONS = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
};

export function describeMime(mime) {
  return MIME_LABELS[mime] ?? (mime ? mime.replace(/^image\//, "").toUpperCase() : "Unknown");
}

export function extensionForMime(mime) {
  return MIME_EXTENSIONS[mime] ?? "img";
}

export function getFormatByMime(mime) {
  if (mime === "image/jpg") return OUTPUT_FORMATS.jpeg;
  return Object.values(OUTPUT_FORMATS).find((format) => format.mime === mime) ?? null;
}

// Identify an image from its first bytes, regardless of file name or claimed type.
export function detectImageMime(bytes) {
  if (!bytes || bytes.length < 4) return null;
  const b = bytes;
  const ascii = (start, length) => String.fromCharCode(...b.subarray(start, start + length));
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (b[0] === 0x42 && b[1] === 0x4d) return "image/bmp";
  if (b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00) return "image/x-icon";
  if (b.length >= 12 && ascii(4, 4) === "ftyp" && /avi[fs]/.test(ascii(8, 4))) return "image/avif";
  const head = new TextDecoder().decode(b.subarray(0, Math.min(b.length, 1024))).trimStart();
  if (/^(<\?xml[\s\S]*?\?>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) {
    return "image/svg+xml";
  }
  return null;
}

/**
 * Browsers happily display truncated images (e.g. an interrupted download),
 * so check the format's end marker. `tail` is the last few KB of the file and
 * `head` its first bytes. Lenient by design: unknown formats pass.
 */
export function isTruncatedImage(mime, head, tail, size) {
  const ascii = (bytes) => String.fromCharCode(...bytes);
  const indexOfBytes = (bytes, pattern) => {
    for (let i = bytes.length - pattern.length; i >= 0; i -= 1) {
      if (pattern.every((value, j) => bytes[i + j] === value)) return i;
    }
    return -1;
  };
  switch (mime) {
    case "image/png":
      return !ascii(tail.subarray(Math.max(0, tail.length - 64))).includes("IEND");
    case "image/jpeg":
      return indexOfBytes(tail, [0xff, 0xd9]) === -1;
    case "image/gif":
      return !tail.subarray(Math.max(0, tail.length - 16)).includes(0x3b);
    case "image/webp": {
      if (head.length < 8) return true;
      const riffSize = head[4] | (head[5] << 8) | (head[6] << 16) | (head[7] << 24);
      return riffSize + 8 > size;
    }
    default:
      return false;
  }
}

const encodeSupport = new Map();

// Canvas silently falls back to PNG for formats it can't encode, so probe once.
export function isEncodingSupported(mime) {
  if (mime === OUTPUT_FORMATS.bmp.mime || mime === OUTPUT_FORMATS.png.mime) return true;
  if (encodeSupport.has(mime)) return encodeSupport.get(mime);
  let supported = false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    supported = canvas.toDataURL(mime).startsWith(`data:${mime}`);
  } catch {
    supported = false;
  }
  encodeSupport.set(mime, supported);
  return supported;
}

export function getFormatOptions(ids = ["png", "jpeg", "webp"]) {
  return ids
    .map((id) => OUTPUT_FORMATS[id])
    .filter((format) => isEncodingSupported(format.mime))
    .map((format) => ({ value: format.id, label: format.label }));
}

export function validateImageFile(file, { maxSize = MAX_IMAGE_FILE_SIZE } = {}) {
  if (!file) throw new ImageToolError("No file selected.");
  if (file.size === 0) throw new ImageToolError("This file is empty.");
  if (file.size > maxSize) {
    throw new ImageToolError(
      `This file is too large (max ${Math.round(maxSize / MB)} MB). Try a smaller image.`,
    );
  }
}

const UNREADABLE = "This image couldn't be read. It may be corrupted or in a format your browser doesn't support.";

/**
 * Load and fully decode an image. Browsers fire `load` for truncated files
 * whose header is intact, so a failed decode() is treated as corruption.
 * Pass `verifyDecode: false` for SVG, where some browsers reject decode()
 * even for valid files.
 */
export function loadImage(src, { verifyDecode = true } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!img.decode) {
        resolve(img);
        return;
      }
      img.decode().then(
        () => resolve(img),
        () => (verifyDecode ? reject(new ImageToolError(UNREADABLE)) : resolve(img)),
      );
    };
    img.onerror = () => reject(new ImageToolError(UNREADABLE));
    img.src = src;
  });
}

export function assertPixelBudget(width, height) {
  if (width * height > MAX_IMAGE_PIXELS) {
    throw new ImageToolError(
      `This image is ${width.toLocaleString()} × ${height.toLocaleString()} px, which is too large to process safely in the browser.`,
    );
  }
}

export function assertCanvasSize(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new ImageToolError("Width and height must be at least 1 pixel.");
  }
  if (width > MAX_CANVAS_SIDE || height > MAX_CANVAS_SIDE || width * height > MAX_CANVAS_PIXELS) {
    throw new ImageToolError(
      `The output size is too large. Keep each side under ${MAX_CANVAS_SIDE.toLocaleString()} px.`,
    );
  }
}

export function createCanvas(width, height) {
  assertCanvasSize(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageToolError("Your browser couldn't create a drawing surface for this image.");
  return { canvas, ctx };
}

// Shrink the canvas backing store so browsers (notably Safari) free memory early.
export function releaseCanvas(canvas) {
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * Draw `source` (an <img>, canvas or ImageBitmap) into a new canvas.
 * Large downscales are done in halving steps, which looks much better than a
 * single drawImage call (which tends to alias).
 */
export function drawToCanvas(source, width, height, { crop, background, smoothing = true } = {}) {
  const sourceWidth = source.naturalWidth || source.width;
  const sourceHeight = source.naturalHeight || source.height;
  let region = crop ?? { x: 0, y: 0, width: sourceWidth, height: sourceHeight };
  let current = source;
  const temporary = [];

  if (smoothing) {
    while (region.width / 2 >= width && region.height / 2 >= height) {
      const stepWidth = Math.max(1, Math.round(region.width / 2));
      const stepHeight = Math.max(1, Math.round(region.height / 2));
      const step = createCanvas(stepWidth, stepHeight);
      step.ctx.imageSmoothingQuality = "high";
      step.ctx.drawImage(current, region.x, region.y, region.width, region.height, 0, 0, stepWidth, stepHeight);
      temporary.push(step.canvas);
      current = step.canvas;
      region = { x: 0, y: 0, width: stepWidth, height: stepHeight };
    }
  }

  const { canvas, ctx } = createCanvas(width, height);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingEnabled = smoothing;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(current, region.x, region.y, region.width, region.height, 0, 0, width, height);
  temporary.forEach(releaseCanvas);
  return canvas;
}

export function canvasToBlob(canvas, mime = "image/png", quality) {
  if (mime === OUTPUT_FORMATS.bmp.mime) {
    const ctx = canvas.getContext("2d");
    return Promise.resolve(encodeBmp(ctx.getImageData(0, 0, canvas.width, canvas.height)));
  }
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new ImageToolError("Your browser couldn't create the output image. Try a smaller size."));
          } else if (blob.type !== mime) {
            reject(new ImageToolError(`Your browser can't save ${describeMime(mime)} images. Choose another format.`));
          } else {
            resolve(blob);
          }
        },
        mime,
        quality,
      );
    } catch {
      reject(new ImageToolError("Your browser couldn't create the output image."));
    }
  });
}

// 24-bit uncompressed BMP. Transparent pixels are composited onto white.
export function encodeBmp({ width, height, data }) {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const buffer = new ArrayBuffer(54 + pixelBytes);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, buffer.byteLength, true);
  view.setUint32(10, 54, true); // pixel data offset
  view.setUint32(14, 40, true); // BITMAPINFOHEADER size
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive = bottom-up rows
  view.setUint16(26, 1, true); // planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelBytes, true);
  view.setInt32(38, 2835, true); // 72 DPI
  view.setInt32(42, 2835, true);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = 54 + (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3] / 255;
      const blend = (channel) => Math.round(channel * alpha + 255 * (1 - alpha));
      const o = rowOffset + x * 3;
      bytes[o] = blend(data[i + 2]);
      bytes[o + 1] = blend(data[i + 1]);
      bytes[o + 2] = blend(data[i]);
    }
  }
  return new Blob([buffer], { type: "image/bmp" });
}

// ICO container with embedded PNG images (supported by all modern browsers).
export function encodeIco(entries) {
  const headerSize = 6 + entries.length * 16;
  const total = headerSize + entries.reduce((sum, entry) => sum + entry.bytes.length, 0);
  const buffer = new ArrayBuffer(total);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, entries.length, true);

  let offset = headerSize;
  entries.forEach((entry, index) => {
    const dir = 6 + index * 16;
    view.setUint8(dir, entry.size >= 256 ? 0 : entry.size);
    view.setUint8(dir + 1, entry.size >= 256 ? 0 : entry.size);
    view.setUint8(dir + 2, 0); // palette size
    view.setUint8(dir + 3, 0);
    view.setUint16(dir + 4, 1, true); // color planes
    view.setUint16(dir + 6, 32, true); // bits per pixel
    view.setUint32(dir + 8, entry.bytes.length, true);
    view.setUint32(dir + 12, offset, true);
    bytes.set(entry.bytes, offset);
    offset += entry.bytes.length;
  });
  return new Blob([buffer], { type: "image/x-icon" });
}

// When the aspect ratio is locked, derive the other side from the one edited.
export function linkedDimension(value, sourceWidth, sourceHeight, changed) {
  if (value === "" || !Number.isFinite(value) || value <= 0) return "";
  const ratio = sourceWidth / sourceHeight;
  const result = changed === "width" ? value / ratio : value * ratio;
  return Math.max(1, Math.round(result));
}

export function validateDimensions(width, height) {
  if (width === "" || height === "" || !(width >= 1) || !(height >= 1)) {
    return "Enter a width and height of at least 1 pixel.";
  }
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return "Width and height must be whole numbers.";
  }
  return null;
}

// Scale (width, height) down to fit inside a box, never upscaling.
export function fitWithin(width, height, maxWidth, maxHeight) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function getUserMessage(error, fallback = "Something went wrong while processing this image.") {
  if (error instanceof ImageToolError) return error.message;
  if (error instanceof RangeError || /memory|allocation/i.test(String(error?.message))) {
    return "Your browser ran out of memory processing this image. Try a smaller image or output size.";
  }
  return fallback;
}

// Draw + encode in one step, freeing the intermediate canvas afterwards.
export async function encodeImage(source, { width, height, format = OUTPUT_FORMATS.png, quality, background, crop, smoothing }) {
  const fill = background ?? (format.alpha ? undefined : "#ffffff");
  const canvas = drawToCanvas(source, width, height, { crop, background: fill, smoothing });
  try {
    return await canvasToBlob(canvas, format.mime, format.lossy ? quality : undefined);
  } finally {
    releaseCanvas(canvas);
  }
}
