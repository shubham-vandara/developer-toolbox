import { describe, expect, it } from "vitest";
import { convertUnit } from "./unitConverter.utils.js";

describe("convertUnit", () => {
  it("converts length units", () => {
    const result = convertUnit("length", 1, "mile", "kilometer");
    expect(result.success).toBe(true);
    expect(result.value).toBeCloseTo(1.609344, 5);
  });

  it("converts weight units", () => {
    const result = convertUnit("weight", 1, "kilogram", "pound");
    expect(result.value).toBeCloseTo(2.2046226, 5);
  });

  it("converts data size units", () => {
    expect(convertUnit("data", 1, "gigabyte", "megabyte").value).toBe(1024);
  });

  it("converts celsius to fahrenheit", () => {
    expect(convertUnit("temperature", 100, "celsius", "fahrenheit").value).toBe(212);
  });

  it("converts fahrenheit to celsius", () => {
    expect(convertUnit("temperature", 32, "fahrenheit", "celsius").value).toBe(0);
  });

  it("converts celsius to kelvin", () => {
    expect(convertUnit("temperature", 0, "celsius", "kelvin").value).toBeCloseTo(273.15, 5);
  });

  it("returns the same value when converting a unit to itself", () => {
    expect(convertUnit("length", 5, "meter", "meter").value).toBe(5);
  });

  it("returns an error for non-numeric input", () => {
    expect(convertUnit("length", "abc", "meter", "foot").success).toBe(false);
  });
});
