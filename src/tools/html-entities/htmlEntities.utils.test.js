import { describe, expect, it } from "vitest";
import { decodeHtmlEntities, encodeHtmlEntities } from "./htmlEntities.utils.js";

describe("encodeHtmlEntities", () => {
  it("escapes the common HTML-sensitive characters", () => {
    const result = encodeHtmlEntities(`<div class="a">it's</div>`);
    expect(result.success).toBe(true);
    expect(result.value).toBe("&lt;div class=&quot;a&quot;&gt;it&#39;s&lt;/div&gt;");
  });

  it("leaves plain text and Unicode untouched", () => {
    expect(encodeHtmlEntities("héllo 👋").value).toBe("héllo 👋");
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes named entities back to characters", () => {
    const result = decodeHtmlEntities("&lt;b&gt;Bold &amp; done&lt;/b&gt;");
    expect(result.success).toBe(true);
    expect(result.value).toBe("<b>Bold & done</b>");
  });

  it("round-trips through encode/decode", () => {
    const original = `Tom & Jerry <say> "hi" 'bye'`;
    expect(decodeHtmlEntities(encodeHtmlEntities(original).value).value).toBe(original);
  });
});
