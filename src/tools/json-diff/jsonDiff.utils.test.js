import { describe, expect, it } from "vitest";
import { diffValues, summarizeDiff } from "./jsonDiff.utils.js";

describe("diffValues", () => {
  it("finds no changes for identical objects", () => {
    expect(diffValues({ a: 1 }, { a: 1 })).toEqual([]);
  });

  it("detects an added field", () => {
    const changes = diffValues({ a: 1 }, { a: 1, b: 2 });
    expect(changes).toEqual([{ path: "b", type: "added", newValue: 2 }]);
  });

  it("detects a removed field", () => {
    const changes = diffValues({ a: 1, b: 2 }, { a: 1 });
    expect(changes).toEqual([{ path: "b", type: "removed", oldValue: 2 }]);
  });

  it("detects a changed field", () => {
    const changes = diffValues({ a: 1 }, { a: 2 });
    expect(changes).toEqual([{ path: "a", type: "changed", oldValue: 1, newValue: 2 }]);
  });

  it("recurses into nested objects", () => {
    const changes = diffValues({ user: { name: "John" } }, { user: { name: "Jane" } });
    expect(changes).toEqual([{ path: "user.name", type: "changed", oldValue: "John", newValue: "Jane" }]);
  });

  it("recurses into arrays", () => {
    const changes = diffValues({ tags: ["a", "b"] }, { tags: ["a", "c"] });
    expect(changes).toEqual([{ path: "tags[1]", type: "changed", oldValue: "b", newValue: "c" }]);
  });

  it("summarizes a diff by type", () => {
    const changes = diffValues({ a: 1, b: 2 }, { a: 2, c: 3 });
    expect(summarizeDiff(changes)).toEqual({ added: 1, removed: 1, changed: 1 });
  });
});
