import { describe, expect, it } from "vitest";
import { groupLines, groupParagraphs, groupTable, normalizeItems } from "./textLayout.js";

const run = (text, x, y, size = 10) => ({ text, x, y, width: text.length * size * 0.5, size });

describe("normalizeItems", () => {
  it("reads position and font size from the transform", () => {
    const [item] = normalizeItems([{ str: "Hi", transform: [12, 0, 0, 12, 50, 700], width: 14 }, { str: "", transform: [1, 0, 0, 1, 0, 0] }]);
    expect(item).toEqual({ text: "Hi", x: 50, y: 700, width: 14, size: 12 });
  });
});

describe("groupLines", () => {
  it("orders lines top to bottom and runs left to right, adding spaces at gaps", () => {
    const lines = groupLines([run("world", 60, 700), run("Second", 10, 680), run("Hello", 10, 700.5)]);
    expect(lines.map((l) => l.text)).toEqual(["Hello world", "Second"]);
  });

  it("doesn't add spaces between touching runs", () => {
    expect(groupLines([run("Hel", 10, 700), { ...run("lo", 25, 700) }])[0].text).toBe("Hello");
  });
});

describe("groupParagraphs", () => {
  it("joins close lines and splits on large gaps, fixing hyphenation", () => {
    const lines = groupLines([run("A long para-", 10, 700), run("graph here.", 10, 688), run("New paragraph", 10, 650)]);
    expect(groupParagraphs(lines).map((p) => p.text)).toEqual(["A long paragraph here.", "New paragraph"]);
  });

  it("starts a new paragraph when the font size changes (headings)", () => {
    const lines = groupLines([run("Title", 10, 720, 20), run("Body text", 10, 700, 10)]);
    expect(groupParagraphs(lines)).toHaveLength(2);
  });
});

describe("groupTable", () => {
  it("isn't fooled by PDF.js whitespace items spanning the gaps between cells", () => {
    const item = (str, x, width) => ({ str, transform: [11, 0, 0, 11, x, 472], width });
    const runs = normalizeItems([item("Item", 50, 21.4), item(" ", 71.4, 128.6), item("Qty", 200, 17.1), item(" ", 217.1, 132.9), item("Price", 350, 25.1)]);
    expect(groupTable(groupLines(runs))).toEqual([["Item", "Qty", "Price"]]);
  });

  it("splits wide gaps into cells aligned to shared columns", () => {
    const lines = groupLines([
      run("Name", 10, 700), run("Qty", 200, 700), run("Price", 300, 700),
      run("Apple", 10, 685), run("3", 200, 685), run("1.50", 300, 685),
      run("Pear", 10, 670), run("12.00", 300, 670),
    ]);
    expect(groupTable(lines)).toEqual([
      ["Name", "Qty", "Price"],
      ["Apple", "3", "1.50"],
      ["Pear", "", "12.00"],
    ]);
  });
});
