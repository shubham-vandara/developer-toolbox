function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugify(input, { separator = "-", lowercase = true } = {}) {
  if (!input) return "";

  const escaped = escapeRegExp(separator);
  let result = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, separator)
    .replace(new RegExp(`^${escaped}|${escaped}$`, "g"), "");

  return lowercase ? result.toLowerCase() : result;
}
