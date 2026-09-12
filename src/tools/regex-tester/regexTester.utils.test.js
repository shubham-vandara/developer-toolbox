import { describe, expect, it } from "vitest";
import { buildHighlightedSegments, replaceRegex, testRegex } from "./regexTester.utils.js";

describe("testRegex", () => {
  it("finds all matches with their positions", () => {
    const result = testRegex("\\d+", "g", "a1 b22 c333");
    expect(result.success).toBe(true);
    expect(result.matches.map((m) => m.match)).toEqual(["1", "22", "333"]);
    expect(result.matches[1].index).toBe(4);
  });

  it("captures named groups", () => {
    const result = testRegex("(?<year>\\d{4})-(?<month>\\d{2})", "", "2024-01");
    expect(result.matches[0].namedGroups).toEqual({ year: "2024", month: "01" });
  });

  it("returns an error for an invalid pattern", () => {
    expect(testRegex("(", "g", "abc").success).toBe(false);
  });

  it("returns an error when the pattern is empty", () => {
    expect(testRegex("", "g", "abc").success).toBe(false);
  });

  it("returns no matches when nothing matches", () => {
    const result = testRegex("xyz", "g", "abc");
    expect(result.success).toBe(true);
    expect(result.matches).toEqual([]);
  });
});

describe("replaceRegex", () => {
  it("replaces all matches when the g flag is set", () => {
    expect(replaceRegex("\\d+", "g", "a1 b2", "#")).toEqual({ success: true, value: "a# b#" });
  });

  it("replaces only the first match without the g flag", () => {
    expect(replaceRegex("\\d+", "", "a1 b2", "#")).toEqual({ success: true, value: "a# b2" });
  });

  it("returns an error for an invalid pattern", () => {
    expect(replaceRegex("(", "g", "abc", "x").success).toBe(false);
  });
});

describe("buildHighlightedSegments", () => {
  it("splits text into matched and unmatched segments", () => {
    const matches = [{ match: "1", index: 1 }, { match: "22", index: 4 }];
    const segments = buildHighlightedSegments("a1 b22", matches);
    expect(segments).toEqual([
      { text: "a", isMatch: false },
      { text: "1", isMatch: true },
      { text: " b", isMatch: false },
      { text: "22", isMatch: true },
    ]);
  });

  it("returns the whole text unmatched when there are no matches", () => {
    expect(buildHighlightedSegments("abc", [])).toEqual([{ text: "abc", isMatch: false }]);
  });
});
