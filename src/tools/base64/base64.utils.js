export function encodeBase64(input) {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return { success: true, value: btoa(binary) };
  } catch {
    return { success: false, error: "Unable to encode this input." };
  }
}

export function decodeBase64(input) {
  const trimmed = input.trim();
  try {
    const binary = atob(trimmed);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return { success: true, value: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return {
      success: false,
      error: "Invalid Base64 string. Check for missing characters or invalid symbols.",
    };
  }
}
