import QRCode from "qrcode";

export async function generateQrCodeDataUrl(text, { size = 256 } = {}) {
  if (!text.trim()) return { success: false, error: "Enter text or a URL to encode." };
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return { success: true, dataUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unable to generate a QR code for this input.",
    };
  }
}
