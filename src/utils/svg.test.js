import { describe, expect, it } from "vitest";
import { resizeSvgMarkup, sanitizeSvg } from "./svg.js";

const wrap = (inner, attrs = 'viewBox="0 0 100 50"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

describe("sanitizeSvg", () => {
  it("accepts a valid SVG and reports its size", () => {
    const result = sanitizeSvg(wrap('<rect width="10" height="10" fill="red"/>'));
    expect(result.success).toBe(true);
    expect(result.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(result.svg).toContain("<rect");
    expect(result.info).toMatchObject({ width: 100, height: 50, viewBoxAttr: "0 0 100 50" });
    expect(result.removedCount).toBe(0);
  });

  it("derives a missing dimension from the viewBox ratio", () => {
    const result = sanitizeSvg(wrap("", 'width="200" viewBox="0 0 100 50"'));
    expect(result.info).toMatchObject({ width: 200, height: 100 });
  });

  it("falls back to 300×150 when the SVG has no size information", () => {
    expect(sanitizeSvg(wrap("", "")).info).toMatchObject({ width: 300, height: 150 });
  });

  it("removes script elements", () => {
    const result = sanitizeSvg(wrap("<script>alert(1)</script><circle r='5'/>"));
    expect(result.success).toBe(true);
    expect(result.svg).not.toMatch(/script|alert/i);
    expect(result.removedCount).toBeGreaterThan(0);
  });

  it("removes event handler attributes", () => {
    const result = sanitizeSvg(wrap('<rect onclick="alert(1)" width="5" height="5"/>', 'onload="alert(1)"'));
    expect(result.svg).not.toMatch(/onload|onclick|alert/i);
  });

  it("removes javascript: and external links but keeps fragment references", () => {
    const result = sanitizeSvg(
      wrap(
        '<a href="javascript:alert(1)"><text>x</text></a>' +
          '<image href="https://evil.example/track.png" width="5" height="5"/>' +
          '<use href="#shape"/>',
      ),
    );
    expect(result.svg).not.toMatch(/javascript:|evil\.example/);
    expect(result.svg).toContain('href="#shape"');
  });

  it("removes foreignObject content", () => {
    const result = sanitizeSvg(wrap('<foreignObject><div xmlns="http://www.w3.org/1999/xhtml"><img src="x" onerror="alert(1)"/></div></foreignObject>'));
    expect(result.svg).not.toMatch(/foreignObject|onerror|alert/i);
  });

  it("strips external url() references from styles but keeps url(#id)", () => {
    const result = sanitizeSvg(
      wrap(
        "<style>@import url(https://evil.example/a.css); .a { fill: url('#grad'); background: url(https://evil.example/b.png); }</style>" +
          '<rect style="fill: url(https://evil.example/c.png)" width="5" height="5"/>',
      ),
    );
    expect(result.svg).not.toMatch(/evil\.example|@import/);
    expect(result.svg).toContain("url('#grad')");
  });

  it("rejects malformed markup", () => {
    const result = sanitizeSvg("<svg><rect></svg>");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/isn't valid SVG/);
  });

  it("rejects non-SVG XML and empty input", () => {
    expect(sanitizeSvg("<html></html>").success).toBe(false);
    expect(sanitizeSvg("   ").success).toBe(false);
  });
});

describe("resizeSvgMarkup", () => {
  it("sets the target size and adds a viewBox when missing", () => {
    const { svg, info } = sanitizeSvg(wrap("", 'width="20" height="10"'));
    const resized = resizeSvgMarkup(svg, info, 200, 100);
    expect(resized).toContain('width="200"');
    expect(resized).toContain('height="100"');
    expect(resized).toContain('viewBox="0 0 20 10"');
  });
});
