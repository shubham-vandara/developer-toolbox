import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../utils/clipboard.js";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback(
    async (text) => {
      const success = await copyToClipboard(text);
      if (success) {
        setCopied(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
      }
      return success;
    },
    [resetDelay],
  );

  return [copied, copy];
}
