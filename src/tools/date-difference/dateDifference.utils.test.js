import { describe, expect, it } from "vitest";
import { calculateDateDifference } from "./dateDifference.utils.js";

describe("calculateDateDifference", () => {
  it("computes years, months and days between two dates", () => {
    const result = calculateDateDifference("2024-01-01", "2025-03-15");
    expect(result.success).toBe(true);
    expect(result).toMatchObject({ years: 1, months: 2, days: 14, totalDays: 439 });
  });

  it("returns all zeros for identical dates", () => {
    const result = calculateDateDifference("2024-01-01", "2024-01-01");
    expect(result).toMatchObject({ years: 0, months: 0, days: 0, totalDays: 0 });
  });

  it("handles reversed dates gracefully by swapping them", () => {
    const result = calculateDateDifference("2024-03-15", "2024-01-01");
    expect(result.success).toBe(true);
    expect(result.reversed).toBe(true);
    expect(result).toMatchObject({ months: 2, days: 14, totalDays: 74 });
  });

  it("returns an error when a date is missing", () => {
    expect(calculateDateDifference("", "2024-01-01").success).toBe(false);
    expect(calculateDateDifference("2024-01-01", "").success).toBe(false);
  });

  it("returns an error for an invalid date string", () => {
    expect(calculateDateDifference("not a date", "2024-01-01").success).toBe(false);
  });
});
