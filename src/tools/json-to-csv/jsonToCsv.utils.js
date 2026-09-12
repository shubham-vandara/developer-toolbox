function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stringifyCell(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function escapeCsvCell(value) {
  const str = stringifyCell(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function jsonToCsv(input) {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { success: false, error: `Invalid JSON. ${err.message}` };
  }

  if (!Array.isArray(parsed)) {
    return { success: false, error: "The JSON must be an array of objects, e.g. [{ \"name\": \"John\" }]." };
  }
  if (parsed.length === 0) {
    return { success: false, error: "The JSON array is empty — nothing to convert." };
  }
  if (!parsed.every(isPlainObject)) {
    return { success: false, error: "Every item in the array must be a JSON object." };
  }

  const headers = [];
  for (const row of parsed) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) headers.push(key);
    }
  }

  const lines = [headers.map(escapeCsvCell).join(",")];
  for (const row of parsed) {
    lines.push(headers.map((key) => escapeCsvCell(row[key])).join(","));
  }

  return { success: true, value: lines.join("\n"), rowCount: parsed.length, columnCount: headers.length };
}
