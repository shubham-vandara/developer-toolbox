import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { MB, readFileAsText } from "../utils/file.js";
import { detectImageMime } from "../utils/image.js";
import { sanitizeSvg, svgToBlob } from "../utils/svg.js";

const MAX_SVG_SIZE = 10 * MB;

/**
 * SVG markup from an uploaded file or pasted text, plus its sanitized form.
 * `result` is null while empty, otherwise the output of sanitizeSvg().
 */
export function useSvgSource() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState(null);
  const [fileError, setFileError] = useState(null);
  const deferredText = useDeferredValue(text);

  const result = useMemo(() => (deferredText.trim() ? sanitizeSvg(deferredText) : null), [deferredText]);
  const blob = useMemo(() => (result?.success ? svgToBlob(result.svg) : null), [result]);

  const loadFile = useCallback(async (file) => {
    setFileError(null);
    if (file.size > MAX_SVG_SIZE) {
      setFileError("This SVG is too large (max 10 MB).");
      return;
    }
    try {
      const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
      if (detectImageMime(head) !== "image/svg+xml") {
        setFileError("This doesn't look like an SVG file. Choose an .svg file or paste SVG markup.");
        return;
      }
      setText(await readFileAsText(file));
      setFileName(file.name);
    } catch {
      setFileError("This file couldn't be read. Try selecting it again.");
    }
  }, []);

  const updateText = useCallback((value) => {
    setText(value);
    setFileError(null);
  }, []);

  const reset = useCallback(() => {
    setText("");
    setFileName(null);
    setFileError(null);
  }, []);

  return {
    text,
    setText: updateText,
    fileName,
    fileError,
    result,
    blob,
    isStale: text !== deferredText,
    loadFile,
    reset,
  };
}
