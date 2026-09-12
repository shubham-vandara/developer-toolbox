const JS_FRAME = /^at\s+(?:(?<fn>.+?)\s+\()?(?<file>[^()]+):(?<line>\d+):(?<col>\d+)\)?$/;
const JAVA_FRAME = /^at\s+(?<fn>[\w$.<>]+)\((?<file>[^:()]+):(?<line>\d+)\)$/;
const PYTHON_FRAME = /^File\s+"(?<file>[^"]+)",\s+line\s+(?<line>\d+),\s+in\s+(?<fn>.+)$/;

const VENDOR_PATTERN = /node_modules|site-packages|\.jar!|<anonymous>/;

export function parseStackTraceLine(rawLine) {
  const line = rawLine.trim();
  if (!line) return null;

  let match = line.match(JS_FRAME);
  if (match) {
    return {
      type: "frame",
      language: "javascript",
      function: match.groups.fn || "<anonymous>",
      file: match.groups.file.trim(),
      line: Number(match.groups.line),
      column: Number(match.groups.col),
    };
  }

  match = line.match(JAVA_FRAME);
  if (match) {
    return {
      type: "frame",
      language: "java",
      function: match.groups.fn,
      file: match.groups.file,
      line: Number(match.groups.line),
    };
  }

  match = line.match(PYTHON_FRAME);
  if (match) {
    return {
      type: "frame",
      language: "python",
      function: match.groups.fn,
      file: match.groups.file,
      line: Number(match.groups.line),
    };
  }

  if (/^caused by:/i.test(line)) {
    return { type: "cause", text: line };
  }

  return { type: "text", text: line };
}

export function isVendorFrame(entry) {
  return entry.type === "frame" && VENDOR_PATTERN.test(entry.file);
}

export function formatStackTrace(input, { hideVendorFrames = false } = {}) {
  if (!input.trim()) return { success: false, error: "Paste a stack trace to format." };

  let entries = input
    .split("\n")
    .map(parseStackTraceLine)
    .filter(Boolean);

  if (hideVendorFrames) {
    entries = entries.filter((entry) => !isVendorFrame(entry));
  }

  return { success: true, entries };
}
