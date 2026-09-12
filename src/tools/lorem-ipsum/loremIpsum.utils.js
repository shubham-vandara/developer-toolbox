const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
  "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];
const CLASSIC_OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWords(count) {
  return Array.from({ length: count }, () => LOREM_WORDS[randomInt(0, LOREM_WORDS.length - 1)]);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function generateSentence() {
  const words = randomWords(randomInt(6, 14));
  return `${capitalize(words.join(" "))}.`;
}

export function generateParagraph() {
  const sentences = Array.from({ length: randomInt(4, 7) }, generateSentence);
  return sentences.join(" ");
}

export function generateLoremIpsum({ unit = "paragraphs", count = 3, startWithClassic = true } = {}) {
  const safeCount = Math.min(Math.max(Number(count) || 1, 1), 50);

  if (unit === "words") {
    const words = randomWords(safeCount);
    if (startWithClassic) words[0] = "lorem";
    return `${capitalize(words.join(" "))}.`;
  }

  if (unit === "sentences") {
    const sentences = Array.from({ length: safeCount }, (_, i) =>
      i === 0 && startWithClassic ? CLASSIC_OPENING : generateSentence(),
    );
    return sentences.join(" ");
  }

  const paragraphs = Array.from({ length: safeCount }, (_, i) => {
    if (i === 0 && startWithClassic) {
      const rest = Array.from({ length: randomInt(3, 6) }, generateSentence);
      return [CLASSIC_OPENING, ...rest].join(" ");
    }
    return generateParagraph();
  });
  return paragraphs.join("\n\n");
}
