export function removeDuplicateLines(input, { ignoreCase = false, trimLines = false, sort = false } = {}) {
  const lines = input.split("\n");
  const seen = new Set();
  const result = [];

  for (const rawLine of lines) {
    const line = trimLines ? rawLine.trim() : rawLine;
    const key = ignoreCase ? line.toLowerCase() : line;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  if (sort) {
    result.sort((a, b) => a.localeCompare(b));
  }

  return { lines: result, removedCount: lines.length - result.length };
}
