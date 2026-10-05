import { describe, expect, it } from "vitest";
import { buildHtmlTags, buildManifest, FAVICON_FILES, getIconLayout } from "./faviconGenerator.utils.js";

describe("getIconLayout", () => {
  it("letterboxes a wide image in fit mode", () => {
    expect(getIconLayout(200, 100, 32, { mode: "fit" })).toEqual({
      crop: { x: 0, y: 0, width: 200, height: 100 },
      dx: 0,
      dy: 8,
      dw: 32,
      dh: 16,
    });
  });

  it("takes a centered square in crop mode", () => {
    const layout = getIconLayout(200, 100, 32, { mode: "crop" });
    expect(layout.crop).toEqual({ x: 50, y: 0, width: 100, height: 100 });
    expect(layout).toMatchObject({ dx: 0, dy: 0, dw: 32, dh: 32 });
  });

  it("applies padding around the artwork", () => {
    expect(getIconLayout(100, 100, 100, { mode: "crop", padding: 0.1 })).toMatchObject({ dx: 10, dy: 10, dw: 80, dh: 80 });
  });
});

describe("output files", () => {
  it("covers the common favicon sizes", () => {
    expect(FAVICON_FILES.map((f) => f.size)).toEqual([16, 32, 48, 180, 192, 512]);
  });

  it("HTML tags reference every linked file", () => {
    const tags = buildHtmlTags();
    ["favicon.ico", "favicon-32x32.png", "favicon-16x16.png", "apple-touch-icon.png", "site.webmanifest"].forEach((file) =>
      expect(tags).toContain(file),
    );
  });

  it("builds a valid web manifest", () => {
    const manifest = JSON.parse(buildManifest({ backgroundColor: "#000000" }));
    expect(manifest.icons).toHaveLength(2);
    expect(manifest.background_color).toBe("#000000");
  });
});
