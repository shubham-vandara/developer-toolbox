import { useCallback, useLayoutEffect, useRef, useState } from "react";

const LIMIT = 100;

/**
 * Undo/redo for an immutable value.
 * - apply(next): a discrete change (one undo step).
 * - begin() … preview(next) … commit(): a continuous gesture such as a drag;
 *   only the start → end change becomes a single undo step.
 */
export function useHistory(initial) {
  const [state, setState] = useState({ past: [], present: initial, future: [] });
  const gestureStart = useRef(null);
  // Mirror of the latest state so gesture bookkeeping happens outside state
  // updaters (React may call updaters twice; they must stay pure).
  const latest = useRef(state);
  useLayoutEffect(() => {
    latest.current = state;
  }, [state]);

  const apply = useCallback((next) => {
    setState((s) => {
      const value = typeof next === "function" ? next(s.present) : next;
      if (value === s.present) return s;
      return { past: [...s.past, s.present].slice(-LIMIT), present: value, future: [] };
    });
  }, []);

  const begin = useCallback(() => {
    gestureStart.current = latest.current.present;
  }, []);

  const preview = useCallback((next) => {
    setState((s) => ({ ...s, present: typeof next === "function" ? next(s.present) : next }));
  }, []);

  const commit = useCallback(() => {
    const start = gestureStart.current;
    gestureStart.current = null;
    if (start === null) return;
    setState((s) => (start === s.present ? s : { past: [...s.past, start].slice(-LIMIT), present: s.present, future: [] }));
  }, []);

  const undo = useCallback(() => {
    setState((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s));
  }, []);

  const redo = useCallback(() => {
    setState((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s));
  }, []);

  const reset = useCallback((value) => setState({ past: [], present: value, future: [] }), []);

  return {
    present: state.present,
    apply,
    begin,
    preview,
    commit,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
