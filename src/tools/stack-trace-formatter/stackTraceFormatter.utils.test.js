import { describe, expect, it } from "vitest";
import { formatStackTrace, parseStackTraceLine } from "./stackTraceFormatter.utils.js";

describe("parseStackTraceLine", () => {
  it("parses a JavaScript frame", () => {
    expect(parseStackTraceLine("    at Object.<anonymous> (/app/src/index.js:10:15)")).toEqual({
      type: "frame",
      language: "javascript",
      function: "Object.<anonymous>",
      file: "/app/src/index.js",
      line: 10,
      column: 15,
    });
  });

  it("parses a Java frame", () => {
    expect(parseStackTraceLine("\tat com.example.Main.process(Main.java:42)")).toEqual({
      type: "frame",
      language: "java",
      function: "com.example.Main.process",
      file: "Main.java",
      line: 42,
    });
  });

  it("parses a Python frame", () => {
    expect(parseStackTraceLine('  File "main.py", line 10, in <module>')).toEqual({
      type: "frame",
      language: "python",
      function: "<module>",
      file: "main.py",
      line: 10,
    });
  });

  it("recognizes a Java 'Caused by' line", () => {
    expect(parseStackTraceLine("Caused by: java.lang.RuntimeException: root cause")).toEqual({
      type: "cause",
      text: "Caused by: java.lang.RuntimeException: root cause",
    });
  });

  it("treats an unrecognized line as plain text", () => {
    expect(parseStackTraceLine("TypeError: something broke")).toEqual({
      type: "text",
      text: "TypeError: something broke",
    });
  });

  it("returns null for an empty line", () => {
    expect(parseStackTraceLine("   ")).toBeNull();
  });
});

describe("formatStackTrace", () => {
  const jsTrace = [
    "TypeError: Cannot read properties of undefined (reading 'foo')",
    "    at Object.<anonymous> (/app/src/index.js:10:15)",
    "    at doStuff (/app/node_modules/lib/index.js:5:3)",
  ].join("\n");

  it("returns an error for empty input", () => {
    expect(formatStackTrace("").success).toBe(false);
  });

  it("parses every line by default", () => {
    const result = formatStackTrace(jsTrace);
    expect(result.success).toBe(true);
    expect(result.entries).toHaveLength(3);
  });

  it("hides vendor/node_modules frames when requested", () => {
    const result = formatStackTrace(jsTrace, { hideVendorFrames: true });
    expect(result.entries).toHaveLength(2);
    expect(result.entries.some((e) => e.file?.includes("node_modules"))).toBe(false);
  });
});
