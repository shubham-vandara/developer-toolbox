import { describe, expect, it } from "vitest";
import { formatPageList, parsePageRanges, rangeLabel, splitEveryN } from "./pageRanges.js";

describe("parsePageRanges", () => {
  it("parses single pages and ranges, keeping range order", () => {
    const result = parsePageRanges("8-10, 1-3, 5", 12);
    expect(result.success).toBe(true);
    expect(result.ranges).toEqual([[8, 10], [1, 3], [5, 5]]);
    expect(result.pages).toEqual([1, 2, 3, 5, 8, 9, 10]);
  });

  it("supports open-ended ranges, en dashes, spaces and 'all'", () => {
    expect(parsePageRanges("8-", 10).pages).toEqual([8, 9, 10]);
    expect(parsePageRanges("-2", 10).pages).toEqual([1, 2]);
    expect(parsePageRanges("2 – 4", 10).pages).toEqual([2, 3, 4]);
    expect(parsePageRanges("1 3 5", 10).pages).toEqual([1, 3, 5]);
    expect(parsePageRanges("all", 3).pages).toEqual([1, 2, 3]);
  });

  it("deduplicates overlapping ranges", () => {
    expect(parsePageRanges("1-3, 2-4", 10).pages).toEqual([1, 2, 3, 4]);
  });

  it("rejects pages outside the document", () => {
    expect(parsePageRanges("12", 10).error).toMatch(/doesn't exist — this PDF has 10 pages/);
    expect(parsePageRanges("0", 10).error).toMatch(/start at 1/);
  });

  it("rejects backwards ranges and junk", () => {
    expect(parsePageRanges("5-3", 10).error).toMatch(/backwards/);
    expect(parsePageRanges("abc", 10).error).toMatch(/isn't a valid page/);
    expect(parsePageRanges("  ", 10).success).toBe(false);
    expect(parsePageRanges("-", 10).success).toBe(false);
  });
});

describe("formatPageList", () => {
  it("compresses consecutive pages", () => {
    expect(formatPageList([2, 5, 8, 9, 10])).toBe("2, 5, 8–10");
    expect(formatPageList([3, 1, 2])).toBe("1–3");
    expect(formatPageList([])).toBe("");
  });
});

describe("splitEveryN", () => {
  it("chunks the document", () => {
    expect(splitEveryN(7, 3)).toEqual([[1, 3], [4, 6], [7, 7]]);
    expect(splitEveryN(2, 5)).toEqual([[1, 2]]);
    expect(splitEveryN(3, 1)).toEqual([[1, 1], [2, 2], [3, 3]]);
  });

  it("labels ranges", () => {
    expect(rangeLabel([1, 10])).toBe("1-10");
    expect(rangeLabel([4, 4])).toBe("4");
  });
});
