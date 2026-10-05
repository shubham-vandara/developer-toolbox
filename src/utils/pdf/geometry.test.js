import { describe, expect, it } from "vitest";
import {
  anchorCenter,
  formatPageNumber,
  getViewerSize,
  originForCenteredRotation,
  placeImage,
  resolvePageSize,
  rotatedBounds,
  viewerToPdf,
  viewerToPdfAngle,
} from "./geometry.js";

// A 600×800 page (portrait, unrotated box).
const page = { width: 600, height: 800 };

describe("viewerToPdf", () => {
  it("is the identity for unrotated pages, plus the box offset", () => {
    expect(viewerToPdf(10, 20, page)).toEqual({ x: 10, y: 20 });
    expect(viewerToPdf(10, 20, { ...page, x0: 5, y0: 7 })).toEqual({ x: 15, y: 27 });
  });

  it("maps the visual top-left corner correctly for every rotation", () => {
    // Visual top-left in viewer space is (0, viewerHeight).
    const corner = (rotation) => {
      const { height } = getViewerSize({ ...page, rotation });
      return viewerToPdf(0, height, { ...page, rotation });
    };
    expect(corner(0)).toEqual({ x: 0, y: 800 });
    expect(corner(90)).toEqual({ x: 0, y: 0 }); // rotated 90° clockwise: the left edge is now on top
    expect(corner(180)).toEqual({ x: 600, y: 0 });
    expect(corner(270)).toEqual({ x: 600, y: 800 });
  });

  it("maps the viewer center to the page center", () => {
    for (const rotation of [0, 90, 180, 270]) {
      const v = getViewerSize({ ...page, rotation });
      expect(viewerToPdf(v.width / 2, v.height / 2, { ...page, rotation })).toEqual({ x: 300, y: 400 });
    }
  });

  it("swaps viewer size for quarter turns and compensates text angles", () => {
    expect(getViewerSize({ ...page, rotation: 90 })).toEqual({ width: 800, height: 600 });
    expect(getViewerSize({ ...page, rotation: -90 })).toEqual({ width: 800, height: 600 });
    expect(viewerToPdfAngle(45, 90)).toBe(135);
  });
});

describe("rotation helpers", () => {
  it("keeps an unrotated box's origin at its bottom-left", () => {
    expect(originForCenteredRotation(50, 50, 20, 10, 0)).toEqual({ x: 40, y: 45 });
  });

  it("centers a box rotated 90°", () => {
    const o = originForCenteredRotation(50, 50, 20, 10, 90);
    expect(o.x).toBeCloseTo(55);
    expect(o.y).toBeCloseTo(40);
  });

  it("computes rotated bounds", () => {
    const b = rotatedBounds(20, 10, 90);
    expect(b.width).toBeCloseTo(10);
    expect(b.height).toBeCloseTo(20);
  });
});

describe("anchorCenter", () => {
  it("places boxes at named positions with a margin", () => {
    expect(anchorCenter("center", 600, 800, 100, 20)).toEqual({ x: 300, y: 400 });
    expect(anchorCenter("top-left", 600, 800, 100, 20, 10)).toEqual({ x: 60, y: 780 });
    expect(anchorCenter("bottom-right", 600, 800, 100, 20, 10)).toEqual({ x: 540, y: 20 });
    expect(anchorCenter("bottom-center", 600, 800, 100, 20, 10)).toEqual({ x: 300, y: 20 });
  });
});

describe("image pages", () => {
  it("resolves page sizes and orientation", () => {
    expect(resolvePageSize("letter", "portrait", 100, 50)).toEqual({ width: 612, height: 792 });
    expect(resolvePageSize("letter", "auto", 100, 50)).toEqual({ width: 792, height: 612 });
    expect(resolvePageSize("original", "auto", 800, 600)).toEqual({ width: 600, height: 450 });
  });

  it("fits, fills and keeps original size", () => {
    expect(placeImage(200, 100, 600, 800, { fit: "fit" })).toMatchObject({ x: 0, y: 250, width: 600, height: 300 });
    const fill = placeImage(200, 100, 600, 800, { fit: "fill", margin: 0 });
    expect(fill).toMatchObject({ width: 1600, height: 800, y: 0 });
    expect(fill.x).toBe(-500);
    expect(placeImage(200, 100, 600, 800, { fit: "original" })).toMatchObject({ width: 150, height: 75 });
  });

  it("respects margins", () => {
    expect(placeImage(100, 100, 600, 800, { fit: "fit", margin: 50 })).toMatchObject({ x: 50, width: 500, height: 500 });
  });
});

describe("formatPageNumber", () => {
  it("fills in the template", () => {
    expect(formatPageNumber("Page {n} of {total}", 3, 20)).toBe("Page 3 of 20");
    expect(formatPageNumber("{n}", 7, 9)).toBe("7");
  });
});
