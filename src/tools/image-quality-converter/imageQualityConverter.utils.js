export const QUALITY_PRESETS = [
  { id: "low", label: "Low", quality: 40, description: "Visible artifacts; thumbnails and previews." },
  { id: "medium", label: "Medium", quality: 65, description: "Good for most web images." },
  { id: "high", label: "High", quality: 85, description: "Near-original detail for photos." },
  { id: "max", label: "Maximum", quality: 95, description: "Archival quality, largest files." },
];

export function presetForQuality(quality) {
  return QUALITY_PRESETS.find((preset) => preset.quality === quality)?.id ?? "custom";
}

// Default output: keep a lossy source format, otherwise suggest JPEG (or WebP
// for images that may need transparency).
export function defaultQualityFormat(sourceMime, webpSupported) {
  if (sourceMime === "image/jpeg") return "jpeg";
  if (sourceMime === "image/webp" && webpSupported) return "webp";
  return webpSupported ? "webp" : "jpeg";
}
