import { describe, expect, it } from "vitest";
import { findQualityForTargetSize, getCompressedDimensions, resolveAutoFormat } from "./imageCompressor.utils.js";

// Fake encoder: file size grows linearly with quality.
const fakeEncoder = (bytesAtFullQuality) => async (quality) => ({ size: Math.round(bytesAtFullQuality * quality) });

describe("resolveAutoFormat", () => {
  it("keeps JPEG and WebP, converts PNG to WebP", () => {
    expect(resolveAutoFormat("image/jpeg", true).id).toBe("jpeg");
    expect(resolveAutoFormat("image/webp", true).id).toBe("webp");
    expect(resolveAutoFormat("image/png", true).id).toBe("webp");
  });

  it("falls back to JPEG when WebP encoding is unavailable", () => {
    expect(resolveAutoFormat("image/png", false).id).toBe("jpeg");
    expect(resolveAutoFormat("image/webp", false).id).toBe("jpeg");
  });
});

describe("getCompressedDimensions", () => {
  it("keeps dimensions unless a max side is set", () => {
    expect(getCompressedDimensions(4000, 3000)).toEqual({ width: 4000, height: 3000 });
    expect(getCompressedDimensions(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
    expect(getCompressedDimensions(800, 600, 2000)).toEqual({ width: 800, height: 600 });
  });
});

describe("findQualityForTargetSize", () => {
  it("finds a quality that fits the target, as high as possible", async () => {
    const result = await findQualityForTargetSize(fakeEncoder(100_000), 50_000);
    expect(result.reachedTarget).toBe(true);
    expect(result.blob.size).toBeLessThanOrEqual(50_000);
    expect(result.quality).toBeGreaterThan(0.45);
  });

  it("reports when the target can't be reached and returns the smallest result", async () => {
    const result = await findQualityForTargetSize(fakeEncoder(100_000), 1_000);
    expect(result.reachedTarget).toBe(false);
    expect(result.blob.size).toBe(5_000); // quality 0.05
  });
});
