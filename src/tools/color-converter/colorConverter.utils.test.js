import { describe, expect, it } from "vitest";
import { formatHsl, formatRgb, parseColor } from "./colorConverter.utils.js";

describe("parseColor", () => {
  it("parses a HEX color", () => {
    const result = parseColor("#3498db");
    expect(result.success).toBe(true);
    expect(result.rgb).toEqual({ r: 52, g: 152, b: 219 });
    expect(formatHsl(result.hsl)).toBe("hsl(204, 70%, 53%)");
  });

  it("parses a 3-digit HEX color", () => {
    const result = parseColor("#fff");
    expect(result.rgb).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("parses an rgb() color", () => {
    const result = parseColor("rgb(52, 152, 219)");
    expect(result.success).toBe(true);
    expect(result.hex).toBe("#3498DB");
  });

  it("parses an hsl() color", () => {
    const result = parseColor("hsl(204, 70%, 53%)");
    expect(result.success).toBe(true);
    // HSL percentages are already rounded, so converting back can be off by a
    // rounding unit from the original RGB — that's expected, not a bug.
    expect(formatRgb(result.rgb)).toBe("rgb(51, 152, 219)");
  });

  it("rejects an out-of-range rgb() color", () => {
    expect(parseColor("rgb(300, 0, 0)").success).toBe(false);
  });

  it("returns an error for unrecognized input", () => {
    expect(parseColor("not a color").success).toBe(false);
  });

  it("returns an error for empty input", () => {
    expect(parseColor("").success).toBe(false);
  });
});
