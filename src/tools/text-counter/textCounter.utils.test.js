import { describe, expect, it } from "vitest";
import { countText } from "./textCounter.utils.js";

describe("countText", () => {
  it("returns all zeros for empty input", () => {
    expect(countText("")).toEqual({
      characters: 0,
      charactersWithoutSpaces: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      paragraphs: 0,
    });
  });

  it("counts characters, words and characters without spaces", () => {
    const result = countText("Hello world");
    expect(result.characters).toBe(11);
    expect(result.charactersWithoutSpaces).toBe(10);
    expect(result.words).toBe(2);
  });

  it("counts sentences", () => {
    const result = countText("Hello world. This is great!  Are you sure?");
    expect(result.sentences).toBe(3);
    expect(result.words).toBe(8);
  });

  it("counts lines and paragraphs", () => {
    const result = countText("line one\nline two\n\nsecond paragraph");
    expect(result.lines).toBe(4);
    expect(result.paragraphs).toBe(2);
  });
});
