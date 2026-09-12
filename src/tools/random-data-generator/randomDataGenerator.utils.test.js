import { describe, expect, it } from "vitest";
import {
  generateDate,
  generateEmail,
  generatePhoneNumber,
  generateRandomData,
} from "./randomDataGenerator.utils.js";

describe("generateEmail", () => {
  it("produces a plausible email address", () => {
    expect(generateEmail()).toMatch(/^[a-z]+\.[a-z]+\d+@[a-z.]+$/);
  });
});

describe("generatePhoneNumber", () => {
  it("produces a formatted phone number", () => {
    expect(generatePhoneNumber()).toMatch(/^\+1-\d{3}-\d{3}-\d{4}$/);
  });
});

describe("generateDate", () => {
  it("produces a valid ISO date string", () => {
    const date = generateDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(new Date(date).getTime())).toBe(false);
  });
});

describe("generateRandomData", () => {
  it("generates the requested quantity", () => {
    expect(generateRandomData("name", 10)).toHaveLength(10);
  });

  it("generates values appropriate to the requested type", () => {
    const uuids = generateRandomData("uuid", 5);
    uuids.forEach((id) => expect(id).toMatch(/^[0-9a-f-]{36}$/i));
  });

  it("returns an empty array for an unknown type", () => {
    expect(generateRandomData("unknown", 5)).toEqual([]);
  });

  it("clamps quantity to a sane range", () => {
    expect(generateRandomData("number", 0)).toHaveLength(1);
  });
});
