import { html_beautify } from "js-beautify";

export function formatHtml(input) {
  if (!input.trim()) return { success: false, error: "Enter some HTML to format." };
  try {
    return { success: true, value: html_beautify(input, { indent_size: 2, wrap_line_length: 0 }) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unable to format this HTML." };
  }
}

export function minifyHtml(input) {
  if (!input.trim()) return { success: false, error: "Enter some HTML to minify." };
  const minified = input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { success: true, value: minified };
}
