/** Bounding box of pixels with alpha above `threshold`, or null if empty. */
export function alphaBounds(data, width, height, threshold = 8) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0 ? null : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Make near-white pixels transparent (for photos/scans of a signature on paper). */
export function removeWhiteBackground(data, threshold = 225) {
  for (let i = 0; i < data.length; i += 4) {
    const lightness = Math.min(data[i], data[i + 1], data[i + 2]);
    if (lightness >= threshold) data[i + 3] = 0;
    else if (lightness > threshold - 40) data[i + 3] = Math.round((data[i + 3] * (threshold - lightness)) / 40);
  }
  return data;
}

export const SIGNATURE_FONTS = [
  { value: "script", label: "Script", css: "'Segoe Script', 'Brush Script MT', 'Apple Chancery', cursive" },
  { value: "hand", label: "Handwriting", css: "'Lucida Handwriting', 'Bradley Hand', 'Comic Sans MS', cursive" },
  { value: "serif", label: "Formal", css: "italic 'Palatino Linotype', 'Book Antiqua', Georgia, serif" },
];

export const INK_COLORS = [
  { value: "#111827", label: "Black" },
  { value: "#1d4ed8", label: "Blue" },
  { value: "#991b1b", label: "Red" },
];
