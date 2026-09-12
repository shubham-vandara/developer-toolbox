export function testRegex(pattern, flags, input) {
  if (!pattern) return { success: false, error: "Enter a regular expression." };

  let regex;
  try {
    regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Invalid regular expression." };
  }

  const matches = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    matches.push({
      match: match[0],
      index: match.index,
      groups: match.slice(1),
      namedGroups: match.groups ? { ...match.groups } : null,
    });
    if (match[0] === "") regex.lastIndex += 1;
  }

  return { success: true, matches };
}

export function replaceRegex(pattern, flags, input, replacement) {
  if (!pattern) return { success: false, error: "Enter a regular expression." };
  try {
    const regex = new RegExp(pattern, flags);
    return { success: true, value: input.replace(regex, replacement) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Invalid regular expression." };
  }
}

export function buildHighlightedSegments(input, matches) {
  if (!matches.length) return [{ text: input, isMatch: false }];

  const segments = [];
  let cursor = 0;
  for (const m of matches) {
    if (m.index > cursor) segments.push({ text: input.slice(cursor, m.index), isMatch: false });
    if (m.match.length > 0) segments.push({ text: m.match, isMatch: true });
    cursor = Math.max(cursor, m.index + m.match.length);
  }
  if (cursor < input.length) segments.push({ text: input.slice(cursor), isMatch: false });
  return segments;
}
