import { css_beautify } from "js-beautify";

export function formatCss(input) {
  if (!input.trim()) return { success: false, error: "Enter some CSS to format." };
  try {
    return { success: true, value: css_beautify(input, { indent_size: 2 }) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unable to format this CSS." };
  }
}

export function minifyCss(input) {
  if (!input.trim()) return { success: false, error: "Enter some CSS to minify." };
  const minified = input
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/\s+/g, " ")
    .trim();
  return { success: true, value: minified };
}
