import { describe, expect, it } from "vitest";
import { formatCss, minifyCss } from "./cssFormatter.utils.js";

describe("formatCss", () => {
  it("formats a compact rule onto multiple readable lines", () => {
    const result = formatCss(".a{color:red;margin:0}");
    expect(result.success).toBe(true);
    expect(result.value).toBe(".a {\n  color: red;\n  margin: 0\n}");
  });

  it("returns an error for empty input", () => {
    expect(formatCss("").success).toBe(false);
  });
});

describe("minifyCss", () => {
  it("strips comments and collapses whitespace", () => {
    const result = minifyCss("/* comment */\n.a {\n  color: red;\n  margin: 0;\n}");
    expect(result.success).toBe(true);
    expect(result.value).toBe(".a{color:red;margin:0}");
  });

  it("returns an error for empty input", () => {
    expect(minifyCss("").success).toBe(false);
  });
});
