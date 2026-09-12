import { describe, expect, it } from "vitest";
import { buildEnvExample, buildEnvFile } from "./envGenerator.utils.js";

describe("buildEnvFile", () => {
  it("builds KEY=value lines from pairs", () => {
    const result = buildEnvFile([
      { key: "port", value: "3000" },
      { key: "node_env", value: "production" },
    ]);
    expect(result).toBe("PORT=3000\nNODE_ENV=production\n");
  });

  it("uppercases and sanitizes keys", () => {
    const result = buildEnvFile([{ key: "api key", value: "abc" }]);
    expect(result).toBe("API_KEY=abc\n");
  });

  it("quotes values containing spaces", () => {
    const result = buildEnvFile([{ key: "greeting", value: "hello world" }]);
    expect(result).toBe('GREETING="hello world"\n');
  });

  it("skips rows without a key", () => {
    const result = buildEnvFile([{ key: "", value: "x" }, { key: "port", value: "3000" }]);
    expect(result).toBe("PORT=3000\n");
  });

  it("returns an empty string when there are no valid pairs", () => {
    expect(buildEnvFile([])).toBe("");
  });
});

describe("buildEnvExample", () => {
  it("builds KEY= lines without values", () => {
    const result = buildEnvExample([
      { key: "port", value: "3000" },
      { key: "api_key", value: "secret" },
    ]);
    expect(result).toBe("PORT=\nAPI_KEY=\n");
  });
});
