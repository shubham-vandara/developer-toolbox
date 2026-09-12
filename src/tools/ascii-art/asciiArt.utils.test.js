import { describe, expect, it } from "vitest";
import { textToAsciiArt } from "./asciiArt.utils.js";

describe("textToAsciiArt", () => {
  it("renders known letters into a 5-row block", () => {
    const result = textToAsciiArt("AB");
    expect(result.success).toBe(true);
    expect(result.value).toBe(" #  ## \n# # # #\n### ## \n# # # #\n# # ## ");
  });

  it("is case-insensitive, always rendering uppercase glyphs", () => {
    expect(textToAsciiArt("ab")).toEqual(textToAsciiArt("AB"));
  });

  it("renders each line of multi-line input as its own block, separated by a blank line", () => {
    const result = textToAsciiArt("HI\nOK");
    const blocks = result.value.split("\n\n");
    expect(blocks).toHaveLength(2);
    blocks.forEach((block) => expect(block.split("\n")).toHaveLength(5));
  });

  it("falls back to a blank glyph for unsupported characters", () => {
    const result = textToAsciiArt("@");
    expect(result.success).toBe(true);
    expect(result.value.split("\n").every((row) => row.trim() === "")).toBe(true);
  });

  it("returns an error for empty input", () => {
    expect(textToAsciiArt("").success).toBe(false);
    expect(textToAsciiArt("   ").success).toBe(false);
  });
});
