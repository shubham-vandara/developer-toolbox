// Elements added on top of PDF pages by the editor and signature tools, and
// how they're written into the PDF. Element geometry is stored in fractions of
// the page as displayed (top-left origin) so it survives any screen size.
//
//   text:      { type, x, y, text, fontSize, color, align, font }
//   image:     { type, x, y, w, h, bytes (PNG/JPEG), url, opacity }
//   highlight: { type, x, y, w, h, color, opacity }
//   draw:      { type, points: [[fx, fy]…], color, width }
import { loadPdfLib, openForEdit, savePdf, yieldToBrowser } from "./engine.js";
import { originForCenteredRotation, viewerToPdf, viewerToPdfAngle } from "./geometry.js";
import { assertEncodable, drawImageAt, embedImage, hexToRgb01, pageGeometry } from "./stamp.js";

export const FONTS = {
  helvetica: { label: "Sans", pdf: "Helvetica", css: "Helvetica, Arial, sans-serif" },
  times: { label: "Serif", pdf: "TimesRoman", css: "'Times New Roman', Times, serif" },
  courier: { label: "Mono", pdf: "Courier", css: "'Courier New', Courier, monospace" },
};

export const LINE_HEIGHT = 1.2;
// Baseline of the first line below the box top, matching CSS line-height 1.2.
export const BASELINE = 0.95;

let measureCanvas = null;

/** Width (pt) of each line at `size` using the browser's matching font. */
export function measureLines(lines, size, fontKey = "helvetica") {
  measureCanvas ??= document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  ctx.font = `${size}px ${FONTS[fontKey].css}`;
  return lines.map((line) => ctx.measureText(line).width);
}

/** Box size (fractions) of a text element on a page of viewer size `viewer`. */
export function textBox(element, viewer, measure = measureLines) {
  const lines = element.text.split("\n");
  const widths = measure(lines, element.fontSize, element.font);
  return {
    w: Math.max(...widths, element.fontSize * 0.5) / viewer.width,
    h: (lines.length * element.fontSize * LINE_HEIGHT) / viewer.height,
  };
}

/** Horizontal offset of a line inside a text box for an alignment. */
export function alignOffset(lineWidth, boxWidth, align) {
  if (align === "center") return (boxWidth - lineWidth) / 2;
  if (align === "right") return boxWidth - lineWidth;
  return 0;
}

export function translateElement(element, dx, dy) {
  if (element.type === "draw") return { ...element, points: element.points.map(([x, y]) => [x + dx, y + dy]) };
  return { ...element, x: element.x + dx, y: element.y + dy };
}

export function drawBounds(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * Write elements into a copy of the PDF. elementsByPage: { [pageNumber]: element[] }.
 * The uploaded file itself is never modified.
 */
export async function exportWithElements(bytes, elementsByPage, report) {
  const lib = await loadPdfLib();
  const doc = await openForEdit(bytes);
  const pages = doc.getPages();
  const fonts = {};
  const font = async (key) => (fonts[key] ??= await doc.embedFont(lib.StandardFonts[FONTS[key].pdf]));
  const entries = Object.entries(elementsByPage).filter(([, list]) => list.length);

  for (let i = 0; i < entries.length; i += 1) {
    report?.(i, entries.length, "Writing page");
    const [pageNumber, elements] = entries[i];
    const page = pages[Number(pageNumber) - 1];
    const { box, viewer } = pageGeometry(page);
    const toViewer = (fx, fy) => ({ x: fx * viewer.width, y: (1 - fy) * viewer.height });
    const angle = viewerToPdfAngle(0, box.rotation);

    for (const el of elements) {
      if (el.type === "text") {
        const f = await font(el.font ?? "helvetica");
        assertEncodable(f, el.text.replace(/\n/g, ""));
        const lines = el.text.split("\n");
        const widths = lines.map((line) => f.widthOfTextAtSize(line, el.fontSize));
        const boxWidth = Math.max(...widths);
        const color = hexToRgb01(el.color);
        lines.forEach((line, n) => {
          if (!line) return;
          const top = toViewer(el.x, el.y);
          const vx = top.x + alignOffset(widths[n], boxWidth, el.align);
          const vy = top.y - el.fontSize * (BASELINE + LINE_HEIGHT * n);
          const p = viewerToPdf(vx, vy, box);
          page.drawText(line, { x: p.x, y: p.y, size: el.fontSize, font: f, color: lib.rgb(color.r, color.g, color.b), rotate: lib.degrees(angle) });
        });
      } else if (el.type === "image") {
        const embedded = await embedImage(doc, el.bytes);
        const center = toViewer(el.x + el.w / 2, el.y + el.h / 2);
        drawImageAt(page, embedded, { center, width: el.w * viewer.width, height: el.h * viewer.height, opacity: el.opacity ?? 1 }, lib);
      } else if (el.type === "highlight") {
        const center = viewerToPdf(...Object.values(toViewer(el.x + el.w / 2, el.y + el.h / 2)), box);
        const w = el.w * viewer.width;
        const h = el.h * viewer.height;
        const origin = originForCenteredRotation(center.x, center.y, w, h, angle);
        const c = hexToRgb01(el.color);
        page.drawRectangle({ x: origin.x, y: origin.y, width: w, height: h, rotate: lib.degrees(angle), color: lib.rgb(c.r, c.g, c.b), opacity: el.opacity ?? 0.35, blendMode: lib.BlendMode.Multiply });
      } else if (el.type === "draw" && el.points.length > 1) {
        // drawSvgPath flips y, so feed it PDF coordinates with y negated.
        const d = el.points
          .map(([fx, fy], n) => {
            const v = toViewer(fx, fy);
            const p = viewerToPdf(v.x, v.y, box);
            return `${n ? "L" : "M"}${p.x.toFixed(2)} ${(-p.y).toFixed(2)}`;
          })
          .join(" ");
        const c = hexToRgb01(el.color);
        page.drawSvgPath(d, { x: 0, y: 0, borderColor: lib.rgb(c.r, c.g, c.b), borderWidth: el.width, borderLineCap: lib.LineCapStyle.Round });
      }
    }
    await yieldToBrowser();
  }
  report?.(0, 0, "Saving PDF…");
  return savePdf(doc);
}
