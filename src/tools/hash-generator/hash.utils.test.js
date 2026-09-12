import { describe, expect, it } from "vitest";
import { computeHash } from "./hash.utils.js";

describe("computeHash", () => {
  it("computes a known SHA-256 hash", async () => {
    const hash = await computeHash("hello", "SHA-256");
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  });

  it("computes a known SHA-1 hash", async () => {
    const hash = await computeHash("hello", "SHA-1");
    expect(hash).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
  });

  it("produces different hashes for different algorithms", async () => {
    const sha256 = await computeHash("hello", "SHA-256");
    const sha512 = await computeHash("hello", "SHA-512");
    expect(sha256).not.toBe(sha512);
    expect(sha512).toHaveLength(128);
  });

  it("handles empty input", async () => {
    const hash = await computeHash("", "SHA-256");
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
});
