import { describe, expect, it } from "vitest";
import { defaultQualityFormat, presetForQuality } from "./imageQualityConverter.utils.js";

describe("presetForQuality", () => {
  it("maps known values to presets and others to custom", () => {
    expect(presetForQuality(40)).toBe("low");
    expect(presetForQuality(85)).toBe("high");
    expect(presetForQuality(72)).toBe("custom");
  });
});

describe("defaultQualityFormat", () => {
  it("keeps lossy source formats", () => {
    expect(defaultQualityFormat("image/jpeg", true)).toBe("jpeg");
    expect(defaultQualityFormat("image/webp", true)).toBe("webp");
  });

  it("picks WebP for lossless sources when available, else JPEG", () => {
    expect(defaultQualityFormat("image/png", true)).toBe("webp");
    expect(defaultQualityFormat("image/png", false)).toBe("jpeg");
  });
});
