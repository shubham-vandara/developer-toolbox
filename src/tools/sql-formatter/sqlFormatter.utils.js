import { format } from "sql-formatter";

export function formatSql(input) {
  if (!input.trim()) {
    return { success: false, error: "Enter some SQL to format." };
  }
  try {
    return { success: true, value: format(input, { language: "sql", keywordCase: "upper" }) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unable to format this SQL." };
  }
}
