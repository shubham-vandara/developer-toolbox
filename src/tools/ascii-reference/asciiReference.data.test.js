import { describe, expect, it } from "vitest";
import { ASCII_TABLE, filterAsciiTable } from "./asciiReference.data.js";

describe("ASCII_TABLE", () => {
  it("contains all 128 ASCII codes", () => {
    expect(ASCII_TABLE).toHaveLength(128);
  });

  it("maps code 65 to the character A", () => {
    expect(ASCII_TABLE.find((e) => e.code === 65)).toMatchObject({ char: "A", hex: "0x41", printable: true });
  });

  it("names non-printable control characters instead of showing a character", () => {
    const entry = ASCII_TABLE.find((e) => e.code === 10);
    expect(entry).toMatchObject({ char: "", name: "LF", printable: false });
  });
});

describe("filterAsciiTable", () => {
  it("returns everything for an empty query", () => {
    expect(filterAsciiTable("")).toHaveLength(128);
  });

  it("searches by character", () => {
    const results = filterAsciiTable("A");
    expect(results.some((e) => e.code === 65)).toBe(true);
  });

  it("searches by control character name", () => {
    const results = filterAsciiTable("ESC");
    expect(results.some((e) => e.code === 27)).toBe(true);
  });

  it("searches by hex code", () => {
    const results = filterAsciiTable("0x41");
    expect(results).toEqual([expect.objectContaining({ code: 65 })]);
  });
});
