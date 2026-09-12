export function validateXml(input) {
  const doc = new DOMParser().parseFromString(input, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    return { valid: false, error: errorNode.textContent.trim().split("\n")[0] };
  }
  return { valid: true };
}

function reindentXml(input, indent = "  ") {
  const withBreaks = input.trim().replace(/>\s*</g, ">\n<");
  const lines = withBreaks.split("\n");
  let depth = 0;
  const output = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isDeclarationOrComment = /^<\?/.test(line) || /^<!--/.test(line);
    const isClosingTag = /^<\//.test(line);
    const isSelfClosingTag = /\/>$/.test(line);
    const isOpenCloseSameLine = /^<([\w:-]+)[^>]*>.*<\/\1>$/.test(line);

    if (isClosingTag) depth = Math.max(depth - 1, 0);
    output.push(indent.repeat(depth) + line);
    if (!isClosingTag && !isSelfClosingTag && !isOpenCloseSameLine && !isDeclarationOrComment) {
      depth += 1;
    }
  }

  return output.join("\n");
}

export function formatXml(input) {
  if (!input.trim()) return { success: false, error: "Enter some XML to format." };
  const validation = validateXml(input);
  if (!validation.valid) return { success: false, error: validation.error };
  return { success: true, value: reindentXml(input) };
}

export function minifyXml(input) {
  if (!input.trim()) return { success: false, error: "Enter some XML to minify." };
  const validation = validateXml(input);
  if (!validation.valid) return { success: false, error: validation.error };
  return { success: true, value: input.trim().replace(/>\s+</g, "><") };
}
