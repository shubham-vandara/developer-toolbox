import { describe, expect, it } from "vitest";
import { createInitialCrop, moveCrop, resizeCrop, roundCrop } from "./imageCropper.utils.js";

const bounds = { width: 1000, height: 500 };
const crop = { x: 100, y: 100, width: 400, height: 200 };

describe("createInitialCrop", () => {
  it("centers an 80% crop", () => {
    expect(createInitialCrop(1000, 500)).toEqual({ x: 100, y: 50, width: 800, height: 400 });
  });

  it("respects an aspect ratio", () => {
    const square = createInitialCrop(1000, 500, 1);
    expect(square.width).toBe(400);
    expect(square.height).toBe(400);
    expect(square.x).toBe(300);
  });
});

describe("moveCrop", () => {
  it("moves and clamps inside the image", () => {
    expect(moveCrop(crop, 50, 20, bounds)).toMatchObject({ x: 150, y: 120 });
    expect(moveCrop(crop, 5000, 5000, bounds)).toMatchObject({ x: 600, y: 300 });
    expect(moveCrop(crop, -5000, -5000, bounds)).toMatchObject({ x: 0, y: 0 });
  });
});

describe("resizeCrop (free)", () => {
  it("moves only the dragged edges", () => {
    expect(resizeCrop(crop, "se", 100, 50, bounds, null)).toEqual({ x: 100, y: 100, width: 500, height: 250 });
    expect(resizeCrop(crop, "w", -50, 999, bounds, null)).toEqual({ x: 50, y: 100, width: 450, height: 200 });
  });

  it("clamps to the image and a minimum size", () => {
    expect(resizeCrop(crop, "e", 5000, 0, bounds, null).width).toBe(900);
    expect(resizeCrop(crop, "n", 5000, 5000, bounds, null).height).toBe(8);
  });
});

describe("resizeCrop (aspect locked)", () => {
  it("keeps the ratio when dragging a corner", () => {
    const result = resizeCrop(crop, "se", 100, 0, bounds, 2);
    expect(result.width / result.height).toBeCloseTo(2);
    expect(result).toMatchObject({ x: 100, y: 100, width: 500, height: 250 });
  });

  it("keeps the ratio and stays inside the image when dragging past the edge", () => {
    const result = resizeCrop(crop, "se", 5000, 5000, bounds, 2);
    expect(result.width / result.height).toBeCloseTo(2);
    expect(result.x + result.width).toBeLessThanOrEqual(1000);
    expect(result.y + result.height).toBeLessThanOrEqual(500);
  });

  it("can shrink from a corner along a single axis", () => {
    const result = resizeCrop(crop, "se", -100, 0, bounds, 2);
    expect(result).toMatchObject({ x: 100, y: 100, width: 300, height: 150 });
    const vertical = resizeCrop(crop, "se", 0, -50, bounds, 2);
    expect(vertical).toMatchObject({ width: 300, height: 150 });
  });

  it("resizes symmetrically from a side handle", () => {
    const result = resizeCrop(crop, "e", 100, 0, bounds, 2);
    expect(result).toMatchObject({ x: 100, width: 500, height: 250, y: 75 });
  });

  it("anchors the opposite corner when dragging north-west", () => {
    const result = resizeCrop(crop, "nw", -40, -40, bounds, 2);
    expect(result.x + result.width).toBe(500);
    expect(result.y + result.height).toBe(300);
  });
});

describe("roundCrop", () => {
  it("rounds to whole pixels inside the image", () => {
    expect(roundCrop({ x: 10.4, y: 20.6, width: 100.5, height: 50.2 }, bounds)).toEqual({ x: 10, y: 21, width: 101, height: 50 });
    expect(roundCrop({ x: 999.9, y: 0, width: 10, height: 10 }, bounds).width).toBe(1);
  });
});
