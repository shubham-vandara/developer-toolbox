// Rendering megabytes of text in a <textarea> is slow, so the on-screen view is
// capped; Copy and Download always use the complete value.
export const DISPLAY_LIMIT = 100_000;

export const OUTPUT_VIEWS = [
  { value: "dataUrl", label: "Data URL" },
  { value: "base64", label: "Base64 only" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
];

export function withMime(dataUrl, mime) {
  const comma = dataUrl.indexOf(",");
  return `data:${mime};base64,${dataUrl.slice(comma + 1)}`;
}

export function formatOutput(dataUrl, view, { alt = "", width, height } = {}) {
  switch (view) {
    case "base64":
      return dataUrl.slice(dataUrl.indexOf(",") + 1);
    case "css":
      return `background-image: url("${dataUrl}");`;
    case "html": {
      const size = width && height ? ` width="${width}" height="${height}"` : "";
      return `<img src="${dataUrl}" alt="${alt.replace(/"/g, "&quot;")}"${size} />`;
    }
    default:
      return dataUrl;
  }
}

export function truncateForDisplay(text, limit = DISPLAY_LIMIT) {
  if (text.length <= limit) return { text, truncated: false };
  return { text: `${text.slice(0, limit)}…`, truncated: true };
}
