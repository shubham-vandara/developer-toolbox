import { describe, expect, it } from "vitest";
import { buildDocxParts, buildXlsxParts, columnName, sheetName, toNumber, xmlEscape } from "./office.js";

const part = (parts, name) => parts.find((p) => p.name === name)?.data;

describe("xmlEscape", () => {
  it("escapes markup and strips characters XML forbids", () => {
    expect(xmlEscape('a<b>&"c"')).toBe("a&lt;b&gt;&amp;&quot;c&quot;");
    expect(xmlEscape("bad\u0000\u0007char\u000Bs")).toBe("badchars");
    expect(xmlEscape("tab\tand\nnewline")).toBe("tab\tand\nnewline");
  });
});

describe("buildDocxParts", () => {
  it("writes the required package parts with escaped paragraphs", () => {
    const parts = buildDocxParts({ blocks: [{ type: "paragraph", text: "Q&A <1>", size: 12 }, { type: "pageBreak" }] });
    expect(parts.map((p) => p.name)).toEqual(["[Content_Types].xml", "_rels/.rels", "word/document.xml", "word/_rels/document.xml.rels"]);
    const doc = part(parts, "word/document.xml");
    expect(doc).toContain('<w:t xml:space="preserve">Q&amp;A &lt;1&gt;</w:t>');
    expect(doc).toContain('<w:sz w:val="24"/>');
    expect(doc).toContain('<w:br w:type="page"/>');
    expect(doc).toContain('<w:pgSz w:w="12240" w:h="15840"/>');
  });

  it("embeds page images with matching relationships", () => {
    const parts = buildDocxParts({
      blocks: [{ type: "image", index: 0, width: 100, height: 50 }],
      images: [{ data: new Uint8Array([0xff, 0xd8]) }],
      page: { width: 842, height: 595, margin: 18 },
    });
    expect(part(parts, "word/document.xml")).toContain('r:embed="rIdImg1"');
    expect(part(parts, "word/document.xml")).toContain('<wp:extent cx="1270000" cy="635000"/>');
    expect(part(parts, "word/document.xml")).toContain('w:orient="landscape"');
    expect(part(parts, "word/_rels/document.xml.rels")).toContain('Id="rIdImg1"');
    expect(part(parts, "word/media/image1.jpeg")).toBeInstanceOf(Uint8Array);
  });

  it("produces a valid body even with no content", () => {
    expect(part(buildDocxParts({ blocks: [] }), "word/document.xml")).toContain("<w:body><w:p/>");
  });
});

describe("XLSX helpers", () => {
  it("names columns like Excel", () => {
    expect([0, 25, 26, 27, 701, 702].map(columnName)).toEqual(["A", "Z", "AA", "AB", "ZZ", "AAA"]);
  });

  it("recognizes plain and thousands-separated numbers only", () => {
    expect(toNumber("42")).toBe(42);
    expect(toNumber("-3.5")).toBe(-3.5);
    expect(toNumber("1,234.50")).toBe(1234.5);
    expect(toNumber("12/05/2024")).toBeNull();
    expect(toNumber("1,23")).toBeNull();
    expect(toNumber("007a")).toBeNull();
  });

  it("makes sheet names valid and unique", () => {
    const used = new Set();
    expect(sheetName("Page 1", used)).toBe("Page 1");
    expect(sheetName("Page 1", used)).toBe("Page 1 (2)");
    expect(sheetName("a/b*c?" + "x".repeat(40), used)).toHaveLength(31);
  });
});

describe("buildXlsxParts", () => {
  it("writes numbers as numbers and text as inline strings", () => {
    const parts = buildXlsxParts([{ name: "Page 1", rows: [["Item", "Qty"], ["Tea & cake", "3"]] }]);
    const sheet = part(parts, "xl/worksheets/sheet1.xml");
    expect(sheet).toContain('<c r="A1" t="inlineStr"><is><t xml:space="preserve">Item</t></is></c>');
    expect(sheet).toContain("Tea &amp; cake");
    expect(sheet).toContain('<c r="B2"><v>3</v></c>');
    expect(part(parts, "xl/workbook.xml")).toContain('<sheet name="Page 1" sheetId="1" r:id="rId1"/>');
    expect(part(parts, "[Content_Types].xml")).toContain("/xl/worksheets/sheet1.xml");
  });
});
