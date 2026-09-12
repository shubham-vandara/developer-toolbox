import { describe, expect, it } from "vitest";
import { filterRegexEntries } from "./regexCheatsheet.data.js";

describe("filterRegexEntries", () => {
  it("returns everything for an empty query and 'all' category", () => {
    expect(filterRegexEntries("", "all").length).toBeGreaterThan(20);
  });

  it("filters by category", () => {
    const results = filterRegexEntries("", "anchors");
    expect(results.every((e) => e.category === "anchors")).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("searches by token", () => {
    expect(filterRegexEntries("\\d").some((e) => e.token === "\\d")).toBe(true);
  });

  it("searches by description text", () => {
    expect(filterRegexEntries("lookahead").length).toBeGreaterThan(0);
  });
});
