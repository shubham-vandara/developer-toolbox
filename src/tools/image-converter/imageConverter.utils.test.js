import { describe, expect, it } from "vitest";
import { OUTPUT_FORMATS } from "../../utils/image.js";
import { getConversionNotes } from "./imageConverter.utils.js";

describe("getConversionNotes", () => {
  it("warns about transparency when converting to JPEG", () => {
    expect(getConversionNotes("image/png", OUTPUT_FORMATS.jpeg).join(" ")).toMatch(/transparency/);
  });

  it("does not warn about transparency for JPEG → JPEG", () => {
    const notes = getConversionNotes("image/jpeg", OUTPUT_FORMATS.jpeg);
    expect(notes.join(" ")).not.toMatch(/transparency/);
    expect(notes.join(" ")).toMatch(/already JPEG/);
  });

  it("mentions GIF animation and BMP size", () => {
    expect(getConversionNotes("image/gif", OUTPUT_FORMATS.png).join(" ")).toMatch(/first frame/);
    expect(getConversionNotes("image/png", OUTPUT_FORMATS.bmp).join(" ")).toMatch(/uncompressed/);
  });

  it("has no notes for a simple PNG → WebP conversion", () => {
    expect(getConversionNotes("image/png", OUTPUT_FORMATS.webp)).toEqual([]);
  });
});
