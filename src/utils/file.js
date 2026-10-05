// Generic, browser-only file helpers shared by file-based tools (images today,
// potentially PDFs or other binary formats later). Nothing here uploads data.

export const MB = 1024 * 1024;

export function formatBytes(bytes, decimals = 1) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : decimals)} ${units[unit]}`;
}

// Signed percentage change from `before` to `after`. Positive = smaller output.
export function reductionPercent(before, after) {
  if (!before) return 0;
  return ((before - after) / before) * 100;
}

export function formatReduction(before, after) {
  const pct = reductionPercent(before, after);
  if (Math.abs(pct) < 0.05) return "No change";
  return pct > 0 ? `${pct.toFixed(1)}% smaller` : `${Math.abs(pct).toFixed(1)}% larger`;
}

export function replaceExtension(filename, extension) {
  const base = (filename || "image").replace(/\.[^./\\]+$/, "") || "image";
  return `${base}.${extension}`;
}

export function appendToFilename(filename, suffix, extension) {
  const base = (filename || "image").replace(/\.[^./\\]+$/, "") || "image";
  return `${base}${suffix}.${extension}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before freeing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(text, filename, type = "text/plain") {
  downloadBlob(new Blob([text], { type: `${type};charset=utf-8` }), filename);
}

// Matches a file against an `accept`-style list such as "image/png,.svg,image/*".
export function matchesAccept(file, accept) {
  if (!accept) return true;
  const name = file.name?.toLowerCase() ?? "";
  const type = file.type?.toLowerCase() ?? "";
  return accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
