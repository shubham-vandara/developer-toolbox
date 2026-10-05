// PDF → Office/image conversions that genuinely work in a browser.
// Each produces a real, valid file; what each keeps is stated in the UI.
import { buildDocx, buildXlsx } from "../../utils/office.js";
import { OUTPUT_FORMATS } from "../../utils/image.js";
import { createZip } from "../../utils/zip.js";
import { PdfToolError, yieldToBrowser } from "../../utils/pdf/engine.js";
import { groupLines, groupParagraphs, groupTable, normalizeItems } from "../../utils/pdf/textLayout.js";
import { rasterizePages } from "../../utils/pdf/rasterize.js";
import { allPages } from "../../utils/pdf/pageRanges.js";

const NO_TEXT =
  "This PDF has no selectable text — it's probably a scanned document. Text can't be extracted without OCR, which this tool doesn't do. Try “Word – page images” or PowerPoint instead.";

async function firstPageSize(doc) {
  const page = await doc.getPage(1);
  const { width, height } = page.getViewport({ scale: 1, rotation: page.rotate });
  return { width, height };
}

async function readLines(doc, report) {
  const pages = [];
  let characters = 0;
  for (let n = 1; n <= doc.numPages; n += 1) {
    report?.(n - 1, doc.numPages, "Reading text from page");
    const page = await doc.getPage(n);
    const content = await page.getTextContent();
    const lines = groupLines(normalizeItems(content.items));
    characters += lines.reduce((sum, line) => sum + line.text.length, 0);
    pages.push(lines);
    page.cleanup();
    await yieldToBrowser();
  }
  if (characters === 0) throw new PdfToolError(NO_TEXT, "no-text");
  return pages;
}

async function renderJpegs(doc, report, dpi = 150) {
  const rendered = await rasterizePages(doc, allPages(doc.numPages), { dpi, format: OUTPUT_FORMATS.jpeg, quality: 0.85 }, report);
  return Promise.all(rendered.map(async (r) => ({ ...r, data: new Uint8Array(await r.blob.arrayBuffer()) })));
}

function fitBox(width, height, boxW, boxH) {
  const scale = Math.min(boxW / width, boxH / height);
  return { width: width * scale, height: height * scale };
}

export async function pdfToDocxText(doc, report) {
  const pages = await readLines(doc, report);
  const size = await firstPageSize(doc);
  const blocks = [];
  pages.forEach((lines, i) => {
    if (i > 0) blocks.push({ type: "pageBreak" });
    groupParagraphs(lines).forEach((p) => blocks.push({ type: "paragraph", text: p.text, size: p.size }));
  });
  return buildDocx({ blocks, page: { ...size, margin: 54 } });
}

export async function pdfToDocxImages(doc, report) {
  const size = await firstPageSize(doc);
  const margin = 18;
  const images = await renderJpegs(doc, report);
  const blocks = [];
  images.forEach((image, i) => {
    if (i > 0) blocks.push({ type: "pageBreak" });
    // Slightly under the content box so Word never pushes an image to the next page.
    const box = fitBox(image.width, image.height, (size.width - margin * 2) * 0.98, (size.height - margin * 2) * 0.97);
    blocks.push({ type: "image", index: i, ...box });
  });
  return buildDocx({ blocks, images, page: { ...size, margin } });
}

export async function pdfToXlsx(doc, report) {
  const pages = await readLines(doc, report);
  return buildXlsx(pages.map((lines, i) => ({ name: `Page ${i + 1}`, rows: groupTable(lines) })));
}

export async function pdfToPptx(doc, report) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const size = await firstPageSize(doc);
  const slideW = 10;
  const slideH = (slideW * size.height) / size.width;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "PDF", width: slideW, height: slideH });
  pptx.layout = "PDF";
  const images = await renderJpegs(doc, report);
  for (let i = 0; i < images.length; i += 1) {
    report?.(i, images.length, "Building slide");
    const image = images[i];
    const fit = fitBox(image.width, image.height, slideW, slideH);
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(image.blob);
    });
    const slide = pptx.addSlide();
    slide.addImage({ data: dataUrl, x: (slideW - fit.width) / 2, y: (slideH - fit.height) / 2, w: fit.width, h: fit.height });
    // Keep the page's text searchable/copyable in the speaker notes.
    const page = await doc.getPage(i + 1);
    const text = groupLines(normalizeItems((await page.getTextContent()).items)).map((l) => l.text).join("\n");
    if (text) slide.addNotes(text);
  }
  report?.(0, 0, "Saving presentation…");
  return pptx.write({ outputType: "blob" });
}

export async function pdfToImageFiles(doc, formatId, baseName, report) {
  const format = OUTPUT_FORMATS[formatId];
  const rendered = await rasterizePages(doc, allPages(doc.numPages), { dpi: 150, format, quality: 0.9 }, report);
  if (rendered.length === 1) return { blob: rendered[0].blob, filename: `${baseName}.${format.extension}` };
  const entries = await Promise.all(
    rendered.map(async (r) => ({ name: `${baseName}-page-${r.pageNumber}.${format.extension}`, data: new Uint8Array(await r.blob.arrayBuffer()) })),
  );
  return { blob: new Blob([createZip(entries)], { type: "application/zip" }), filename: `${baseName}-${format.extension}.zip` };
}
