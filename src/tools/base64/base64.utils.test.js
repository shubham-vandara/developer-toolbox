import { describe, expect, it } from "vitest";
import { decodeBase64, encodeBase64 } from "./base64.utils.js";

describe("encodeBase64", () => {
  it("encodes plain ASCII text", () => {
    expect(encodeBase64("Hello").value).toBe("SGVsbG8=");
  });

  it("encodes Unicode text correctly", () => {
    const result = encodeBase64("héllo 👋");
    expect(result.success).toBe(true);
    expect(decodeBase64(result.value).value).toBe("héllo 👋");
  });
});

describe("decodeBase64", () => {
  it("decodes a valid Base64 string", () => {
    expect(decodeBase64("SGVsbG8=").value).toBe("Hello");
  });

  it("returns a helpful error for invalid Base64", () => {
    const result = decodeBase64("not-valid-base64!!!");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid Base64");
  });
});
