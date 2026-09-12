export const URL_MODES = [
  { id: "encode-uri", label: "Encode URI" },
  { id: "decode-uri", label: "Decode URI" },
  { id: "encode-component", label: "Encode Component" },
  { id: "decode-component", label: "Decode Component" },
];

export function transformUrl(input, mode) {
  try {
    switch (mode) {
      case "encode-uri":
        return { success: true, value: encodeURI(input) };
      case "decode-uri":
        return { success: true, value: decodeURI(input) };
      case "encode-component":
        return { success: true, value: encodeURIComponent(input) };
      case "decode-component":
        return { success: true, value: decodeURIComponent(input) };
      default:
        return { success: false, error: "Unknown mode." };
    }
  } catch {
    return {
      success: false,
      error: mode.startsWith("decode")
        ? "Invalid URL-encoded string. Check for incomplete % sequences."
        : "Unable to encode this input.",
    };
  }
}
