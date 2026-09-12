import { describe, expect, it } from "vitest";
import {
  countWords,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toLowerCase,
  toPascalCase,
  toSnakeCase,
  toUpperCase,
} from "./textCase.utils.js";

const INPUT = "Hello World Example";

describe("text case transforms", () => {
  it("converts to UPPER CASE", () => {
    expect(toUpperCase(INPUT)).toBe("HELLO WORLD EXAMPLE");
  });

  it("converts to lower case", () => {
    expect(toLowerCase(INPUT)).toBe("hello world example");
  });

  it("converts to camelCase", () => {
    expect(toCamelCase(INPUT)).toBe("helloWorldExample");
  });

  it("converts to PascalCase", () => {
    expect(toPascalCase(INPUT)).toBe("HelloWorldExample");
  });

  it("converts to snake_case", () => {
    expect(toSnakeCase(INPUT)).toBe("hello_world_example");
  });

  it("converts to kebab-case", () => {
    expect(toKebabCase(INPUT)).toBe("hello-world-example");
  });

  it("converts to CONSTANT_CASE", () => {
    expect(toConstantCase(INPUT)).toBe("HELLO_WORLD_EXAMPLE");
  });

  it("handles camelCase and snake_case input as source formats too", () => {
    expect(toSnakeCase("helloWorldExample")).toBe("hello_world_example");
    expect(toCamelCase("hello_world_example")).toBe("helloWorldExample");
  });
});

describe("countWords", () => {
  it("counts words separated by whitespace", () => {
    expect(countWords("hello world  foo")).toBe(3);
  });

  it("returns 0 for empty input", () => {
    expect(countWords("   ")).toBe(0);
  });
});
