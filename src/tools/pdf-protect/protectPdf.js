import { closeRenderDoc, loadPdfLib, openForEdit, openForRender, PdfToolError, removeStaleXrefs, savePdf, toPdfError } from "../../utils/pdf/engine.js";

/** Whether the PDF is encrypted, without decrypting it. */
export async function inspectEncryption(bytes) {
  const { PDFDocument } = await loadPdfLib();
  try {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
    return { encrypted: doc.isEncrypted, pageCount: doc.getPageCount() };
  } catch (error) {
    throw toPdfError(error);
  }
}

/** Encrypt with AES-256 (PDF 2.0, revision 6). The password is required to open the file. */
export async function protectPdf(bytes, password) {
  const doc = await openForEdit(bytes);
  doc.encrypt({ userPassword: password, ownerPassword: password });
  const blob = await savePdf(doc);
  // Verify: the output must refuse to open without the password and open with it.
  const check = new Uint8Array(await blob.arrayBuffer());
  await openForRender(check).then(
    (d) => {
      closeRenderDoc(d);
      throw new PdfToolError("Encryption could not be verified, so no file was produced.");
    },
    (error) => {
      if (error?.code !== "password") throw error;
    },
  );
  closeRenderDoc(await openForRender(check, { password }));
  return blob;
}

/**
 * Decrypt with a password the user knows. Never guesses or bypasses: a PDF
 * that opens without a password but has owner restrictions still requires
 * its (owner) password to be entered here.
 */
export async function unlockPdf(bytes, password) {
  if (!password) throw new PdfToolError("Enter the PDF's password.", "password");
  const { PDFDocument, PDFRef } = await loadPdfLib();
  const doc = await openForEdit(bytes, { password });
  // The objects are now decrypted; make sure the output no longer declares
  // encryption (pdf-lib can leave the /Encrypt reference in the trailer).
  const { context } = doc;
  const encryptRef = context.trailerInfo.Encrypt;
  if (encryptRef instanceof PDFRef) context.delete(encryptRef);
  delete context.trailerInfo.Encrypt;
  await removeStaleXrefs(doc, { includeEncryption: true });
  const blob = await savePdf(doc);

  // Verify: no encryption left, and it opens without any password.
  const out = new Uint8Array(await blob.arrayBuffer());
  const reloaded = await PDFDocument.load(out, { ignoreEncryption: true, updateMetadata: false });
  const check = reloaded.isEncrypted ? null : await openForRender(out).catch(() => null);
  if (!check) throw new PdfToolError("This PDF's encryption couldn't be fully removed by this tool.", "unsupported-encryption");
  const pages = check.numPages;
  closeRenderDoc(check);
  return { blob, pages };
}

export function passwordIssues(password, confirm) {
  if (!password) return "Enter a password.";
  if (password.length < 6) return "Use at least 6 characters.";
  if (password !== confirm) return "The passwords don't match.";
  return null;
}
