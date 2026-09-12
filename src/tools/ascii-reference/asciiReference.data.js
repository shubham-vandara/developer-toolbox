const CONTROL_NAMES = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "TAB", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB",
  24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US",
  127: "DEL",
};

export const ASCII_TABLE = Array.from({ length: 128 }, (_, code) => {
  const printable = code >= 32 && code !== 127;
  return {
    code,
    hex: `0x${code.toString(16).toUpperCase().padStart(2, "0")}`,
    char: printable ? String.fromCharCode(code) : "",
    name: CONTROL_NAMES[code] ?? "",
    printable,
  };
});

export function filterAsciiTable(query) {
  const q = query.trim().toLowerCase();
  if (!q) return ASCII_TABLE;
  return ASCII_TABLE.filter((entry) => {
    const haystack = `${entry.code} ${entry.hex} ${entry.char} ${entry.name}`.toLowerCase();
    return haystack.includes(q);
  });
}
