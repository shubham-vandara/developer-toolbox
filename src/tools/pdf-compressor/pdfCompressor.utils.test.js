import { describe, expect, it } from "vitest";
import { canDeflateStream, canRecompressImage, summarizeResult } from "./pdfCompressor.utils.js";

const jpeg = (overrides) => ({ filters: ["DCTDecode"], bitsPerComponent: 8, colorSpace: "DeviceRGB", ...overrides });

describe("canRecompressImage", () => {
  it("accepts 8-bit RGB, gray and 3/1-component ICC JPEGs", () => {
    expect(canRecompressImage(jpeg())).toBe(true);
    expect(canRecompressImage(jpeg({ colorSpace: "DeviceGray" }))).toBe(true);
    expect(canRecompressImage(jpeg({ colorSpace: "ICCBased", iccComponents: 3 }))).toBe(true);
    expect(canRecompressImage(jpeg({ bitsPerComponent: undefined }))).toBe(true);
  });

  it("leaves CMYK, decode arrays, masks and non-JPEG images alone", () => {
    expect(canRecompressImage(jpeg({ colorSpace: "DeviceCMYK" }))).toBe(false);
    expect(canRecompressImage(jpeg({ colorSpace: "ICCBased", iccComponents: 4 }))).toBe(false);
    expect(canRecompressImage(jpeg({ hasDecode: true }))).toBe(false);
    expect(canRecompressImage(jpeg({ imageMask: true }))).toBe(false);
    expect(canRecompressImage(jpeg({ filters: ["FlateDecode"] }))).toBe(false);
    expect(canRecompressImage(jpeg({ filters: ["FlateDecode", "DCTDecode"] }))).toBe(false);
  });
});

describe("canDeflateStream", () => {
  it("deflates large unfiltered content streams only", () => {
    expect(canDeflateStream({ hasFilter: false, size: 5000 })).toBe(true);
    expect(canDeflateStream({ hasFilter: true, size: 5000 })).toBe(false);
    expect(canDeflateStream({ hasFilter: false, size: 10 })).toBe(false);
    expect(canDeflateStream({ hasFilter: false, size: 5000, type: "Metadata" })).toBe(false);
    expect(canDeflateStream({ hasFilter: false, size: 5000, subtype: "Image" })).toBe(false);
  });
});

describe("summarizeResult", () => {
  it("reports savings honestly", () => {
    expect(summarizeResult(1000, 400)).toMatchObject({ improved: true, saved: 600, percent: 60 });
    expect(summarizeResult(1000, 1000).improved).toBe(false);
    expect(summarizeResult(1000, 1200).message).toMatch(/already well optimized/);
  });
});
