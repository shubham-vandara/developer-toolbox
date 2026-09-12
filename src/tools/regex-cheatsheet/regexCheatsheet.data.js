export const REGEX_CATEGORIES = [
  { id: "classes", label: "Character Classes" },
  { id: "anchors", label: "Anchors" },
  { id: "quantifiers", label: "Quantifiers" },
  { id: "groups", label: "Groups & Lookaround" },
  { id: "flags", label: "Flags" },
];

export const REGEX_ENTRIES = [
  { token: ".", category: "classes", description: "Any character except line breaks" },
  { token: "\\d", category: "classes", description: "Any digit (0-9)" },
  { token: "\\D", category: "classes", description: "Any non-digit" },
  { token: "\\w", category: "classes", description: "Any word character (letters, digits, underscore)" },
  { token: "\\W", category: "classes", description: "Any non-word character" },
  { token: "\\s", category: "classes", description: "Any whitespace character" },
  { token: "\\S", category: "classes", description: "Any non-whitespace character" },
  { token: "[abc]", category: "classes", description: "Any one of a, b, or c" },
  { token: "[^abc]", category: "classes", description: "Any character except a, b, or c" },
  { token: "[a-z]", category: "classes", description: "Any character in the range a to z" },

  { token: "^", category: "anchors", description: "Start of the string (or line, with the m flag)" },
  { token: "$", category: "anchors", description: "End of the string (or line, with the m flag)" },
  { token: "\\b", category: "anchors", description: "A word boundary" },
  { token: "\\B", category: "anchors", description: "Not a word boundary" },

  { token: "*", category: "quantifiers", description: "0 or more of the preceding token" },
  { token: "+", category: "quantifiers", description: "1 or more of the preceding token" },
  { token: "?", category: "quantifiers", description: "0 or 1 of the preceding token" },
  { token: "{n}", category: "quantifiers", description: "Exactly n of the preceding token" },
  { token: "{n,}", category: "quantifiers", description: "n or more of the preceding token" },
  { token: "{n,m}", category: "quantifiers", description: "Between n and m of the preceding token" },
  { token: "*?", category: "quantifiers", description: "0 or more, non-greedy (matches as little as possible)" },

  { token: "(...)", category: "groups", description: "Capturing group" },
  { token: "(?:...)", category: "groups", description: "Non-capturing group" },
  { token: "(?<name>...)", category: "groups", description: "Named capturing group" },
  { token: "|", category: "groups", description: "Alternation (OR)" },
  { token: "(?=...)", category: "groups", description: "Positive lookahead" },
  { token: "(?!...)", category: "groups", description: "Negative lookahead" },
  { token: "(?<=...)", category: "groups", description: "Positive lookbehind" },
  { token: "(?<!...)", category: "groups", description: "Negative lookbehind" },

  { token: "g", category: "flags", description: "Global — find all matches, not just the first" },
  { token: "i", category: "flags", description: "Case-insensitive matching" },
  { token: "m", category: "flags", description: "Multiline — ^ and $ match the start/end of each line" },
  { token: "s", category: "flags", description: "Dot-all — . also matches line breaks" },
  { token: "u", category: "flags", description: "Unicode mode" },
  { token: "y", category: "flags", description: "Sticky — matches only from lastIndex" },
];

export function filterRegexEntries(query, category = "all") {
  const q = query.trim().toLowerCase();
  return REGEX_ENTRIES.filter((entry) => {
    if (category !== "all" && entry.category !== category) return false;
    if (!q) return true;
    return `${entry.token} ${entry.description}`.toLowerCase().includes(q);
  });
}
