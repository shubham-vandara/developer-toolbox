import { useCallback, useEffect, useRef, useState } from "react";
import { closeRenderDoc, getPdfErrorMessage, openForRender, PdfToolError, readPdfFile } from "../utils/pdf/engine.js";

const IDLE = { status: "idle" };

/**
 * Loads one user-selected PDF for local processing.
 * status: "idle" | "loading" | "password" | "ready" | "error"
 *
 * `doc` is a PDF.js document (for thumbnails/text); `bytes` the original file
 * contents, which tools hand to pdf-lib — the uploaded file is never modified.
 * By default password-protected PDFs are rejected with a pointer to the
 * Protect & Unlock tool; pass `allowEncrypted` to prompt for the password.
 */
export function usePdfFile({ allowEncrypted = false } = {}) {
  const [state, setState] = useState(IDLE);
  const docRef = useRef(null);
  const requestRef = useRef(0);

  const destroyDoc = useCallback(() => {
    closeRenderDoc(docRef.current);
    docRef.current = null;
  }, []);

  useEffect(() => destroyDoc, [destroyDoc]);

  const open = useCallback(
    async (file, bytes, password) => {
      const request = requestRef.current;
      const doc = await openForRender(bytes, { password });
      if (request !== requestRef.current) {
        closeRenderDoc(doc);
        return;
      }
      docRef.current = doc;
      setState({ status: "ready", id: request, file, bytes, doc, pageCount: doc.numPages, password });
    },
    [],
  );

  const load = useCallback(
    async (file) => {
      const request = ++requestRef.current;
      destroyDoc();
      setState({ status: "loading", file });
      let bytes;
      try {
        bytes = await readPdfFile(file);
        await open(file, bytes);
      } catch (error) {
        if (request !== requestRef.current) return;
        if (error instanceof PdfToolError && error.code === "password") {
          if (allowEncrypted) {
            setState({ status: "password", file, bytes });
            return;
          }
          setState({
            status: "error",
            file,
            code: "password",
            error: "This PDF is password-protected. Remove the password first with the Protect & Unlock PDF tool, then open it here.",
          });
          return;
        }
        setState({ status: "error", file, code: error?.code, error: getPdfErrorMessage(error, "This PDF couldn't be opened.") });
      }
    },
    [allowEncrypted, destroyDoc, open],
  );

  const submitPassword = useCallback(
    async (password) => {
      if (state.status !== "password") return;
      const { file, bytes } = state;
      setState({ status: "password", file, bytes, checking: true });
      try {
        await open(file, bytes, password);
      } catch (error) {
        setState({ status: "password", file, bytes, error: getPdfErrorMessage(error) });
      }
    },
    [open, state],
  );

  const reset = useCallback(() => {
    requestRef.current += 1;
    destroyDoc();
    setState(IDLE);
  }, [destroyDoc]);

  return { ...state, load, submitPassword, reset };
}
