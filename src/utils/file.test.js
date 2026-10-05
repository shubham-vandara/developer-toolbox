import { describe, expect, it } from "vitest";
import { appendToFilename, formatBytes, formatReduction, matchesAccept, reductionPercent, replaceExtension } from "./file.js";

describe("formatBytes", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(150 * 1024)).toBe("150 KB");
  });
  it("handles invalid input", () => {
    expect(formatBytes(-1)).toBe("—");
    expect(formatBytes(NaN)).toBe("—");
  });
});

describe("reduction helpers", () => {
  it("computes reduction percentages", () => {
    expect(reductionPercent(1000, 250)).toBe(75);
    expect(reductionPercent(0, 10)).toBe(0);
    expect(formatReduction(1000, 250)).toBe("75.0% smaller");
    expect(formatReduction(1000, 1200)).toBe("20.0% larger");
    expect(formatReduction(1000, 1000)).toBe("No change");
  });
});

describe("filename helpers", () => {
  it("replaces or appends extensions", () => {
    expect(replaceExtension("photo.jpeg", "webp")).toBe("photo.webp");
    expect(replaceExtension("archive.tar.gz", "png")).toBe("archive.tar.png");
    expect(replaceExtension("", "png")).toBe("image.png");
    expect(appendToFilename("photo.png", "-512x512", "png")).toBe("photo-512x512.png");
  });
});

describe("matchesAccept", () => {
  const file = (name, type) => ({ name, type });
  it("matches by MIME type, wildcard and extension", () => {
    expect(matchesAccept(file("a.png", "image/png"), "image/png,image/jpeg")).toBe(true);
    expect(matchesAccept(file("a.gif", "image/gif"), "image/*")).toBe(true);
    expect(matchesAccept(file("icon.SVG", ""), "image/svg+xml,.svg")).toBe(true);
    expect(matchesAccept(file("notes.txt", "text/plain"), "image/*")).toBe(false);
  });
});
