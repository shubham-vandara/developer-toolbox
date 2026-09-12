import { describe, expect, it } from "vitest";
import { percentChange, percentOf, whatPercent } from "./percentageCalculator.utils.js";

describe("percentOf", () => {
  it("computes X% of Y", () => {
    expect(percentOf(25, 200)).toEqual({ success: true, value: 50 });
  });

  it("returns an error for non-numeric input", () => {
    expect(percentOf("abc", 200).success).toBe(false);
  });
});

describe("whatPercent", () => {
  it("computes what percent X is of Y", () => {
    expect(whatPercent(50, 200)).toEqual({ success: true, value: 25 });
  });

  it("returns an error when the total is zero", () => {
    expect(whatPercent(1, 0).success).toBe(false);
  });
});

describe("percentChange", () => {
  it("computes a percentage increase", () => {
    expect(percentChange(50, 75)).toEqual({ success: true, value: 50 });
  });

  it("computes a percentage decrease", () => {
    expect(percentChange(200, 150)).toEqual({ success: true, value: -25 });
  });

  it("returns an error when the starting value is zero", () => {
    expect(percentChange(0, 10).success).toBe(false);
  });
});
