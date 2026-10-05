import { describe, expect, it } from "vitest";
import { getJpegOrientation } from "./imagesToPdf.js";

// Minimal JPEG: SOI + APP1 Exif with a single Orientation entry.
function jpegWithOrientation(orientation, littleEndian = false) {
  const tiff = [];
  const u16 = (v) => (littleEndian ? [v & 0xff, v >> 8] : [v >> 8, v & 0xff]);
  const u32 = (v) => (littleEndian ? [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, v >>> 24] : [v >>> 24, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff]);
  tiff.push(...(littleEndian ? [0x49, 0x49] : [0x4d, 0x4d]), ...u16(42), ...u32(8));
  tiff.push(...u16(1), ...u16(0x0112), ...u16(3), ...u32(1), ...u16(orientation), 0, 0, ...u32(0));
  const exif = [0x45, 0x78, 0x69, 0x66, 0, 0, ...tiff];
  const length = exif.length + 2;
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, length >> 8, length & 0xff, ...exif, 0xff, 0xda, 0, 2]);
}

describe("getJpegOrientation", () => {
  it("reads the orientation tag in both byte orders", () => {
    expect(getJpegOrientation(jpegWithOrientation(6))).toBe(6);
    expect(getJpegOrientation(jpegWithOrientation(3, true))).toBe(3);
  });

  it("defaults to 1 without EXIF or for non-JPEG data", () => {
    expect(getJpegOrientation(new Uint8Array([0xff, 0xd8, 0xff, 0xda, 0, 2]))).toBe(1);
    expect(getJpegOrientation(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(1);
    expect(getJpegOrientation(new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0, 4, 0x45]))).toBe(1); // truncated
  });
});
