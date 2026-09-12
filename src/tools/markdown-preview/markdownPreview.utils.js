import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdown(input) {
  if (!input.trim()) return { success: true, html: "" };
  try {
    const rawHtml = marked.parse(input);
    return { success: true, html: DOMPurify.sanitize(rawHtml) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unable to render this Markdown." };
  }
}
