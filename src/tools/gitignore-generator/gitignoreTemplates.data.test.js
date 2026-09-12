import { describe, expect, it } from "vitest";
import { buildGitignore, GITIGNORE_TEMPLATES } from "./gitignoreTemplates.data.js";

describe("buildGitignore", () => {
  it("returns an empty string when nothing is selected", () => {
    expect(buildGitignore([])).toBe("");
  });

  it("includes a header and the template's lines for a single selection", () => {
    const result = buildGitignore(["node"]);
    expect(result).toContain("### Node ###");
    expect(result).toContain("node_modules/");
  });

  it("combines multiple templates", () => {
    const result = buildGitignore(["node", "macos"]);
    expect(result).toContain("### Node ###");
    expect(result).toContain("### macOS ###");
    expect(result).toContain(".DS_Store");
  });

  it("de-duplicates lines shared across templates", () => {
    const result = buildGitignore(["java", "jetbrains"]);
    const outLines = result.split("\n").filter((l) => l.trim() === "out/");
    expect(outLines).toHaveLength(1);
  });

  it("ignores unknown template ids", () => {
    expect(buildGitignore(["not-a-real-template"])).toBe("");
  });

  it("exposes every template with a unique id", () => {
    const ids = GITIGNORE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
