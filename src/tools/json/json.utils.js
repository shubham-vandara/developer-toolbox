function positionToLineColumn(input, position) {
  const upToError = input.slice(0, position);
  const lines = upToError.split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

function describeJsonError(err, input) {
  const message = err instanceof Error ? err.message : "Invalid JSON";
  const match = message.match(/position (\d+)/);
  if (!match) {
    return { message, position: null, line: null, column: null };
  }
  const position = Number(match[1]);
  const { line, column } = positionToLineColumn(input, position);
  return { message, position, line, column };
}

export function parseJsonSafe(input) {
  try {
    return { success: true, value: JSON.parse(input) };
  } catch (err) {
    return { success: false, error: describeJsonError(err, input) };
  }
}

export function formatJson(input, indent = 2) {
  const result = parseJsonSafe(input);
  if (!result.success) return result;
  return { success: true, value: JSON.stringify(result.value, null, indent) };
}

export function minifyJson(input) {
  const result = parseJsonSafe(input);
  if (!result.success) return result;
  return { success: true, value: JSON.stringify(result.value) };
}

export function validateJson(input) {
  const result = parseJsonSafe(input);
  return result.success ? { valid: true } : { valid: false, error: result.error };
}
