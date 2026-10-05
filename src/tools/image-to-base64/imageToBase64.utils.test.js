import { describe, expect, it } from "vitest";
import { formatOutput, truncateForDisplay, withMime } from "./imageToBase64.utils.js";

const DATA_URL = "data:image/png;base64,iVBORw0KGgo=";

describe("withMime", () => {
  it("replaces a generic MIME type with the detected one", () => {
    expect(withMime("data:application/octet-stream;base64,AAAA", "image/png")).toBe("data:image/png;base64,AAAA");
  });
});

describe("formatOutput", () => {
  it("returns the data URL, raw Base64, CSS and HTML forms", () => {
    expect(formatOutput(DATA_URL, "dataUrl")).toBe(DATA_URL);
    expect(formatOutput(DATA_URL, "base64")).toBe("iVBORw0KGgo=");
    expect(formatOutput(DATA_URL, "css")).toBe(`background-image: url("${DATA_URL}");`);
    expect(formatOutput(DATA_URL, "html", { alt: 'a "logo"', width: 10, height: 5 })).toBe(
      `<img src="${DATA_URL}" alt="a &quot;logo&quot;" width="10" height="5" />`,
    );
  });
});

describe("truncateForDisplay", () => {
  it("only truncates long text", () => {
    expect(truncateForDisplay("abc", 5)).toEqual({ text: "abc", truncated: false });
    expect(truncateForDisplay("abcdef", 3)).toEqual({ text: "abc…", truncated: true });
  });
});
