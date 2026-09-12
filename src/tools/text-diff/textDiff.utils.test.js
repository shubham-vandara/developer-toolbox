import { describe, expect, it } from "vitest";
import { diffLines, formatUnifiedDiff, summarizeLineDiff } from "./textDiff.utils.js";

describe("diffLines", () => {
  it("marks identical texts as fully unchanged", () => {
    const result = diffLines("a\nb", "a\nb");
    expect(result.success).toBe(true);
    expect(result.diff.every((d) => d.type === "unchanged")).toBe(true);
  });

  it("detects a changed line as a remove followed by an add", () => {
    const result = diffLines("a\nb\nc", "a\nx\nc");
    expect(result.diff).toEqual([
      { type: "unchanged", line: "a" },
      { type: "removed", line: "b" },
      { type: "added", line: "x" },
      { type: "unchanged", line: "c" },
    ]);
  });

  it("detects appended lines", () => {
    const result = diffLines("a", "a\nb\nc");
    expect(result.diff).toEqual([
      { type: "unchanged", line: "a" },
      { type: "added", line: "b" },
      { type: "added", line: "c" },
    ]);
  });

  it("detects removed lines", () => {
    const result = diffLines("a\nb\nc", "a");
    expect(result.diff).toEqual([
      { type: "unchanged", line: "a" },
      { type: "removed", line: "b" },
      { type: "removed", line: "c" },
    ]);
  });
});

describe("summarizeLineDiff", () => {
  it("counts each diff type", () => {
    const { diff } = diffLines("a\nb\nc", "a\nx\nc");
    expect(summarizeLineDiff(diff)).toEqual({ added: 1, removed: 1, unchanged: 2 });
  });
});

describe("formatUnifiedDiff", () => {
  it("prefixes each line by its diff type", () => {
    const { diff } = diffLines("a\nb", "a\nx");
    expect(formatUnifiedDiff(diff)).toBe("  a\n- b\n+ x");
  });
});
