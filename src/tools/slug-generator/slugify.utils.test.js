import { describe, expect, it } from "vitest";
import { slugify } from "./slugify.utils.js";

describe("slugify", () => {
  it("lowercases and hyphenates a normal title", () => {
    expect(slugify("Hello World Example")).toBe("hello-world-example");
  });

  it("strips accented characters", () => {
    expect(slugify("Café Münchën")).toBe("cafe-munchen");
  });

  it("removes punctuation and collapses repeated separators", () => {
    expect(slugify("Hello, World!!  Foo---Bar")).toBe("hello-world-foo-bar");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --Hello World--  ")).toBe("hello-world");
  });

  it("supports a custom separator", () => {
    expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
  });

  it("preserves case when lowercase is disabled", () => {
    expect(slugify("Hello World", { lowercase: false })).toBe("Hello-World");
  });

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});
