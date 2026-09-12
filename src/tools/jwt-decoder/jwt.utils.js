function base64UrlDecode(segment) {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token) {
  const trimmed = token.trim();
  if (!trimmed) {
    return { success: false, error: "Enter a JWT to decode." };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      success: false,
      error: "A JWT must have three parts separated by periods (header.payload.signature).",
    };
  }

  const [headerPart, payloadPart, signature] = parts;

  let header;
  try {
    header = JSON.parse(base64UrlDecode(headerPart));
  } catch {
    return { success: false, error: "Could not decode the JWT header — it isn't valid Base64URL/JSON." };
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadPart));
  } catch {
    return { success: false, error: "Could not decode the JWT payload — it isn't valid Base64URL/JSON." };
  }

  return { success: true, header, payload, signature };
}

export function formatJwtTimestamp(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return new Date(value * 1000).toLocaleString();
}
