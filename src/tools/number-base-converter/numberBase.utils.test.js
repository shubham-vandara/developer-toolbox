import { describe, expect, it } from "vitest";
import { convertFromBase } from "./numberBase.utils.js";

describe("convertFromBase", () => {
  it("converts a decimal number to all bases", () => {
    const result = convertFromBase("255", 10);
    expect(result.success).toBe(true);
    expect(result.values).toEqual({ binary: "11111111", decimal: "255", octal: "377", hexadecimal: "FF" });
  });

  it("converts a hexadecimal number to all bases", () => {
    const result = convertFromBase("ff", 16);
    expect(result.success).toBe(true);
    expect(result.values.decimal).toBe("255");
  });

  it("converts a binary number to all bases", () => {
    const result = convertFromBase("11111111", 2);
    expect(result.values.decimal).toBe("255");
    expect(result.values.hexadecimal).toBe("FF");
  });

  it("rejects digits invalid for the given base", () => {
    expect(convertFromBase("129", 8).success).toBe(false);
    expect(convertFromBase("2", 2).success).toBe(false);
    expect(convertFromBase("G", 16).success).toBe(false);
  });

  it("returns an error for empty input", () => {
    expect(convertFromBase("", 10).success).toBe(false);
  });
});
