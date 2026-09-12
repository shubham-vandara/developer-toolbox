import { describe, expect, it } from "vitest";
import { formatSql } from "./sqlFormatter.utils.js";

describe("formatSql", () => {
  it("formats a simple query onto multiple readable lines", () => {
    const result = formatSql("select id,name from users where id=1;");
    expect(result.success).toBe(true);
    expect(result.value).toContain("SELECT");
    expect(result.value.split("\n").length).toBeGreaterThan(1);
  });

  it("returns an error for empty input", () => {
    expect(formatSql("").success).toBe(false);
    expect(formatSql("   ").success).toBe(false);
  });
});
