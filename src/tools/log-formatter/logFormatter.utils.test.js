import { describe, expect, it } from "vitest";
import { formatLogLine, formatLogs } from "./logFormatter.utils.js";

describe("formatLogLine", () => {
  it("pretty-prints a JSON log line and extracts its level", () => {
    const result = formatLogLine('{"level":"error","msg":"failed"}');
    expect(result.isJson).toBe(true);
    expect(result.level).toBe("ERROR");
    expect(result.formatted).toBe('{\n  "level": "error",\n  "msg": "failed"\n}');
  });

  it("detects a level keyword in a plain text line", () => {
    const result = formatLogLine("2024-01-01 12:00:00 WARN something happened");
    expect(result.isJson).toBe(false);
    expect(result.level).toBe("WARN");
  });

  it("returns null for an empty line", () => {
    expect(formatLogLine("   ")).toBeNull();
  });

  it("returns no level when none can be detected", () => {
    const result = formatLogLine("just a plain message");
    expect(result.level).toBeNull();
  });
});

describe("formatLogs", () => {
  it("formats every non-empty line", () => {
    const result = formatLogs('{"level":"info","msg":"ok"}\nplain ERROR line\n\n');
    expect(result.success).toBe(true);
    expect(result.entries).toHaveLength(2);
  });

  it("returns an error for empty input", () => {
    expect(formatLogs("").success).toBe(false);
  });
});
