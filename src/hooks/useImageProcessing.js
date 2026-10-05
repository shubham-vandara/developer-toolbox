import { useEffect, useRef, useState } from "react";
import { getUserMessage } from "../utils/image.js";

/**
 * Runs an async image job whenever `deps` change, debounced so dragging a
 * slider doesn't re-encode on every tick. Stale runs are discarded, and the
 * previous result stays visible while a new one is processing.
 *
 * status: "idle" | "processing" | "done" | "error"
 */
export function useImageProcessing(job, deps, { enabled = true, delay = 200 } = {}) {
  const [state, setState] = useState({ status: "idle", result: null, error: null });
  const jobRef = useRef(job);
  jobRef.current = job;

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle", result: null, error: null });
      return undefined;
    }
    let cancelled = false;
    setState((prev) => ({ ...prev, status: "processing", error: null }));
    const timer = setTimeout(async () => {
      try {
        const result = await jobRef.current();
        if (!cancelled) setState({ status: "done", result, error: null });
      } catch (error) {
        if (!cancelled) setState({ status: "error", result: null, error: getUserMessage(error) });
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, delay, ...deps]);

  return state;
}
