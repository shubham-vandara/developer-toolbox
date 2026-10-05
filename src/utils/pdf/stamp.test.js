import { describe, expect, it } from "vitest";
import { assertEncodable, hexToRgb01, unencodableChars } from "./stamp.js";

describe("unencodableChars", () => {
  it("accepts ASCII, Latin-1 and Windows-1252 extras", () => {
    expect(unencodableChars("Hello, World! 123 café naïve © € “quotes” — ok\nline 2")).toEqual([]);
  });

  it("reports characters outside WinAnsi once each", () => {
    expect(unencodableChars("Привет, мир")).toEqual(["П", "р", "и", "в", "е", "т", "м"]);
    expect(unencodableChars("日本 ✓ 😀")).toEqual(["日", "本", "✓", "😀"]);
  });

  it("assertEncodable throws a user-facing error", () => {
    expect(() => assertEncodable(null, "Ω")).toThrow(/can't be drawn with the built-in PDF fonts: “Ω”/);
    expect(() => assertEncodable(null, "Plain text")).not.toThrow();
  });
});

describe("hexToRgb01", () => {
  it("converts hex colors", () => {
    expect(hexToRgb01("#ff0080")).toEqual({ r: 1, g: 0, b: 128 / 255 });
  });
});
