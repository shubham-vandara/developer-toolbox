// Page geometry shared by the PDF tools. PDF space has its origin at the
// bottom-left and y pointing up. "Viewer" space is the page as displayed,
// i.e. after the page's /Rotate is applied — what the user sees and places
// things on. All values are in PDF points (1/72 inch) unless noted.

export const PAGE_SIZES = {
  a4: { label: "A4", width: 595.28, height: 841.89 },
  letter: { label: "Letter", width: 612, height: 792 },
};

export const POSITIONS = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

export function normalizeRotation(degrees) {
  return (((Math.round(degrees / 90) * 90) % 360) + 360) % 360;
}

// Size of the page as displayed. `page` = { width, height, rotation } of the unrotated box.
export function getViewerSize({ width, height, rotation = 0 }) {
  const r = normalizeRotation(rotation);
  return r === 90 || r === 270 ? { width: height, height: width } : { width, height };
}

/**
 * Map a point from viewer space (bottom-left origin, as displayed) to PDF
 * user space of the page, accounting for /Rotate and a box offset (x0, y0).
 */
export function viewerToPdf(vx, vy, { width, height, rotation = 0, x0 = 0, y0 = 0 }) {
  const r = normalizeRotation(rotation);
  let x;
  let y;
  if (r === 90) {
    x = width - vy;
    y = vx;
  } else if (r === 180) {
    x = width - vx;
    y = height - vy;
  } else if (r === 270) {
    x = vy;
    y = height - vx;
  } else {
    x = vx;
    y = vy;
  }
  return { x: x + x0, y: y + y0 };
}

// Counter-clockwise angle to draw with so content looks upright to the viewer.
export function viewerToPdfAngle(angle, rotation = 0) {
  return angle + normalizeRotation(rotation);
}

/**
 * pdf-lib rotates text/images around their bottom-left origin. Return the
 * origin that makes a w×h box rotated by `angle` (degrees, CCW) end up
 * centered on (cx, cy).
 */
export function originForCenteredRotation(cx, cy, w, h, angle) {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: cx - (w / 2) * cos + (h / 2) * sin,
    y: cy - (w / 2) * sin - (h / 2) * cos,
  };
}

// Axis-aligned bounding box of a w×h box rotated by `angle`.
export function rotatedBounds(w, h, angle) {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return { width: w * cos + h * sin, height: w * sin + h * cos };
}

/**
 * Center point (viewer space, bottom-left origin) for a box of size
 * boxW×boxH placed at a named position with a margin from the edges.
 */
export function anchorCenter(position, pageW, pageH, boxW, boxH, margin = 36) {
  const [vertical, horizontal = "center"] = position === "center" ? ["center", "center"] : position.split("-");
  const cx =
    horizontal === "left" ? margin + boxW / 2 : horizontal === "right" ? pageW - margin - boxW / 2 : pageW / 2;
  const cy = vertical === "top" ? pageH - margin - boxH / 2 : vertical === "bottom" ? margin + boxH / 2 : pageH / 2;
  return { x: cx, y: cy };
}

/**
 * Page size for an image placed on its own page.
 * size: "a4" | "letter" | "original"; orientation: "portrait" | "landscape" | "auto".
 * Image dimensions are in pixels; "original" maps 1px → 0.75pt (96 DPI).
 */
export function resolvePageSize(size, orientation, imageWidth, imageHeight) {
  if (size === "original") return { width: imageWidth * 0.75, height: imageHeight * 0.75 };
  const base = PAGE_SIZES[size] ?? PAGE_SIZES.a4;
  const landscape = orientation === "landscape" || (orientation === "auto" && imageWidth > imageHeight);
  return landscape ? { width: base.height, height: base.width } : { width: base.width, height: base.height };
}

/**
 * Where to draw an image on a page (PDF coords). fit: "fit" (contain),
 * "fill" (cover; caller clips to the content box) or "original" (96 DPI,
 * centered, shrunk only if it would overflow).
 */
export function placeImage(imageWidth, imageHeight, pageWidth, pageHeight, { fit = "fit", margin = 0 } = {}) {
  const boxW = Math.max(1, pageWidth - margin * 2);
  const boxH = Math.max(1, pageHeight - margin * 2);
  let scale;
  if (fit === "fill") scale = Math.max(boxW / imageWidth, boxH / imageHeight);
  else if (fit === "original") scale = Math.min(0.75, boxW / imageWidth, boxH / imageHeight);
  else scale = Math.min(boxW / imageWidth, boxH / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: margin + (boxW - width) / 2,
    y: margin + (boxH - height) / 2,
    width,
    height,
    clip: { x: margin, y: margin, width: boxW, height: boxH },
  };
}

export const PAGE_NUMBER_FORMATS = [
  { value: "{n}", label: "1" },
  { value: "Page {n}", label: "Page 1" },
  { value: "Page {n} of {total}", label: "Page 1 of N" },
  { value: "{n} / {total}", label: "1 / N" },
  { value: "- {n} -", label: "- 1 -" },
];

export function formatPageNumber(template, n, total) {
  return template.replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total));
}

/** Convert an overlay rect (fractions of the viewer page, top-left origin) to viewer points (bottom-left origin). */
export function fractionRectToViewer(rect, viewer) {
  return {
    x: rect.x * viewer.width,
    y: (1 - rect.y - rect.h) * viewer.height,
    width: rect.w * viewer.width,
    height: rect.h * viewer.height,
  };
}
