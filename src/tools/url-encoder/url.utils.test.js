import { describe, expect, it } from "vitest";
import { transformUrl } from "./url.utils.js";

describe("transformUrl", () => {
  it("encodes a full URI, preserving reserved characters", () => {
    const result = transformUrl("https://example.com/a b?x=1&y=2", "encode-uri");
    expect(result.success).toBe(true);
    expect(result.value).toBe("https://example.com/a%20b?x=1&y=2");
  });

  it("encodes a URI component, escaping reserved characters", () => {
    const result = transformUrl("a b&c=d", "encode-component");
    expect(result.value).toBe("a%20b%26c%3Dd");
  });

  it("decodes a URI component back to the original text", () => {
    const result = transformUrl("a%20b%26c%3Dd", "decode-component");
    expect(result.value).toBe("a b&c=d");
  });

  it("handles Unicode correctly", () => {
    const encoded = transformUrl("héllo 👋", "encode-component");
    const decoded = transformUrl(encoded.value, "decode-component");
    expect(decoded.value).toBe("héllo 👋");
  });

  it("returns a helpful error for malformed encoded input", () => {
    const result = transformUrl("100% off%", "decode-uri");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid URL-encoded string");
  });
});
