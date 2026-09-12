export function hexToRgb(hex) {
  const clean = hex.trim().replace(/^#/, "");
  const expanded = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }) {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export function formatRgb({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function formatHsl({ h, s, l }) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function parseColor(input) {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, error: "Enter a color value." };

  if (/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
    const rgb = hexToRgb(trimmed);
    if (rgb) return { success: true, rgb, hex: rgbToHex(rgb), hsl: rgbToHsl(rgb) };
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgbMatch) {
    const rgb = { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
    if ([rgb.r, rgb.g, rgb.b].every((n) => n >= 0 && n <= 255)) {
      return { success: true, rgb, hex: rgbToHex(rgb), hsl: rgbToHsl(rgb) };
    }
    return { success: false, error: "RGB values must be between 0 and 255." };
  }

  const hslMatch = trimmed.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (hslMatch) {
    const hsl = { h: Number(hslMatch[1]), s: Number(hslMatch[2]), l: Number(hslMatch[3]) };
    const rgb = hslToRgb(hsl);
    return { success: true, rgb, hex: rgbToHex(rgb), hsl };
  }

  return {
    success: false,
    error: "Enter a valid HEX (#3498db), RGB (rgb(52, 152, 219)) or HSL (hsl(204, 70%, 53%)) color.",
  };
}
