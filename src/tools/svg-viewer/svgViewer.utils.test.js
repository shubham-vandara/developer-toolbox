import { describe, expect, it } from "vitest";
import { nextZoom } from "./svgViewer.utils.js";

describe("nextZoom", () => {
  it("steps up and down through zoom levels", () => {
    expect(nextZoom(1, 1)).toBe(1.5);
    expect(nextZoom(1, -1)).toBe(0.75);
    expect(nextZoom(1.2, 1)).toBe(1.5);
  });

  it("treats fit (null) as 100%", () => {
    expect(nextZoom(null, 1)).toBe(1.5);
    expect(nextZoom(null, -1)).toBe(0.75);
  });

  it("clamps at the ends", () => {
    expect(nextZoom(8, 1)).toBe(8);
    expect(nextZoom(0.1, -1)).toBe(0.1);
  });
});
