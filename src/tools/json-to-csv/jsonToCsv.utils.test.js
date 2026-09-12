import { describe, expect, it } from "vitest";
import { jsonToCsv } from "./jsonToCsv.utils.js";

describe("jsonToCsv", () => {
  it("converts a simple array of objects", () => {
    const result = jsonToCsv('[{"name":"John","age":25},{"name":"Jane","age":30}]');
    expect(result.success).toBe(true);
    expect(result.value).toBe("name,age\nJohn,25\nJane,30");
  });

  it("collects the union of keys across rows as headers", () => {
    const result = jsonToCsv('[{"a":1},{"a":2,"b":3}]');
    expect(result.value).toBe("a,b\n1,\n2,3");
  });

  it("quotes values containing commas or quotes", () => {
    const result = jsonToCsv('[{"name":"Smith, John","note":"He said \\"hi\\""}]');
    expect(result.value).toBe('name,note\n"Smith, John","He said ""hi"""');
  });

  it("returns an error for invalid JSON", () => {
    const result = jsonToCsv("not json");
    expect(result.success).toBe(false);
  });

  it("returns an error when JSON is not an array", () => {
    const result = jsonToCsv('{"name":"John"}');
    expect(result.success).toBe(false);
    expect(result.error).toContain("array");
  });

  it("returns an error for an empty array", () => {
    const result = jsonToCsv("[]");
    expect(result.success).toBe(false);
  });
});
