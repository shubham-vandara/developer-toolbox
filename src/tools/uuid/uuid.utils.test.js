import { describe, expect, it } from "vitest";
import { generateUuid, generateUuids, UUID_V4_PATTERN } from "./uuid.utils.js";

describe("generateUuid", () => {
  it("produces a valid v4 UUID", () => {
    expect(generateUuid()).toMatch(UUID_V4_PATTERN);
  });

  it("produces different values on each call", () => {
    expect(generateUuid()).not.toBe(generateUuid());
  });
});

describe("generateUuids", () => {
  it("generates the requested quantity", () => {
    expect(generateUuids(10)).toHaveLength(10);
  });

  it("generates only unique values", () => {
    const uuids = generateUuids(50);
    expect(new Set(uuids).size).toBe(50);
  });

  it("clamps quantity to at least 1", () => {
    expect(generateUuids(0)).toHaveLength(1);
  });
});
