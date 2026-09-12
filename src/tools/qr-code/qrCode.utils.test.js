import { describe, expect, it } from "vitest";
import { generateQrCodeDataUrl } from "./qrCode.utils.js";

describe("generateQrCodeDataUrl", () => {
  it("generates a PNG data URL for valid text", async () => {
    const result = await generateQrCodeDataUrl("https://example.com");
    expect(result.success).toBe(true);
    expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("returns an error for empty input", async () => {
    const result = await generateQrCodeDataUrl("");
    expect(result.success).toBe(false);
  });

  it("returns an error when the input is too large to encode", async () => {
    const result = await generateQrCodeDataUrl("x".repeat(5000));
    expect(result.success).toBe(false);
  });
});
