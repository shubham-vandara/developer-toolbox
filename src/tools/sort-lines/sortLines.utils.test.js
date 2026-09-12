import { describe, expect, it } from "vitest";
import { sortLines } from "./sortLines.utils.js";

describe("sortLines", () => {
  it("sorts A to Z by default", () => {
    expect(sortLines("banana\napple\ncherry")).toEqual(["apple", "banana", "cherry"]);
  });

  it("sorts Z to A", () => {
    expect(sortLines("banana\napple\ncherry", { mode: "za" })).toEqual(["cherry", "banana", "apple"]);
  });

  it("sorts numerically ascending", () => {
    expect(sortLines("10\n2\n33\n4", { mode: "numeric-asc" })).toEqual(["2", "4", "10", "33"]);
  });

  it("sorts numerically descending", () => {
    expect(sortLines("10\n2\n33\n4", { mode: "numeric-desc" })).toEqual(["33", "10", "4", "2"]);
  });

  it("sorts by line length", () => {
    expect(sortLines("aaa\na\naa", { mode: "length" })).toEqual(["a", "aa", "aaa"]);
  });

  it("removes duplicates when requested", () => {
    expect(sortLines("banana\napple\nbanana", { removeDuplicates: true })).toEqual(["apple", "banana"]);
  });

  it("drops empty lines when preserveEmpty is false", () => {
    expect(sortLines("b\n\na", { preserveEmpty: false })).toEqual(["a", "b"]);
  });
});
