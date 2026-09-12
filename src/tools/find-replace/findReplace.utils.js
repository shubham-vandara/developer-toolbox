function escapeRegex(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFlags(caseSensitive, global) {
  return (global ? "g" : "") + (caseSensitive ? "" : "i");
}

export function findReplace(input, { find, replace = "", caseSensitive = false, useRegex = false, replaceAll = true }) {
  if (!find) {
    return { success: true, value: input, matchCount: 0 };
  }

  const source = useRegex ? find : escapeRegex(find);

  let countPattern;
  let replacePattern;
  try {
    countPattern = new RegExp(source, buildFlags(caseSensitive, true));
    replacePattern = new RegExp(source, buildFlags(caseSensitive, replaceAll));
  } catch (err) {
    return { success: false, error: `Invalid regular expression: ${err.message}` };
  }

  const matchCount = (input.match(countPattern) || []).length;
  const value = input.replace(replacePattern, replace);

  return { success: true, value, matchCount };
}
