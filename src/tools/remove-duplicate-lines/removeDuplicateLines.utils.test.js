import { describe, expect, it } from "vitest";
import { removeDuplicateLines } from "./removeDuplicateLines.utils.js";

describe("removeDuplicateLines", () => {
  it("removes duplicates while preserving first occurrence order", () => {
    const result = removeDuplicateLines("apple\nbanana\napple\norange\nbanana");
    expect(result.lines).toEqual(["apple", "banana", "orange"]);
    expect(result.removedCount).toBe(2);
  });

  it("treats differently-cased duplicates as distinct by default", () => {
    const result = removeDuplicateLines("Apple\napple");
    expect(result.lines).toEqual(["Apple", "apple"]);
  });

  it("ignores case when requested", () => {
    const result = removeDuplicateLines("Apple\napple\nAPPLE", { ignoreCase: true });
    expect(result.lines).toEqual(["Apple"]);
    expect(result.removedCount).toBe(2);
  });

  it("trims whitespace when requested", () => {
    const result = removeDuplicateLines(" apple \napple", { trimLines: true });
    expect(result.lines).toEqual(["apple"]);
  });

  it("sorts the result when requested", () => {
    const result = removeDuplicateLines("banana\napple\ncherry", { sort: true });
    expect(result.lines).toEqual(["apple", "banana", "cherry"]);
  });
});
