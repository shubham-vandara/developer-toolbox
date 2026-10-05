// Minimal, standards-conformant Office Open XML writers (DOCX and XLSX),
// packaged with the project's ZIP writer. They produce genuine documents
// that Word/Excel/LibreOffice open natively — no conversion service involved.
import { createZip } from "./zip.js";

// XML 1.0 forbids most control characters; PDF text often contains them.
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

export function xmlEscape(value) {
  return String(value)
    .replace(INVALID_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const OFFICE_DOC_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument";

/* ------------------------------------------------------------------ DOCX */

const EMU_PER_POINT = 12700;
const TWIPS_PER_POINT = 20;

/**
 * blocks: [{ type: "paragraph", text, size }, { type: "pageBreak" },
 *          { type: "image", index, width, height }]  (sizes in points)
 * images: [{ data: Uint8Array }] JPEG bytes referenced by image blocks' index
 * page: { width, height, margin } in points
 */
export function buildDocxParts({ blocks, images = [], page = { width: 612, height: 792, margin: 72 } }) {
  const body = blocks
    .map((block) => {
      if (block.type === "pageBreak") return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      if (block.type === "image") {
        const n = block.index + 1;
        const cx = Math.round(block.width * EMU_PER_POINT);
        const cy = Math.round(block.height * EMU_PER_POINT);
        return (
          `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing>` +
          `<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="Page ${n}"/>` +
          `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>` +
          `<pic:nvPicPr><pic:cNvPr id="${n}" name="page${n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr>` +
          `<pic:blipFill><a:blip r:embed="rIdImg${n}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
          `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
          `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`
        );
      }
      const halfPoints = Math.max(12, Math.min(144, Math.round((block.size ?? 11) * 2)));
      return `<w:p><w:r><w:rPr><w:sz w:val="${halfPoints}"/><w:szCs w:val="${halfPoints}"/></w:rPr><w:t xml:space="preserve">${xmlEscape(block.text)}</w:t></w:r></w:p>`;
    })
    .join("");

  const m = Math.round(page.margin * TWIPS_PER_POINT);
  const document =
    `${XML_HEAD}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ` +
    `xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ` +
    `xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ` +
    `xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${body || "<w:p/>"}` +
    `<w:sectPr><w:pgSz w:w="${Math.round(page.width * TWIPS_PER_POINT)}" w:h="${Math.round(page.height * TWIPS_PER_POINT)}"${page.width > page.height ? ' w:orient="landscape"' : ""}/>` +
    `<w:pgMar w:top="${m}" w:right="${m}" w:bottom="${m}" w:left="${m}" w:header="0" w:footer="0" w:gutter="0"/></w:sectPr></w:body></w:document>`;

  const imageRels = images
    .map((_, i) => `<Relationship Id="rIdImg${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i + 1}.jpeg"/>`)
    .join("");

  return [
    {
      name: "[Content_Types].xml",
      data:
        `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    },
    { name: "_rels/.rels", data: `${XML_HEAD}<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${OFFICE_DOC_REL}" Target="word/document.xml"/></Relationships>` },
    { name: "word/document.xml", data: document },
    { name: "word/_rels/document.xml.rels", data: `${XML_HEAD}<Relationships xmlns="${REL_NS}">${imageRels}</Relationships>` },
    ...images.map((image, i) => ({ name: `word/media/image${i + 1}.jpeg`, data: image.data })),
  ];
}

export function buildDocx(options) {
  return new Blob([createZip(buildDocxParts(options))], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/* ------------------------------------------------------------------ XLSX */

export function columnName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

// "1,234.50" → 1234.5; leaves anything ambiguous as text.
export function toNumber(text) {
  const t = text.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return Number(t.replace(/,/g, ""));
  return null;
}

// Excel sheet names: ≤31 chars, no []:*?/\ and unique.
export function sheetName(name, used) {
  const base = name.replace(/[[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet";
  let candidate = base;
  for (let i = 2; used.has(candidate.toLowerCase()); i += 1) candidate = `${base.slice(0, 27)} (${i})`;
  used.add(candidate.toLowerCase());
  return candidate;
}

/** sheets: [{ name, rows: string[][] }] */
export function buildXlsxParts(sheets) {
  const used = new Set();
  const named = (sheets.length ? sheets : [{ name: "Sheet1", rows: [] }]).map((s) => ({ ...s, name: sheetName(s.name, used) }));
  const sheetXml = (rows) =>
    `${XML_HEAD}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>` +
    rows
      .map((row, r) => {
        const cells = row
          .map((value, c) => {
            if (value === "" || value == null) return "";
            const ref = `${columnName(c)}${r + 1}`;
            const number = toNumber(String(value));
            return number !== null && Number.isFinite(number)
              ? `<c r="${ref}"><v>${number}</v></c>`
              : `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
          })
          .join("");
        return `<row r="${r + 1}">${cells}</row>`;
      })
      .join("") +
    "</sheetData></worksheet>";

  return [
    {
      name: "[Content_Types].xml",
      data:
        `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        named.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("") +
        "</Types>",
    },
    { name: "_rels/.rels", data: `${XML_HEAD}<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${OFFICE_DOC_REL}" Target="xl/workbook.xml"/></Relationships>` },
    {
      name: "xl/workbook.xml",
      data:
        `${XML_HEAD}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>` +
        named.map((s, i) => `<sheet name="${xmlEscape(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") +
        "</sheets></workbook>",
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      data:
        `${XML_HEAD}<Relationships xmlns="${REL_NS}">` +
        named.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") +
        "</Relationships>",
    },
    ...named.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s.rows) })),
  ];
}

export function buildXlsx(sheets) {
  return new Blob([createZip(buildXlsxParts(sheets))], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
