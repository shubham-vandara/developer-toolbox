import { describe, expect, it } from "vitest";
import { alphaBounds, removeWhiteBackground } from "./pdfSign.utils.js";

function image(width, height, opaque) {
  const data = new Uint8ClampedArray(width * height * 4);
  opaque.forEach(([x, y]) => (data[(y * width + x) * 4 + 3] = 255));
  return data;
}

describe("alphaBounds", () => {
  it("finds the box around opaque pixels", () => {
    expect(alphaBounds(image(10, 10, [[2, 3], [6, 5]]), 10, 10)).toEqual({ x: 2, y: 3, width: 5, height: 3 });
  });

  it("returns null for an empty canvas", () => {
    expect(alphaBounds(image(4, 4, []), 4, 4)).toBeNull();
  });
});

describe("removeWhiteBackground", () => {
  it("clears white, keeps ink and feathers light grey", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 20, 20, 20, 255, 205, 205, 205, 255]);
    removeWhiteBackground(data);
    expect(data[3]).toBe(0);
    expect(data[7]).toBe(255);
    expect(data[11]).toBeGreaterThan(0);
    expect(data[11]).toBeLessThan(255);
  });
});
