import { describe, expect, it } from "vitest";
import { alignOffset, drawBounds, textBox, translateElement } from "./annotations.js";

describe("annotation geometry", () => {
  const viewer = { width: 600, height: 800 };
  const fakeMeasure = (lines, size) => lines.map((line) => line.length * size * 0.5);

  it("sizes text boxes from the widest line and line count", () => {
    const box = textBox({ text: "Hello\nHi", fontSize: 20, font: "helvetica" }, viewer, fakeMeasure);
    expect(box.w).toBeCloseTo(50 / 600);
    expect(box.h).toBeCloseTo(48 / 800);
  });

  it("aligns lines within the box", () => {
    expect(alignOffset(40, 100, "left")).toBe(0);
    expect(alignOffset(40, 100, "center")).toBe(30);
    expect(alignOffset(40, 100, "right")).toBe(60);
  });

  it("translates boxes and drawings", () => {
    expect(translateElement({ type: "image", x: 0.1, y: 0.2 }, 0.1, 0.1)).toMatchObject({ x: 0.2, y: expect.closeTo(0.3) });
    expect(translateElement({ type: "draw", points: [[0, 0], [0.5, 0.5]] }, 0.1, 0).points).toEqual([[0.1, 0], [0.6, 0.5]]);
  });

  it("computes drawing bounds", () => {
    expect(drawBounds([[0.2, 0.4], [0.5, 0.1], [0.3, 0.3]])).toEqual({ x: 0.2, y: 0.1, w: 0.3, h: expect.closeTo(0.3) });
  });
});
