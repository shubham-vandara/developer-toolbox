import { describe, expect, it } from "vitest";
import { decodeJwt, formatJwtTimestamp } from "./jwt.utils.js";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("decodeJwt", () => {
  it("decodes a well-formed JWT's header and payload", () => {
    const result = decodeJwt(SAMPLE_JWT);
    expect(result.success).toBe(true);
    expect(result.header).toEqual({ alg: "HS256", typ: "JWT" });
    expect(result.payload).toEqual({ sub: "1234567890", name: "John Doe", iat: 1516239022 });
    expect(result.signature).toBeTruthy();
  });

  it("returns an error for empty input", () => {
    expect(decodeJwt("").success).toBe(false);
  });

  it("returns an error when the token doesn't have three parts", () => {
    const result = decodeJwt("not.a.jwt.token");
    expect(result.success).toBe(false);
    expect(result.error).toContain("three parts");
  });

  it("returns an error for malformed Base64/JSON segments", () => {
    const result = decodeJwt("not-base64.also-not-base64.signature");
    expect(result.success).toBe(false);
  });
});

describe("formatJwtTimestamp", () => {
  it("formats a numeric unix timestamp", () => {
    expect(formatJwtTimestamp(1516239022)).toBeTruthy();
  });

  it("returns null for non-numeric input", () => {
    expect(formatJwtTimestamp("not a number")).toBeNull();
    expect(formatJwtTimestamp(undefined)).toBeNull();
  });
});
