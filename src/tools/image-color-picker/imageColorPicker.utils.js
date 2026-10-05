import { formatHsl, formatRgb, rgbToHex, rgbToHsl } from "../color-converter/colorConverter.utils.js";

export const MAX_HISTORY = 24;
export const MAGNIFIER_PIXELS = 11; // odd, so the picked pixel sits in the middle

export function pixelToColor([r, g, b, a = 255], point) {
  const rgb = { r, g, b };
  const alpha = Math.round((a / 255) * 100) / 100;
  return {
    id: `${rgbToHex(rgb)}-${a}`,
    hex: rgbToHex(rgb),
    rgb: alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : formatRgb(rgb),
    hsl: formatHsl(rgbToHsl(rgb)),
    alpha,
    point,
  };
}

// Newest first, without duplicates, capped at `max` entries.
export function addToHistory(history, color, max = MAX_HISTORY) {
  return [color, ...history.filter((item) => item.id !== color.id)].slice(0, max);
}

// Map a pointer position on the displayed image to a source pixel.
export function toImagePoint(clientX, clientY, rect, width, height) {
  const x = Math.floor(((clientX - rect.left) / rect.width) * width);
  const y = Math.floor(((clientY - rect.top) / rect.height) * height);
  return {
    x: Math.min(Math.max(x, 0), width - 1),
    y: Math.min(Math.max(y, 0), height - 1),
  };
}

// Pick black or white text for legibility on top of a color swatch.
export function readableTextColor(hex) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#000000" : "#ffffff";
}
