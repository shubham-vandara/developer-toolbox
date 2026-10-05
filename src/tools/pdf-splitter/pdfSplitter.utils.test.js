import { describe, expect, it } from "vitest";
import { getSplitPlan } from "./pdfSplitter.utils.js";

describe("getSplitPlan", () => {
  it("makes one file per typed range, in the typed order", () => {
    expect(getSplitPlan({ mode: "ranges", rangesText: "8-10, 1-3, 5", pageCount: 10 }).ranges).toEqual([
      [8, 10],
      [1, 3],
      [5, 5],
    ]);
  });

  it("splits every N pages and every page", () => {
    expect(getSplitPlan({ mode: "every", everyN: 4, pageCount: 10 }).ranges).toEqual([[1, 4], [5, 8], [9, 10]]);
    expect(getSplitPlan({ mode: "each", pageCount: 3 }).ranges).toHaveLength(3);
  });

  it("reports invalid input", () => {
    expect(getSplitPlan({ mode: "every", everyN: "", pageCount: 10 }).success).toBe(false);
    expect(getSplitPlan({ mode: "every", everyN: 0, pageCount: 10 }).success).toBe(false);
    expect(getSplitPlan({ mode: "ranges", rangesText: "11", pageCount: 10 }).error).toMatch(/doesn't exist/);
  });
});
