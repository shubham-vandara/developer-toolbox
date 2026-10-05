import { describe, expect, it } from "vitest";
import {
  describeMime,
  detectImageMime,
  encodeBmp,
  encodeIco,
  fitWithin,
  getUserMessage,
  ImageToolError,
  isTruncatedImage,
  linkedDimension,
  validateDimensions,
} from "./image.js";

const bytes = (...values) => new Uint8Array(values);
const ascii = (text) => new TextEncoder().encode(text);

describe("detectImageMime", () => {
  it("detects formats from magic bytes", () => {
    expect(detectImageMime(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a))).toBe("image/png");
    expect(detectImageMime(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(detectImageMime(ascii("GIF89a"))).toBe("image/gif");
    expect(detectImageMime(ascii("RIFF\0\0\0\0WEBPVP8 "))).toBe("image/webp");
    expect(detectImageMime(ascii("BM\0\0\0\0"))).toBe("image/bmp");
    expect(detectImageMime(bytes(0, 0, 1, 0, 1, 0))).toBe("image/x-icon");
  });
  it("detects SVG text, including an XML prolog", () => {
    expect(detectImageMime(ascii('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBe("image/svg+xml");
    expect(detectImageMime(ascii("  <svg viewBox='0 0 1 1'></svg>"))).toBe("image/svg+xml");
  });
  it("returns null for unknown data", () => {
    expect(detectImageMime(ascii("hello world"))).toBeNull();
    expect(detectImageMime(bytes(1))).toBeNull();
  });
});

describe("isTruncatedImage", () => {
  const pngEnd = bytes(0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82);
  it("accepts complete PNG, JPEG and GIF files", () => {
    expect(isTruncatedImage("image/png", bytes(), pngEnd, 100)).toBe(false);
    expect(isTruncatedImage("image/jpeg", bytes(), bytes(1, 2, 0xff, 0xd9), 100)).toBe(false);
    expect(isTruncatedImage("image/jpeg", bytes(), bytes(0xff, 0xd9, 0, 0, 0), 100)).toBe(false); // trailing data is fine
    expect(isTruncatedImage("image/gif", bytes(), bytes(1, 2, 0x3b), 100)).toBe(false);
  });

  it("flags files cut off before their end marker", () => {
    expect(isTruncatedImage("image/png", bytes(), bytes(1, 2, 3, 4), 100)).toBe(true);
    expect(isTruncatedImage("image/jpeg", bytes(), bytes(0xff, 0xd8, 0xff, 0xe0), 100)).toBe(true);
  });

  it("checks the WebP RIFF size against the file size", () => {
    const head = ascii("RIFF\x5c\0\0\0WEBP"); // RIFF size 92 → file should be 100 bytes
    expect(isTruncatedImage("image/webp", head, bytes(), 100)).toBe(false);
    expect(isTruncatedImage("image/webp", head, bytes(), 60)).toBe(true);
  });

  it("does not judge formats it doesn't know", () => {
    expect(isTruncatedImage("image/avif", bytes(), bytes(), 10)).toBe(false);
  });
});

describe("describeMime", () => {
  it("returns friendly labels", () => {
    expect(describeMime("image/jpeg")).toBe("JPEG");
    expect(describeMime("image/heic")).toBe("HEIC");
    expect(describeMime("")).toBe("Unknown");
  });
});

describe("encodeBmp", () => {
  it("writes a valid 24-bit BMP with padded rows", async () => {
    // 1×1 half-transparent red pixel → blended with white.
    const blob = encodeBmp({ width: 1, height: 1, data: new Uint8ClampedArray([255, 0, 0, 128]) });
    const view = new DataView(await blob.arrayBuffer());
    expect(blob.type).toBe("image/bmp");
    expect(view.getUint8(0)).toBe(0x42);
    expect(view.getUint8(1)).toBe(0x4d);
    expect(view.getUint32(2, true)).toBe(58); // 54 header + 4-byte padded row
    expect(view.getUint16(28, true)).toBe(24);
    expect([view.getUint8(54), view.getUint8(55), view.getUint8(56)]).toEqual([127, 127, 255]); // BGR
  });
});

describe("encodeIco", () => {
  it("writes an ICO directory pointing at embedded PNGs", async () => {
    const png16 = bytes(1, 2, 3);
    const png256 = bytes(4, 5);
    const view = new DataView(await encodeIco([{ size: 16, bytes: png16 }, { size: 256, bytes: png256 }]).arrayBuffer());
    expect(view.getUint16(2, true)).toBe(1);
    expect(view.getUint16(4, true)).toBe(2);
    expect(view.getUint8(6)).toBe(16);
    expect(view.getUint8(22)).toBe(0); // 256 is stored as 0
    expect(view.getUint32(6 + 12, true)).toBe(38); // first image offset
    expect(view.getUint32(22 + 12, true)).toBe(41);
    expect(view.byteLength).toBe(43);
  });
});

describe("linkedDimension", () => {
  it("derives height from width and vice versa", () => {
    expect(linkedDimension(960, 1920, 1080, "width")).toBe(540);
    expect(linkedDimension(540, 1920, 1080, "height")).toBe(960);
  });

  it("never returns less than 1 and handles empty input", () => {
    expect(linkedDimension(1, 4000, 10, "width")).toBe(1);
    expect(linkedDimension("", 100, 100, "width")).toBe("");
    expect(linkedDimension(-5, 100, 100, "width")).toBe("");
  });
});

describe("validateDimensions", () => {
  it("accepts positive integers and rejects the rest", () => {
    expect(validateDimensions(100, 50)).toBeNull();
    expect(validateDimensions("", 50)).toMatch(/at least 1/);
    expect(validateDimensions(0, 50)).toMatch(/at least 1/);
    expect(validateDimensions(10.5, 50)).toMatch(/whole numbers/);
  });
});

describe("fitWithin", () => {
  it("scales down preserving aspect ratio, never up", () => {
    expect(fitWithin(4000, 2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
    expect(fitWithin(100, 50, 1000, 1000)).toEqual({ width: 100, height: 50 });
  });
});

describe("getUserMessage", () => {
  it("only exposes messages from ImageToolError", () => {
    expect(getUserMessage(new ImageToolError("Friendly"))).toBe("Friendly");
    expect(getUserMessage(new TypeError("x is undefined"), "Fallback")).toBe("Fallback");
    expect(getUserMessage(new RangeError("Array buffer allocation failed"))).toMatch(/out of memory/);
  });
});
