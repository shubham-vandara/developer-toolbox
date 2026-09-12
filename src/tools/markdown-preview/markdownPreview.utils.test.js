import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdownPreview.utils.js";

describe("renderMarkdown", () => {
  it("renders headings and bold text", () => {
    const result = renderMarkdown("# Title\n\nSome **bold** text.");
    expect(result.success).toBe(true);
    expect(result.html).toContain("<h1>Title</h1>");
    expect(result.html).toContain("<strong>bold</strong>");
  });

  it("renders GFM lists", () => {
    const result = renderMarkdown("- one\n- two");
    expect(result.html).toContain("<li>one</li>");
  });

  it("returns empty output for empty input", () => {
    expect(renderMarkdown("").html).toBe("");
  });

  it("sanitizes raw script tags out of the output", () => {
    const result = renderMarkdown('<script>alert(1)</script>\n\n# Hi');
    expect(result.success).toBe(true);
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("<h1>Hi</h1>");
  });

  it("strips dangerous event handler attributes", () => {
    const result = renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(result.html).not.toContain("onerror");
  });
});
