import { describe, expect, it } from "vitest";
import { formatHtml, minifyHtml } from "./htmlFormatter.utils.js";

describe("formatHtml", () => {
  it("indents nested elements", () => {
    const result = formatHtml("<div><p>hi</p></div>");
    expect(result.success).toBe(true);
    expect(result.value).toBe("<div>\n  <p>hi</p>\n</div>");
  });

  it("returns an error for empty input", () => {
    expect(formatHtml("").success).toBe(false);
  });
});

describe("minifyHtml", () => {
  it("collapses whitespace between tags and strips comments", () => {
    const result = minifyHtml("<div>\n  <!-- comment -->\n  <p>hi</p>\n</div>");
    expect(result.success).toBe(true);
    expect(result.value).toBe("<div><p>hi</p></div>");
  });

  it("returns an error for empty input", () => {
    expect(minifyHtml("").success).toBe(false);
  });
});
