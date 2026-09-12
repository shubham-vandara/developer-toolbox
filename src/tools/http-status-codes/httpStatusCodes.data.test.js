import { describe, expect, it } from "vitest";
import { filterStatusCodes } from "./httpStatusCodes.data.js";

describe("filterStatusCodes", () => {
  it("returns all codes for an empty query and 'all' category", () => {
    expect(filterStatusCodes("", "all").length).toBeGreaterThan(20);
  });

  it("filters by category", () => {
    const results = filterStatusCodes("", "4xx");
    expect(results.every((item) => item.category === "4xx")).toBe(true);
  });

  it("searches by code number", () => {
    const results = filterStatusCodes("404");
    expect(results.some((item) => item.code === 404)).toBe(true);
  });

  it("searches by name", () => {
    const results = filterStatusCodes("not found");
    expect(results.some((item) => item.code === 404)).toBe(true);
  });
});
