export const MIME_TYPES = [
  { extension: ".json", mimeType: "application/json", description: "JSON data" },
  { extension: ".html", mimeType: "text/html", description: "HTML document" },
  { extension: ".css", mimeType: "text/css", description: "Stylesheet" },
  { extension: ".js", mimeType: "text/javascript", description: "JavaScript module or script" },
  { extension: ".xml", mimeType: "application/xml", description: "XML document" },
  { extension: ".pdf", mimeType: "application/pdf", description: "PDF document" },
  { extension: ".jpg", mimeType: "image/jpeg", description: "JPEG image" },
  { extension: ".png", mimeType: "image/png", description: "PNG image" },
  { extension: ".svg", mimeType: "image/svg+xml", description: "SVG vector image" },
  { extension: ".gif", mimeType: "image/gif", description: "GIF image" },
  { extension: ".webp", mimeType: "image/webp", description: "WebP image" },
  { extension: ".ico", mimeType: "image/x-icon", description: "Icon file" },
  { extension: ".csv", mimeType: "text/csv", description: "Comma-separated values" },
  { extension: ".txt", mimeType: "text/plain", description: "Plain text" },
  { extension: ".md", mimeType: "text/markdown", description: "Markdown document" },
  { extension: ".zip", mimeType: "application/zip", description: "ZIP archive" },
  { extension: ".gz", mimeType: "application/gzip", description: "Gzip archive" },
  { extension: ".tar", mimeType: "application/x-tar", description: "Tar archive" },
  { extension: ".mp3", mimeType: "audio/mpeg", description: "MP3 audio" },
  { extension: ".wav", mimeType: "audio/wav", description: "WAV audio" },
  { extension: ".mp4", mimeType: "video/mp4", description: "MP4 video" },
  { extension: ".webm", mimeType: "video/webm", description: "WebM video" },
  { extension: ".woff", mimeType: "font/woff", description: "WOFF web font" },
  { extension: ".woff2", mimeType: "font/woff2", description: "WOFF2 web font" },
  { extension: ".ttf", mimeType: "font/ttf", description: "TrueType font" },
  { extension: ".doc", mimeType: "application/msword", description: "Microsoft Word document (legacy)" },
  { extension: ".docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", description: "Microsoft Word document" },
  { extension: ".xls", mimeType: "application/vnd.ms-excel", description: "Microsoft Excel spreadsheet (legacy)" },
  { extension: ".xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", description: "Microsoft Excel spreadsheet" },
  { extension: ".wasm", mimeType: "application/wasm", description: "WebAssembly binary" },
  { extension: ".yaml", mimeType: "application/yaml", description: "YAML document" },
];

export function filterMimeTypes(query) {
  const q = query.trim().toLowerCase().replace(/^\./, "");
  if (!q) return MIME_TYPES;
  return MIME_TYPES.filter((item) =>
    `${item.extension} ${item.mimeType} ${item.description}`.toLowerCase().includes(q),
  );
}
