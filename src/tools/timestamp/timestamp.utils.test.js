import { describe, expect, it } from "vitest";
import {
  parseDateInput,
  parseTimestamp,
  toUnixMilliseconds,
  toUnixSeconds,
} from "./timestamp.utils.js";

describe("parseTimestamp", () => {
  it("parses seconds correctly", () => {
    const result = parseTimestamp("1700000000", "seconds");
    expect(result.success).toBe(true);
    expect(toUnixSeconds(result.date)).toBe(1700000000);
  });

  it("parses milliseconds correctly", () => {
    const result = parseTimestamp("1700000000000", "milliseconds");
    expect(result.success).toBe(true);
    expect(toUnixMilliseconds(result.date)).toBe(1700000000000);
  });

  it("rejects non-numeric input", () => {
    expect(parseTimestamp("not-a-number", "seconds").success).toBe(false);
  });

  it("rejects empty input", () => {
    expect(parseTimestamp("", "seconds").success).toBe(false);
  });
});

describe("parseDateInput", () => {
  it("parses a valid ISO date", () => {
    const result = parseDateInput("2024-01-01T12:00:00Z");
    expect(result.success).toBe(true);
  });

  it("rejects an invalid date string", () => {
    const result = parseDateInput("not a real date");
    expect(result.success).toBe(false);
  });
});
