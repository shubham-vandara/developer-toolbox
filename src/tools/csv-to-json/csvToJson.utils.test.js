import { describe, expect, it } from "vitest";
import { csvToJson } from "./csvToJson.utils.js";

describe("csvToJson", () => {
  it("converts a simple CSV with headers", () => {
    const result = csvToJson("name,age\nJohn,25\nJane,30");
    expect(result.success).toBe(true);
    expect(JSON.parse(result.value)).toEqual([
      { name: "John", age: "25" },
      { name: "Jane", age: "30" },
    ]);
  });

  it("handles quoted values containing commas", () => {
    const result = csvToJson('name,city\n"Smith, John",NYC');
    expect(JSON.parse(result.value)).toEqual([{ name: "Smith, John", city: "NYC" }]);
  });

  it("handles quoted values containing embedded newlines", () => {
    const result = csvToJson('name,note\nJohn,"line1\nline2"');
    expect(JSON.parse(result.value)).toEqual([{ name: "John", note: "line1\nline2" }]);
  });

  it("handles escaped double quotes inside quoted fields", () => {
    const result = csvToJson('name,quote\nJohn,"She said ""hi"""');
    expect(JSON.parse(result.value)).toEqual([{ name: "John", quote: 'She said "hi"' }]);
  });

  it("returns an error for empty input", () => {
    const result = csvToJson("");
    expect(result.success).toBe(false);
  });
});
