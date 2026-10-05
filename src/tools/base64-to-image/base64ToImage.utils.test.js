import { describe, expect, it } from "vitest";
import { parseBase64Image } from "./base64ToImage.utils.js";

const PNG_BASE64 = btoa(String.fromCharCode(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a));
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>';

describe("parseBase64Image", () => {
  it("decodes raw Base64 and detects the type from the bytes", () => {
    const result = parseBase64Image(PNG_BASE64);
    expect(result.success).toBe(true);
    expect(result.mime).toBe("image/png");
    expect(result.bytes[0]).toBe(0x89);
  });

  it("decodes a full data URL, ignoring whitespace and line breaks", () => {
    const wrapped = `data:image/png;base64,${PNG_BASE64.slice(0, 4)}\n${PNG_BASE64.slice(4)}`;
    const result = parseBase64Image(`  ${wrapped}  `);
    expect(result.success).toBe(true);
    expect(result.declaredMime).toBe("image/png");
    expect(result.warning).toBeNull();
  });

  it("accepts unpadded and URL-safe Base64", () => {
    expect(parseBase64Image(PNG_BASE64.replace(/=+$/, "")).success).toBe(true);
    const svg = btoa(SVG).replace(/\+/g, "-").replace(/\//g, "_");
    expect(parseBase64Image(svg).mime).toBe("image/svg+xml");
  });

  it("decodes URL-encoded SVG data URLs", () => {
    const result = parseBase64Image(`data:image/svg+xml,${encodeURIComponent(SVG)}`);
    expect(result.success).toBe(true);
    expect(result.mime).toBe("image/svg+xml");
  });

  it("warns when the declared MIME type doesn't match the content", () => {
    const result = parseBase64Image(`data:image/jpeg;base64,${PNG_BASE64}`);
    expect(result.success).toBe(true);
    expect(result.warning).toMatch(/says JPEG.*actually PNG/);
  });

  it("rejects invalid Base64, non-images and empty input", () => {
    expect(parseBase64Image("not base64 at all!!").error).toMatch(/isn't valid Base64/);
    expect(parseBase64Image("A").error).toMatch(/isn't valid Base64/);
    expect(parseBase64Image(btoa("hello world")).error).toMatch(/isn't a recognized image/);
    expect(parseBase64Image("   ").success).toBe(false);
    expect(parseBase64Image("data:image/png;base64").error).toMatch(/malformed/);
  });
});
