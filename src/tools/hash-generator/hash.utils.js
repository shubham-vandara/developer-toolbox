export const HASH_ALGORITHMS = [
  { id: "SHA-1", label: "SHA-1" },
  { id: "SHA-256", label: "SHA-256" },
  { id: "SHA-384", label: "SHA-384" },
  { id: "SHA-512", label: "SHA-512" },
];

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function computeHash(text, algorithm) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algorithm, data);
  return bufferToHex(digest);
}
