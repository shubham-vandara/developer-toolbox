// SVG parsing and sanitization for the SVG tools. Uploaded SVG is treated as
// untrusted: it is validated as XML, sanitized with DOMPurify (scripts, event
// handlers, foreignObject, javascript: and external URLs removed), and only
// ever rendered through <img>/canvas — never injected into the page DOM.
import DOMPurify from "dompurify";

export const SVG_ACCEPT = "image/svg+xml,.svg";
const SVG_NS = "http://www.w3.org/2000/svg";
// Browsers render SVGs with no size information at 300×150.
const DEFAULT_SIZE = { width: 300, height: 150 };

const SAFE_HREF = /^(#|data:image\/(png|jpe?g|gif|webp);base64,)/i;
// Any url(...) that isn't a same-document fragment reference like url(#grad).
const EXTERNAL_URL = /url\(\s*(?!['"]?\s*#)[^)]*\)/gi;

let purifier = null;
let hookRemovals = 0;

// A dedicated instance so these hooks never affect other DOMPurify users.
function getPurifier() {
  if (purifier) return purifier;
  purifier = DOMPurify(window);
  purifier.addHook("uponSanitizeAttribute", (_node, data) => {
    const name = data.attrName.toLowerCase();
    const value = data.attrValue.trim();
    if ((name === "href" || name === "xlink:href") && !SAFE_HREF.test(value)) {
      data.keepAttr = false;
      hookRemovals += 1;
    } else if (name === "style" && EXTERNAL_URL.test(value)) {
      data.attrValue = value.replace(EXTERNAL_URL, "none");
      hookRemovals += 1;
    }
    EXTERNAL_URL.lastIndex = 0;
  });
  purifier.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName === "style" && node.textContent) {
      const cleaned = node.textContent.replace(/@import[^;]*;?/gi, "").replace(EXTERNAL_URL, "none");
      if (cleaned !== node.textContent) {
        node.textContent = cleaned;
        hookRemovals += 1;
      }
    }
  });
  return purifier;
}

function parseLength(value) {
  if (!value) return null;
  const match = /^\s*([\d.]+)\s*(px)?\s*$/i.exec(value);
  if (!match) return null;
  const number = parseFloat(match[1]);
  return number > 0 ? number : null;
}

function parseViewBox(value) {
  if (!value) return null;
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n)) || parts[2] <= 0 || parts[3] <= 0) {
    return null;
  }
  return { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
}

export function getSvgInfo(svgElement) {
  const widthAttr = svgElement.getAttribute("width");
  const heightAttr = svgElement.getAttribute("height");
  const viewBoxAttr = svgElement.getAttribute("viewBox");
  const viewBox = parseViewBox(viewBoxAttr);
  let width = parseLength(widthAttr);
  let height = parseLength(heightAttr);

  if (viewBox) {
    const ratio = viewBox.width / viewBox.height;
    if (width && !height) height = width / ratio;
    if (height && !width) width = height * ratio;
  }
  const intrinsic = {
    width: Math.round(width ?? viewBox?.width ?? DEFAULT_SIZE.width),
    height: Math.round(height ?? viewBox?.height ?? DEFAULT_SIZE.height),
  };

  return {
    widthAttr,
    heightAttr,
    viewBoxAttr: viewBox ? viewBoxAttr : null,
    viewBox,
    width: Math.max(1, intrinsic.width),
    height: Math.max(1, intrinsic.height),
    hasExplicitSize: Boolean(width && height),
    elementCount: svgElement.getElementsByTagName("*").length + 1,
  };
}

function describeParserError(doc) {
  const text = doc.querySelector("parsererror")?.textContent ?? "";
  const line = /line\s*(?:number\s*)?(\d+)/i.exec(text)?.[1];
  return line ? `Check the markup near line ${line}.` : undefined;
}

/**
 * Validate and sanitize SVG markup.
 * Returns { success, svg, info, removedCount } or { success: false, error, detail }.
 */
export function sanitizeSvg(source) {
  if (!source || !source.trim()) {
    return { success: false, error: "Paste SVG markup or upload an .svg file." };
  }

  // Parsing as XML never executes scripts; it only checks well-formedness.
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const root = doc.documentElement;
  if (doc.querySelector("parsererror") || root?.localName !== "svg" || root.namespaceURI !== SVG_NS) {
    return {
      success: false,
      error: "This isn't valid SVG. Make sure the markup is well-formed and starts with an <svg> element.",
      detail: describeParserError(doc),
    };
  }

  const instance = getPurifier();
  hookRemovals = 0;
  const fragment = instance.sanitize(source, {
    USE_PROFILES: { svg: true, svgFilters: true },
    // <use> is safe here because the href hook only keeps "#fragment" targets.
    ADD_TAGS: ["use"],
    FORBID_TAGS: ["foreignObject", "script", "iframe", "embed", "object", "audio", "video"],
    RETURN_DOM_FRAGMENT: true,
  });
  // DOMPurify also reports its own <body> parse wrapper and namespace
  // declarations (re-added on serialization); neither is unsafe content.
  const removedCount =
    instance.removed.filter(
      (item) => !(item.element && /^(html|head|body)$/i.test(item.element.nodeName)) && !item.attribute?.name?.startsWith("xmlns"),
    ).length + hookRemovals;
  const svgElement = fragment.querySelector("svg");

  if (!svgElement) {
    return { success: false, error: "Nothing renderable was left after removing unsafe content from this SVG." };
  }

  const info = getSvgInfo(svgElement);
  // XMLSerializer emits the SVG namespace, which <img> rendering requires.
  const svg = new XMLSerializer().serializeToString(svgElement);
  return { success: true, svg, info, removedCount };
}

// Return sanitized SVG markup sized to exactly width × height for rasterizing.
export function resizeSvgMarkup(svg, info, width, height) {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  if (!root.getAttribute("viewBox") || !info.viewBox) {
    // Without a viewBox, changing width/height would crop instead of scale.
    root.setAttribute("viewBox", `0 0 ${info.width} ${info.height}`);
  }
  root.setAttribute("width", String(width));
  root.setAttribute("height", String(height));
  return new XMLSerializer().serializeToString(root);
}

export function svgToBlob(svg) {
  return new Blob([svg], { type: "image/svg+xml" });
}
