import { describe, expect, it } from "vitest";
import { jsonToYaml, yamlToJson } from "./yamlJson.utils.js";

describe("yamlToJson", () => {
  it("converts simple YAML to formatted JSON", () => {
    const result = yamlToJson("name: John\nage: 25\n");
    expect(result.success).toBe(true);
    expect(JSON.parse(result.value)).toEqual({ name: "John", age: 25 });
  });

  it("converts nested YAML structures", () => {
    const result = yamlToJson("user:\n  name: John\n  tags:\n    - a\n    - b\n");
    expect(JSON.parse(result.value)).toEqual({ user: { name: "John", tags: ["a", "b"] } });
  });

  it("returns an error for malformed YAML", () => {
    const result = yamlToJson("name: John\n  bad indent: x\n");
    expect(result.success).toBe(false);
  });

  it("returns an error for empty input", () => {
    expect(yamlToJson("").success).toBe(false);
  });
});

describe("jsonToYaml", () => {
  it("converts JSON to YAML", () => {
    const result = jsonToYaml('{"name":"John","age":25}');
    expect(result.success).toBe(true);
    expect(result.value).toBe("name: John\nage: 25\n");
  });

  it("returns an error for invalid JSON", () => {
    expect(jsonToYaml("not json").success).toBe(false);
  });

  it("returns an error for empty input", () => {
    expect(jsonToYaml("").success).toBe(false);
  });
});
