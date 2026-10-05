// Turns PDF.js text runs into lines, paragraphs and table-like rows.
// PDFs store positioned text runs, not paragraphs or tables, so this is a
// heuristic reconstruction: good for ordinary documents and simple tables,
// not for complex multi-column layouts.

/** Normalize PDF.js textContent items to { text, x, y, width, size } (PDF units, y up). */
export function normalizeItems(items) {
  return items
    // PDF.js adds whitespace-only items that span gaps (e.g. between table
    // cells); spacing is rebuilt from positions instead, so drop them.
    .filter((item) => typeof item.str === "string" && item.str.trim().length > 0)
    .map((item) => {
      const [a, b, c, d, e, f] = item.transform;
      const size = Math.hypot(c, d) || Math.hypot(a, b) || item.height || 10;
      return { text: item.str, x: e, y: f, width: item.width ?? item.str.length * size * 0.5, size };
    });
}

/** Group runs into lines (top to bottom), runs within a line left to right. */
export function groupLines(runs) {
  const sorted = [...runs].sort((p, q) => q.y - p.y || p.x - q.x);
  const lines = [];
  for (const run of sorted) {
    const line = lines.find((l) => Math.abs(l.y - run.y) <= Math.max(l.size, run.size) * 0.5);
    if (line) {
      line.runs.push(run);
      line.size = Math.max(line.size, run.size);
    } else {
      lines.push({ y: run.y, size: run.size, runs: [run] });
    }
  }
  lines.sort((p, q) => q.y - p.y);
  for (const line of lines) {
    line.runs.sort((p, q) => p.x - q.x);
    line.x = line.runs[0].x;
    line.text = joinRuns(line.runs);
  }
  return lines.filter((line) => line.text.trim());
}

function joinRuns(runs) {
  let text = "";
  let end = null;
  for (const run of runs) {
    if (end !== null) {
      const gap = run.x - end;
      if (gap > run.size * 0.2 && !/\s$/.test(text) && !/^\s/.test(run.text)) text += " ";
    }
    text += run.text;
    end = run.x + run.width;
  }
  return text.replace(/\s+/g, " ").trim();
}

/** Merge consecutive lines into paragraphs; a large vertical gap starts a new one. */
export function groupParagraphs(lines) {
  const paragraphs = [];
  let current = null;
  let previous = null;
  for (const line of lines) {
    const gap = previous ? previous.y - line.y : 0;
    const newParagraph = !current || gap > Math.max(previous.size, line.size) * 1.8 || Math.abs(line.size - previous.size) > 1.5;
    if (newParagraph) {
      current = { text: line.text, size: line.size };
      paragraphs.push(current);
    } else {
      // Re-join words hyphenated across lines.
      current.text = /[A-Za-z]-$/.test(current.text) ? current.text.slice(0, -1) + line.text : `${current.text} ${line.text}`;
    }
    previous = line;
  }
  return paragraphs;
}

/**
 * Rows of cells for spreadsheet export: runs separated by a wide gap become
 * separate cells, and cells are snapped to columns shared across the page.
 */
export function groupTable(lines) {
  const rows = lines.map((line) => {
    const cells = [];
    let cell = null;
    for (const run of line.runs) {
      if (cell && run.x - (cell.end ?? cell.x) < run.size * 1.2) {
        cell.runs.push(run);
        cell.end = run.x + run.width;
      } else {
        cell = { x: run.x, end: run.x + run.width, runs: [run] };
        cells.push(cell);
      }
    }
    return cells.map((c) => ({ x: c.x, text: joinRuns(c.runs) })).filter((c) => c.text);
  });

  // Column anchors: cluster cell start positions.
  const starts = rows.flat().map((c) => c.x).sort((a, b) => a - b);
  const columns = [];
  for (const x of starts) {
    if (!columns.length || x - columns[columns.length - 1] > 12) columns.push(x);
  }
  const columnOf = (x) => {
    let best = 0;
    for (let i = 0; i < columns.length; i += 1) if (columns[i] <= x + 6) best = i;
    return best;
  };

  return rows.map((cells) => {
    const row = [];
    for (const cell of cells) {
      let index = columnOf(cell.x);
      while (row[index] !== undefined) index += 1; // never overwrite a cell
      row[index] = cell.text;
    }
    return Array.from(row, (value) => value ?? "");
  });
}
