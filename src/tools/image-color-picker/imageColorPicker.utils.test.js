import { describe, expect, it } from "vitest";
import { addToHistory, pixelToColor, readableTextColor, toImagePoint } from "./imageColorPicker.utils.js";

describe("pixelToColor", () => {
  it("formats HEX, RGB and HSL", () => {
    const color = pixelToColor([52, 152, 219, 255], { x: 1, y: 2 });
    expect(color.hex).toBe("#3498DB");
    expect(color.rgb).toBe("rgb(52, 152, 219)");
    expect(color.hsl).toBe("hsl(204, 70%, 53%)");
    expect(color.alpha).toBe(1);
  });

  it("uses rgba() for semi-transparent pixels", () => {
    expect(pixelToColor([255, 0, 0, 128]).rgb).toBe("rgba(255, 0, 0, 0.5)");
  });
});

describe("addToHistory", () => {
  const red = pixelToColor([255, 0, 0, 255]);
  const blue = pixelToColor([0, 0, 255, 255]);

  it("adds newest first and removes duplicates", () => {
    expect(addToHistory([red, blue], red).map((c) => c.hex)).toEqual(["#FF0000", "#0000FF"]);
    expect(addToHistory([red], blue).map((c) => c.hex)).toEqual(["#0000FF", "#FF0000"]);
  });

  it("caps the history length", () => {
    expect(addToHistory([red], blue, 1)).toHaveLength(1);
  });
});

describe("toImagePoint", () => {
  const rect = { left: 10, top: 20, width: 100, height: 50 };

  it("scales display coordinates to source pixels", () => {
    expect(toImagePoint(60, 45, rect, 1000, 500)).toEqual({ x: 500, y: 250 });
  });

  it("clamps to the image bounds", () => {
    expect(toImagePoint(500, 500, rect, 1000, 500)).toEqual({ x: 999, y: 499 });
    expect(toImagePoint(0, 0, rect, 1000, 500)).toEqual({ x: 0, y: 0 });
  });
});

describe("readableTextColor", () => {
  it("returns black on light colors and white on dark ones", () => {
    expect(readableTextColor("#FFFFFF")).toBe("#000000");
    expect(readableTextColor("#102030")).toBe("#ffffff");
  });
});
