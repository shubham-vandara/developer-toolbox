// The single entry point to the PDF libraries. Both are loaded with dynamic
// import() so they're only downloaded when a PDF tool actually needs them:
//   - @cantoo/pdf-lib: create/modify/encrypt/decrypt PDFs
//   - pdfjs-dist (Mozilla PDF.js): render pages and read text
// PDFs are treated as untrusted: PDF.js runs in a worker with eval and XFA
// disabled, pages are only ever drawn to <canvas>, and no PDF content is
// inserted into the DOM. Nothing is uploaded anywhere.
import { MB } from "../file.js";

export const PDF_ACCEPT = "application/pdf,.pdf";
export const MAX_PDF_SIZE = 200 * MB;

// Messages on this error are safe to show to users as-is.
export class PdfToolError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "PdfToolError";
    this.code = code;
  }
}

let pdfLibPromise = null;
let pdfJsPromise = null;

export function loadPdfLib() {
  pdfLibPromise ??= import("@cantoo/pdf-lib");
  return pdfLibPromise;
}

export function loadPdfJs() {
  pdfJsPromise ??= Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]).then(
    ([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = worker.default;
      return lib;
    },
  );
  return pdfJsPromise;
}

export function isPdfHeader(bytes) {
  // The spec allows junk before the header; readers accept it within 1 KB.
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 1024));
  return head.includes("%PDF-");
}

export async function readPdfFile(file) {
  if (!file) throw new PdfToolError("No file selected.");
  if (file.size === 0) throw new PdfToolError("This file is empty.");
  if (file.size > MAX_PDF_SIZE) {
    throw new PdfToolError(`This PDF is too large (max ${MAX_PDF_SIZE / MB} MB) to process safely in the browser.`);
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdfHeader(bytes)) {
    throw new PdfToolError(`"${file.name}" isn't a PDF file. Choose a .pdf document.`, "not-pdf");
  }
  return bytes;
}

const PASSWORD_REQUIRED = "This PDF is password-protected.";

/** Open a PDF for rendering/text extraction with PDF.js. */
export async function openForRender(bytes, { password } = {}) {
  const pdfjs = await loadPdfJs();
  // PDF.js transfers (detaches) the buffer it's given, so always pass a copy.
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    password,
    isEvalSupported: false,
    enableXfa: false,
    disableAutoFetch: true,
  });
  try {
    return await task.promise;
  } catch (error) {
    task.destroy();
    if (error?.name === "PasswordException") {
      throw new PdfToolError(
        error.code === pdfjs.PasswordResponses.INCORRECT_PASSWORD ? "That password is incorrect." : PASSWORD_REQUIRED,
        error.code === pdfjs.PasswordResponses.INCORRECT_PASSWORD ? "wrong-password" : "password",
      );
    }
    throw new PdfToolError("This PDF couldn't be opened. It may be damaged or not a valid PDF.", "invalid");
  }
}

/** Release a PDF.js document and its worker resources (pdf.js 6: via its loading task). */
export function closeRenderDoc(doc) {
  return doc?.loadingTask?.destroy();
}

/** Open a PDF for modification with pdf-lib. */
export async function openForEdit(bytes, { password } = {}) {
  const { PDFDocument } = await loadPdfLib();
  try {
    return await PDFDocument.load(bytes, {
      updateMetadata: false,
      ...(password !== undefined ? { password } : {}),
    });
  } catch (error) {
    throw toPdfError(error);
  }
}

export function toPdfError(error) {
  if (error instanceof PdfToolError) return error;
  const message = String(error?.message ?? "");
  if (/password incorrect/i.test(message)) return new PdfToolError("That password is incorrect.", "wrong-password");
  if (/unknown (crypto|encryption) method|unsupported (encryption )?algorithm|crypt filter/i.test(message)) {
    return new PdfToolError(
      "This PDF uses an encryption method this tool can't open (for example certificate-based encryption).",
      "unsupported-encryption",
    );
  }
  if (/encrypt|needs password/i.test(message)) return new PdfToolError(PASSWORD_REQUIRED, "password");
  return new PdfToolError("This PDF couldn't be processed. It may be damaged or use features this tool doesn't support.");
}

export function getPdfErrorMessage(error, fallback = "Something went wrong while processing this PDF.") {
  if (error instanceof PdfToolError) return error.message;
  if (error instanceof RangeError || /memory|allocation/i.test(String(error?.message))) {
    return "Your browser ran out of memory. Try a smaller PDF or fewer pages at once.";
  }
  if (error?.name === "ImageToolError") return error.message;
  return fallback;
}

/**
 * pdf-lib keeps the input's old cross-reference streams as ordinary objects
 * and would write them out again. They're dead weight at best and can
 * mislead readers that scan objects (and still carry /Encrypt for files
 * that were decrypted), so drop them before saving.
 */
export async function removeStaleXrefs(doc, { includeEncryption = false } = {}) {
  const { PDFName, PDFRawStream, PDFDict, PDFInvalidObject } = await loadPdfLib();
  const { context } = doc;
  for (const [ref, object] of context.enumerateIndirectObjects()) {
    const dict = object instanceof PDFRawStream ? object.dict : null;
    if (dict?.get(PDFName.of("Type")) === PDFName.of("XRef")) {
      context.delete(ref);
    } else if (includeEncryption) {
      const isEncryptDict = object instanceof PDFDict && object.get(PDFName.of("Filter")) && object.get(PDFName.of("O")) && object.get(PDFName.of("U"));
      // An encrypted XRef stream that couldn't be parsed after decryption.
      const isBrokenXref = object instanceof PDFInvalidObject && /\/XRef|\/Encrypt/.test(new TextDecoder("latin1").decode(object.data ?? new Uint8Array()));
      if (isEncryptDict || isBrokenXref) context.delete(ref);
    }
  }
}

export async function savePdf(doc, options = {}) {
  await removeStaleXrefs(doc);
  const bytes = await doc.save({ useObjectStreams: true, ...options });
  return new Blob([bytes], { type: "application/pdf" });
}

// Let the browser paint (e.g. progress) between heavy steps.
export function yieldToBrowser() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/** Copy the given 1-based pages (in order) of `source` into a new document. */
export async function buildFromPages(source, pageNumbers, transform) {
  const { PDFDocument, degrees } = await loadPdfLib();
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    source,
    pageNumbers.map((n) => n - 1),
  );
  copied.forEach((page, index) => {
    out.addPage(page);
    transform?.(page, index, { degrees });
  });
  return out;
}

/**
 * Render a page into `canvas` so it is `targetWidth` CSS pixels wide.
 * Returns the PDF.js RenderTask (cancel with task.cancel()).
 */
export function renderPage(page, canvas, { targetWidth, scale: fixedScale, rotation = 0, background = "#ffffff" }) {
  const base = page.getViewport({ scale: 1, rotation: page.rotate + rotation });
  const ratio = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const scale = fixedScale ?? (targetWidth / base.width) * ratio;
  const viewport = page.getViewport({ scale, rotation: page.rotate + rotation });
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  return page.render({ canvas, viewport, background });
}

/** Unrotated crop box + rotation of a PDF.js page, for overlay geometry. */
export function getPageBox(page) {
  const [x1, y1, x2, y2] = page.view;
  return { x0: x1, y0: y1, width: x2 - x1, height: y2 - y1, rotation: page.rotate };
}

/** Same for a pdf-lib page. */
export function getLibPageBox(page) {
  const box = page.getCropBox();
  return { x0: box.x, y0: box.y, width: box.width, height: box.height, rotation: page.getRotation().angle };
}
