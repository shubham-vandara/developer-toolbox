import { useCallback, useRef, useState } from "react";

/**
 * Selection over an ordered list of keys (page numbers, or page item keys).
 * toggle(key, event) supports Shift+click to select a whole run.
 */
export function usePageSelection(orderedKeys, initial = []) {
  const [selected, setSelected] = useState(() => new Set(initial));
  const anchorRef = useRef(null);

  const toggle = useCallback(
    (key, event) => {
      setSelected((prev) => {
        const next = new Set(prev);
        const anchor = anchorRef.current;
        if (event?.shiftKey && anchor !== null && orderedKeys.includes(anchor)) {
          const [a, b] = [orderedKeys.indexOf(anchor), orderedKeys.indexOf(key)].sort((x, y) => x - y);
          orderedKeys.slice(a, b + 1).forEach((k) => next.add(k));
        } else if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      anchorRef.current = key;
    },
    [orderedKeys],
  );

  const set = useCallback((keys) => setSelected(new Set(keys)), []);
  const selectAll = useCallback(() => setSelected(new Set(orderedKeys)), [orderedKeys]);
  const clear = useCallback(() => setSelected(new Set()), []);

  // Selected keys in list order.
  const list = orderedKeys.filter((key) => selected.has(key));

  return { selected, list, toggle, set, selectAll, clear };
}
