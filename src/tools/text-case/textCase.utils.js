function splitWords(input) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function toUpperCase(input) {
  return input.toUpperCase();
}

export function toLowerCase(input) {
  return input.toLowerCase();
}

export function toTitleCase(input) {
  return splitWords(input).map(capitalize).join(" ");
}

export function toSentenceCase(input) {
  const lower = input.toLowerCase();
  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

export function toCamelCase(input) {
  const words = splitWords(input).map((word) => word.toLowerCase());
  return words.map((word, index) => (index === 0 ? word : capitalize(word))).join("");
}

export function toPascalCase(input) {
  return splitWords(input).map(capitalize).join("");
}

export function toSnakeCase(input) {
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join("_");
}

export function toKebabCase(input) {
  return splitWords(input)
    .map((word) => word.toLowerCase())
    .join("-");
}

export function toConstantCase(input) {
  return splitWords(input)
    .map((word) => word.toUpperCase())
    .join("_");
}

export const TEXT_CASE_TRANSFORMS = [
  { id: "upper", label: "UPPER CASE", transform: toUpperCase },
  { id: "lower", label: "lower case", transform: toLowerCase },
  { id: "title", label: "Title Case", transform: toTitleCase },
  { id: "sentence", label: "Sentence case", transform: toSentenceCase },
  { id: "camel", label: "camelCase", transform: toCamelCase },
  { id: "pascal", label: "PascalCase", transform: toPascalCase },
  { id: "snake", label: "snake_case", transform: toSnakeCase },
  { id: "kebab", label: "kebab-case", transform: toKebabCase },
  { id: "constant", label: "CONSTANT_CASE", transform: toConstantCase },
];

export function countWords(input) {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
