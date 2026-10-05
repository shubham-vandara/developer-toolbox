import { useCallback, useEffect, useRef, useState } from "react";
import {
  assertPixelBudget,
  describeMime,
  detectImageMime,
  getUserMessage,
  ImageToolError,
  isTruncatedImage,
  loadImage,
  validateImageFile,
} from "../utils/image.js";

export const RASTER_MIMES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp", "image/avif"];

const IDLE = { status: "idle" };

/**
 * Loads a user-selected image file for local processing: validates size and
 * real format (from magic bytes, not the file name), decodes it, and exposes
 * an object URL that is revoked when replaced, reset or unmounted.
 *
 * status: "idle" | "loading" | "ready" | "error"
 */
export function useImageFile({ mimes = RASTER_MIMES } = {}) {
  const [state, setState] = useState(IDLE);
  const urlRef = useRef(null);
  const requestRef = useRef(0);

  const revoke = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  useEffect(() => revoke, [revoke]);

  const load = useCallback(
    async (file) => {
      const request = ++requestRef.current;
      revoke();
      setState({ status: "loading", file });
      try {
        validateImageFile(file);
        const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
        // Trust the file's actual bytes, not its name or claimed type.
        const mime = detectImageMime(head);
        const allowed = [...new Set(mimes.map(describeMime))].join(", ");
        if (!mime) {
          throw new ImageToolError(`This file isn't a supported image, or it's damaged. Choose a ${allowed} image.`);
        }
        if (!mimes.includes(mime)) {
          const hint = mime === "image/svg+xml" ? " For SVG files, use the SVG tools." : "";
          throw new ImageToolError(`${describeMime(mime)} files aren't supported here. Choose a ${allowed} image.${hint}`);
        }
        const tail = new Uint8Array(await file.slice(Math.max(0, file.size - 4096)).arrayBuffer());
        if (isTruncatedImage(mime, head, tail, file.size)) {
          throw new ImageToolError("This image appears to be incomplete or corrupted (the file ends too early).");
        }

        const url = URL.createObjectURL(file);
        urlRef.current = url;
        const image = await loadImage(url, { verifyDecode: mime !== "image/svg+xml" });
        if (request !== requestRef.current) return;
        const width = image.naturalWidth;
        const height = image.naturalHeight;
        if (!width || !height) throw new ImageToolError("This image has no readable dimensions.");
        assertPixelBudget(width, height);

        setState({ status: "ready", file, url, image, width, height, mime });
      } catch (error) {
        if (request !== requestRef.current) return;
        revoke();
        setState({ status: "error", file, error: getUserMessage(error, "This image couldn't be opened.") });
      }
    },
    [mimes, revoke],
  );

  const reset = useCallback(() => {
    requestRef.current += 1;
    revoke();
    setState(IDLE);
  }, [revoke]);

  return { ...state, load, reset };
}
