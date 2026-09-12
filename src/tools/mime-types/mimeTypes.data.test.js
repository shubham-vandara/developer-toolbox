import { describe, expect, it } from "vitest";
import { filterMimeTypes } from "./mimeTypes.data.js";

describe("filterMimeTypes", () => {
  it("returns all entries for an empty query", () => {
    expect(filterMimeTypes("").length).toBeGreaterThan(10);
  });

  it("searches by extension with or without a leading dot", () => {
    expect(filterMimeTypes(".json").some((item) => item.extension === ".json")).toBe(true);
    expect(filterMimeTypes("json").some((item) => item.extension === ".json")).toBe(true);
  });

  it("searches by MIME type", () => {
    expect(filterMimeTypes("image/png").some((item) => item.extension === ".png")).toBe(true);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterMimeTypes("not-a-real-format-xyz")).toEqual([]);
  });
});
