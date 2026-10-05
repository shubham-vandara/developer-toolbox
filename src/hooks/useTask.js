import { useCallback, useEffect, useRef, useState } from "react";
import { getPdfErrorMessage } from "../utils/pdf/engine.js";

const IDLE = { status: "idle", result: null, error: null, progress: null };

/**
 * A user-triggered async job (e.g. "Merge PDFs") with progress reporting.
 * run(job) calls job(report) where report(done, total, label) updates progress.
 * Starting a new run or calling reset() discards the previous run's result.
 * status: "idle" | "running" | "done" | "error"
 */
export function useTask({ getErrorMessage = getPdfErrorMessage } = {}) {
  const [state, setState] = useState(IDLE);
  const runRef = useRef(0);

  useEffect(() => () => {
    runRef.current += 1;
  }, []);

  const run = useCallback(
    async (job) => {
      const id = ++runRef.current;
      setState({ status: "running", result: null, error: null, progress: null });
      const report = (done, total, label) => {
        if (id === runRef.current) setState((prev) => ({ ...prev, progress: { done, total, label } }));
      };
      try {
        const result = await job(report);
        if (id === runRef.current) setState({ status: "done", result, error: null, progress: null });
        return result;
      } catch (error) {
        if (id === runRef.current) setState({ status: "error", result: null, error: getErrorMessage(error), progress: null });
        return undefined;
      }
    },
    [getErrorMessage],
  );

  const reset = useCallback(() => {
    runRef.current += 1;
    setState((s) => (s.status === "idle" ? s : IDLE));
  }, []);

  return { ...state, run, reset, isRunning: state.status === "running" };
}

export function progressLabel(progress, fallback = "Working…") {
  if (!progress) return fallback;
  const { done, total, label } = progress;
  return total ? `${label ?? "Processing"} ${Math.min(done + 1, total)} of ${total}…` : (label ?? fallback);
}
