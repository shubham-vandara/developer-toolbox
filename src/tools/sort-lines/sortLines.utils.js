export const SORT_MODES = [
  { id: "az", label: "A → Z" },
  { id: "za", label: "Z → A" },
  { id: "numeric-asc", label: "Numeric ascending" },
  { id: "numeric-desc", label: "Numeric descending" },
  { id: "length", label: "Line length" },
];

export function sortLines(input, { mode = "az", removeDuplicates = false, ignoreCase = false, preserveEmpty = true } = {}) {
  let lines = input.split("\n");
  if (!preserveEmpty) {
    lines = lines.filter((line) => line.trim() !== "");
  }

  if (removeDuplicates) {
    const seen = new Set();
    lines = lines.filter((line) => {
      const key = ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const compareText = (a, b) => (ignoreCase ? a.toLowerCase().localeCompare(b.toLowerCase()) : a.localeCompare(b));

  const sorted = [...lines];
  switch (mode) {
    case "za":
      sorted.sort((a, b) => compareText(b, a));
      break;
    case "numeric-asc":
      sorted.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
      break;
    case "numeric-desc":
      sorted.sort((a, b) => (parseFloat(b) || 0) - (parseFloat(a) || 0));
      break;
    case "length":
      sorted.sort((a, b) => a.length - b.length);
      break;
    case "az":
    default:
      sorted.sort(compareText);
      break;
  }

  return sorted;
}
