import { describe, expect, it } from "vitest";
import { calculatePasswordStrength, generatePassword } from "./passwordGenerator.utils.js";

describe("generatePassword", () => {
  it("generates a password of the requested length", () => {
    const result = generatePassword({ length: 20 });
    expect(result.success).toBe(true);
    expect(result.value).toHaveLength(20);
  });

  it("only uses characters from the selected sets", () => {
    const result = generatePassword({ length: 50, uppercase: true, lowercase: false, numbers: false, symbols: false });
    expect(result.value).toMatch(/^[A-Z]+$/);
  });

  it("excludes ambiguous characters when requested", () => {
    const result = generatePassword({
      length: 200,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeAmbiguous: true,
    });
    expect(result.value).not.toMatch(/[il1Lo0O]/);
  });

  it("returns an error when no character type is selected", () => {
    const result = generatePassword({ uppercase: false, lowercase: false, numbers: false, symbols: false });
    expect(result.success).toBe(false);
  });

  it("produces different passwords on repeated calls", () => {
    expect(generatePassword({ length: 24 }).value).not.toBe(generatePassword({ length: 24 }).value);
  });
});

describe("calculatePasswordStrength", () => {
  it("rates an empty password as weak", () => {
    expect(calculatePasswordStrength("").label).toBe("Weak");
  });

  it("rates a short simple password as weak", () => {
    expect(calculatePasswordStrength("abc").label).toBe("Weak");
  });

  it("rates a long varied password as very strong", () => {
    expect(calculatePasswordStrength("Tr0ub4dor&3xtraLong!").label).toBe("Very strong");
  });
});
