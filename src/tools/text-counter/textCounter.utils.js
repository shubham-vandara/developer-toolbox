export function countText(input) {
  const trimmed = input.trim();

  const characters = input.length;
  const charactersWithoutSpaces = input.replace(/\s/g, "").length;
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = input === "" ? 0 : input.split("\n").length;
  const sentences = trimmed
    ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).filter((s) => s.trim()).length
    : 0;
  const paragraphs = trimmed
    ? trimmed
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean).length
    : 0;

  return { characters, charactersWithoutSpaces, words, lines, sentences, paragraphs };
}
