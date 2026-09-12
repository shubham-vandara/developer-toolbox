import { describe, expect, it } from "vitest";
import { parseUrl } from "./urlParser.utils.js";

describe("parseUrl", () => {
  it("parses all components of a full URL", () => {
    const result = parseUrl("https://user:pass@sub.example.com:8080/path/to/page?foo=bar&baz=qux#section");
    expect(result.success).toBe(true);
    expect(result).toMatchObject({
      protocol: "https:",
      hostname: "sub.example.com",
      port: "8080",
      username: "user",
      password: "pass",
      pathname: "/path/to/page",
      search: "?foo=bar&baz=qux",
      hash: "#section",
      params: [
        { key: "foo", value: "bar" },
        { key: "baz", value: "qux" },
      ],
    });
  });

  it("fills in the default port when none is given", () => {
    const result = parseUrl("https://example.com");
    expect(result.success).toBe(true);
    expect(result.port).toBe("443");
    expect(result.params).toEqual([]);
  });

  it("returns an error for a URL missing a protocol", () => {
    expect(parseUrl("not a url").success).toBe(false);
  });

  it("returns an error for empty input", () => {
    expect(parseUrl("").success).toBe(false);
  });
});
