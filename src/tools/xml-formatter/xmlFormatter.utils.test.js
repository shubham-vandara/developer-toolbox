import { describe, expect, it } from "vitest";
import { formatXml, minifyXml, validateXml } from "./xmlFormatter.utils.js";

describe("validateXml", () => {
  it("accepts well-formed XML", () => {
    expect(validateXml("<a><b>hi</b></a>").valid).toBe(true);
  });

  it("rejects malformed XML", () => {
    const result = validateXml("<a><b></a>");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("formatXml", () => {
  it("indents nested elements", () => {
    const result = formatXml("<root><item>one</item><item>two</item></root>");
    expect(result.success).toBe(true);
    expect(result.value).toBe("<root>\n  <item>one</item>\n  <item>two</item>\n</root>");
  });

  it("returns an error for invalid XML", () => {
    expect(formatXml("<a><b></a>").success).toBe(false);
  });

  it("returns an error for empty input", () => {
    expect(formatXml("").success).toBe(false);
  });
});

describe("minifyXml", () => {
  it("removes whitespace between tags", () => {
    const result = minifyXml("<root>\n  <item>one</item>\n</root>");
    expect(result.value).toBe("<root><item>one</item></root>");
  });
});
