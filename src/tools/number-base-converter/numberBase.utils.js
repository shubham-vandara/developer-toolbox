export const BASES = [
  { id: "binary", label: "Binary", radix: 2 },
  { id: "decimal", label: "Decimal", radix: 10 },
  { id: "octal", label: "Octal", radix: 8 },
  { id: "hexadecimal", label: "Hexadecimal", radix: 16 },
];

const PATTERNS = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

export function isValidForRadix(value, radix) {
  return Boolean(value) && PATTERNS[radix].test(value);
}

export function convertFromBase(value, radix) {
  const trimmed = value.trim();
  if (!trimmed) return { success: false, error: "Enter a value." };
  if (!isValidForRadix(trimmed, radix)) {
    return { success: false, error: `"${trimmed}" is not a valid base ${radix} number.` };
  }

  const decimal = parseInt(trimmed, radix);
  if (!Number.isSafeInteger(decimal)) {
    return { success: false, error: "This number is too large to convert accurately." };
  }

  return {
    success: true,
    values: {
      binary: decimal.toString(2),
      decimal: decimal.toString(10),
      octal: decimal.toString(8),
      hexadecimal: decimal.toString(16).toUpperCase(),
    },
  };
}
