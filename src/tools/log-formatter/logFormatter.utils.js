const LEVEL_PATTERN = /\b(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL)\b/i;

function detectLevel(line) {
  const match = line.match(LEVEL_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

export function formatLogLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    const level = (parsed.level ?? parsed.severity ?? detectLevel(trimmed) ?? "").toString().toUpperCase() || null;
    return { raw: trimmed, level, formatted: JSON.stringify(parsed, null, 2), isJson: true };
  } catch {
    return { raw: trimmed, level: detectLevel(trimmed), formatted: trimmed, isJson: false };
  }
}

export function formatLogs(input) {
  if (!input.trim()) return { success: false, error: "Paste some log lines to format." };
  const entries = input
    .split("\n")
    .map(formatLogLine)
    .filter(Boolean);
  return { success: true, entries };
}
