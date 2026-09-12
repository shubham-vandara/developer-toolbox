function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += char;
        i += 1;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
    } else if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
    } else if (char === "\n" || char === "\r") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      i += 1;
    } else {
      field += char;
      i += 1;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

export function csvToJson(input) {
  if (!input.trim()) {
    return { success: false, error: "Enter some CSV data." };
  }

  let rows;
  try {
    rows = parseCsvRows(input);
  } catch (err) {
    return { success: false, error: `Unable to parse CSV. ${err.message}` };
  }

  if (rows.length === 0) {
    return { success: false, error: "No rows were found in the input." };
  }

  const [header, ...dataRows] = rows;
  const records = dataRows
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const record = {};
      header.forEach((key, index) => {
        record[key || `column_${index + 1}`] = row[index] ?? "";
      });
      return record;
    });

  return { success: true, value: JSON.stringify(records, null, 2), rowCount: records.length, columnCount: header.length };
}
