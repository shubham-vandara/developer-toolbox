import { describe, expect, it } from "vitest";
import { generateLoremIpsum } from "./loremIpsum.utils.js";

describe("generateLoremIpsum", () => {
  it("generates the requested number of words", () => {
    const text = generateLoremIpsum({ unit: "words", count: 10, startWithClassic: false });
    expect(text.replace(/\.$/, "").split(" ")).toHaveLength(10);
  });

  it("generates the requested number of sentences", () => {
    const text = generateLoremIpsum({ unit: "sentences", count: 3, startWithClassic: false });
    const sentenceCount = text.split(". ").filter(Boolean).length;
    expect(sentenceCount).toBe(3);
  });

  it("generates the requested number of paragraphs", () => {
    const text = generateLoremIpsum({ unit: "paragraphs", count: 4, startWithClassic: false });
    expect(text.split("\n\n")).toHaveLength(4);
  });

  it("starts with the classic opening when requested", () => {
    const text = generateLoremIpsum({ unit: "paragraphs", count: 1, startWithClassic: true });
    expect(text.startsWith("Lorem ipsum dolor sit amet, consectetur adipiscing elit.")).toBe(true);
  });

  it("clamps the count to a sane range", () => {
    const text = generateLoremIpsum({ unit: "paragraphs", count: 0 });
    expect(text.split("\n\n")).toHaveLength(1);
  });
});
