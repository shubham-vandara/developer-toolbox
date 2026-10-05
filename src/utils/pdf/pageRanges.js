// Page selection syntax shared by the PDF tools: "1-3, 5, 8-" (1-based).
// "a-" runs to the last page, "-b" starts at page 1.

/**
 * @returns {{ success: true, ranges: [number, number][], pages: number[] } | { success: false, error: string }}
 * `ranges` keeps the user's order; `pages` is unique and sorted.
 */
export function parsePageRanges(input, pageCount) {
  const text = (input ?? "").trim();
  if (!text) return { success: false, error: "Enter at least one page or range, e.g. 1-3, 5." };
  if (/^all$/i.test(text)) return { success: true, ranges: [[1, pageCount]], pages: allPages(pageCount) };

  const ranges = [];
  // "1 - 3" → "1-3" so spaces around dashes don't split a range in two.
  const normalized = text.replace(/\s*[-–—]\s*/g, "-");
  for (const raw of normalized.split(/[,;]+|\s+/)) {
    const token = raw.replace(/\s+/g, "");
    if (!token) continue;
    const match = /^(\d*)(?:(-|–|—)(\d*))?$/.exec(token);
    if (!match || (!match[1] && !match[3])) {
      return { success: false, error: `"${raw.trim()}" isn't a valid page or range. Use numbers like 4 or 2-6.` };
    }
    const isRange = Boolean(match[2]);
    const start = match[1] ? Number(match[1]) : 1;
    const end = isRange ? (match[3] ? Number(match[3]) : pageCount) : start;
    if (start < 1 || end < 1) return { success: false, error: "Page numbers start at 1." };
    if (start > pageCount || end > pageCount) {
      return {
        success: false,
        error: `Page ${Math.max(start, end)} doesn't exist — this PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
      };
    }
    if (start > end) return { success: false, error: `The range ${start}-${end} is backwards. Did you mean ${end}-${start}?` };
    ranges.push([start, end]);
  }
  if (!ranges.length) return { success: false, error: "Enter at least one page or range, e.g. 1-3, 5." };

  const set = new Set();
  ranges.forEach(([a, b]) => {
    for (let p = a; p <= b; p += 1) set.add(p);
  });
  return { success: true, ranges, pages: [...set].sort((x, y) => x - y) };
}

export function allPages(pageCount) {
  return Array.from({ length: pageCount }, (_, i) => i + 1);
}

// [1,2,3,5,8,9,10] → "1–3, 5, 8–10"
export function formatPageList(pages, dash = "–") {
  const sorted = [...new Set(pages)].sort((a, b) => a - b);
  const parts = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const start = sorted[i];
    while (sorted[i + 1] === sorted[i] + 1) i += 1;
    parts.push(start === sorted[i] ? `${start}` : `${start}${dash}${sorted[i]}`);
  }
  return parts.join(", ");
}

export function splitEveryN(pageCount, n) {
  const size = Math.max(1, Math.floor(n));
  const ranges = [];
  for (let start = 1; start <= pageCount; start += size) ranges.push([start, Math.min(pageCount, start + size - 1)]);
  return ranges;
}

export function rangeLabel([start, end]) {
  return start === end ? `${start}` : `${start}-${end}`;
}

export function pagesInRange([start, end]) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
