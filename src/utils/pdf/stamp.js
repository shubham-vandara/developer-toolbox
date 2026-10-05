// Drawing helpers shared by the watermark, page-number, editor and signature
// tools. Positions are given in viewer space (as the user sees the page) and
// converted to PDF space here, so rotated pages come out right.
import { getLibPageBox, PdfToolError } from "./engine.js";
import { getViewerSize, originForCenteredRotation, viewerToPdf, viewerToPdfAngle } from "./geometry.js";

export function hexToRgb01(hex) {
  const value = parseInt(hex.replace("#", ""), 16);
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 };
}

// Characters the 14 standard PDF fonts can show: WinAnsi (Windows-1252).
const WIN_ANSI_EXTRAS = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";

export function unencodableChars(text) {
  const bad = new Set();
  for (const ch of text) {
    const code = ch.codePointAt(0);
    const ok = (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || code === 0x0a || code === 0x09 || WIN_ANSI_EXTRAS.includes(ch);
    if (!ok) bad.add(ch);
  }
  return [...bad];
}

/**
 * The standard PDF fonts only cover Latin characters, and pdf-lib doesn't
 * reject others — it would silently write unreadable glyphs. Fail clearly.
 */
export function assertEncodable(_font, text) {
  const bad = unencodableChars(text);
  if (bad.length) {
    throw new PdfToolError(
      `These characters can't be drawn with the built-in PDF fonts: ${bad.slice(0, 5).map((c) => `“${c}”`).join(" ")}. Use Latin letters, digits and common symbols.`,
      "unencodable",
    );
  }
}

// Visual height used to center a line of text (cap height ≈ 0.7em).
export const textHeight = (size) => size * 0.7;

export function pageGeometry(page) {
  const box = getLibPageBox(page);
  return { box, viewer: getViewerSize(box) };
}

/** Draw `text` centered on a viewer-space point, rotated `angle`° (CCW). */
export function drawTextAt(page, text, { center, angle = 0, font, size, color, opacity = 1 }, lib) {
  const { box } = pageGeometry(page);
  const width = font.widthOfTextAtSize(text, size);
  const p = viewerToPdf(center.x, center.y, box);
  const pdfAngle = viewerToPdfAngle(angle, box.rotation);
  const origin = originForCenteredRotation(p.x, p.y, width, textHeight(size), pdfAngle);
  page.drawText(text, {
    x: origin.x,
    y: origin.y,
    size,
    font,
    color: lib.rgb(color.r, color.g, color.b),
    opacity,
    rotate: lib.degrees(pdfAngle),
  });
}

/** Draw an embedded image of w×h points centered on a viewer-space point. */
export function drawImageAt(page, image, { center, width, height, angle = 0, opacity = 1 }, lib) {
  const { box } = pageGeometry(page);
  const p = viewerToPdf(center.x, center.y, box);
  const pdfAngle = viewerToPdfAngle(angle, box.rotation);
  const origin = originForCenteredRotation(p.x, p.y, width, height, pdfAngle);
  page.drawImage(image, { x: origin.x, y: origin.y, width, height, opacity, rotate: lib.degrees(pdfAngle) });
}

/** Embed PNG/JPEG bytes (detected by signature). */
export async function embedImage(doc, bytes) {
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  return isPng ? doc.embedPng(bytes) : doc.embedJpg(bytes);
}
