import { describe, expect, it } from "vitest";
import { formatJson, minifyJson, validateJson } from "./json.utils.js";

describe("formatJson", () => {
  it("pretty-prints valid JSON with the given indent", () => {
    const result = formatJson('{"name":"John","age":25}', 2);
    expect(result.success).toBe(true);
    expect(result.value).toBe('{\n  "name": "John",\n  "age": 25\n}');
  });

  it("returns a helpful error for invalid JSON", () => {
    const result = formatJson('{"name": "John",}');
    expect(result.success).toBe(false);
    expect(result.error.message).toBeTruthy();
  });
});

describe("minifyJson", () => {
  it("removes whitespace from valid JSON", () => {
    const result = minifyJson('{\n  "a": 1,\n  "b": [1, 2, 3]\n}');
    expect(result.success).toBe(true);
    expect(result.value).toBe('{"a":1,"b":[1,2,3]}');
  });

  it("fails on invalid JSON", () => {
    const result = minifyJson("{not valid}");
    expect(result.success).toBe(false);
  });
});

describe("validateJson", () => {
  it("marks well-formed JSON as valid", () => {
    expect(validateJson("[1, 2, 3]").valid).toBe(true);
  });

  it("marks malformed JSON as invalid with position info", () => {
    const result = validateJson('{"a": 1 "b": 2}');
    expect(result.valid).toBe(false);
    expect(result.error.position).not.toBeNull();
  });
});
