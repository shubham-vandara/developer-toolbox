import { describe, expect, it } from "vitest";
import { findReplace } from "./findReplace.utils.js";

describe("findReplace", () => {
  it("replaces all matches case-insensitively by default", () => {
    const result = findReplace("Hello World hello world", { find: "hello", replace: "hi" });
    expect(result.success).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.value).toBe("hi World hi world");
  });

  it("respects the case-sensitive option", () => {
    const result = findReplace("Hello World hello world", { find: "hello", replace: "hi", caseSensitive: true });
    expect(result.matchCount).toBe(1);
    expect(result.value).toBe("Hello World hi world");
  });

  it("replaces only the first match when replaceAll is false", () => {
    const result = findReplace("cat cat cat", { find: "cat", replace: "dog", replaceAll: false });
    expect(result.value).toBe("dog cat cat");
    expect(result.matchCount).toBe(3);
  });

  it("supports regular expressions", () => {
    const result = findReplace("a1 b22 c333", { find: "\\d+", replace: "#", useRegex: true });
    expect(result.matchCount).toBe(3);
    expect(result.value).toBe("a# b# c#");
  });

  it("returns an error for invalid regular expressions instead of throwing", () => {
    const result = findReplace("abc", { find: "(", useRegex: true });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid regular expression");
  });

  it("returns the input unchanged when find is empty", () => {
    const result = findReplace("abc", { find: "" });
    expect(result.value).toBe("abc");
    expect(result.matchCount).toBe(0);
  });
});
