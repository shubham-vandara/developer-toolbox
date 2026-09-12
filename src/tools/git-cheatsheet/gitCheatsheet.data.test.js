import { describe, expect, it } from "vitest";
import { filterGitEntries } from "./gitCheatsheet.data.js";

describe("filterGitEntries", () => {
  it("returns everything for an empty query and 'all' category", () => {
    expect(filterGitEntries("", "all").length).toBeGreaterThan(20);
  });

  it("filters by category", () => {
    const results = filterGitEntries("", "stash");
    expect(results.every((e) => e.category === "stash")).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("searches by command text", () => {
    expect(filterGitEntries("rebase").some((e) => e.command.includes("rebase"))).toBe(true);
  });

  it("searches by description text", () => {
    expect(filterGitEntries("upstream").length).toBeGreaterThan(0);
  });
});
