function formatKey(key) {
  return key.trim().toUpperCase().replace(/[^A-Z0-9_]/gi, "_");
}

function formatValue(value) {
  const v = value ?? "";
  return /[\s#"']/.test(v) ? `"${v.replace(/"/g, '\\"')}"` : v;
}

export function buildEnvFile(pairs) {
  const validPairs = pairs.filter((p) => p.key.trim());
  if (validPairs.length === 0) return "";
  return `${validPairs.map((p) => `${formatKey(p.key)}=${formatValue(p.value)}`).join("\n")}\n`;
}

export function buildEnvExample(pairs) {
  const validPairs = pairs.filter((p) => p.key.trim());
  if (validPairs.length === 0) return "";
  return `${validPairs.map((p) => `${formatKey(p.key)}=`).join("\n")}\n`;
}
