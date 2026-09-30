import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage.js";

const SYNC_EVENT = "devtoolbox:storage";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  // Keep every hook instance using the same key in sync (e.g. header + tool page).
  useEffect(() => {
    const handleSync = (event) => {
      if (event.detail.key === key) setValue(event.detail.value);
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, [key]);

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        writeStorage(key, resolved);
        queueMicrotask(() =>
          window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key, value: resolved } })),
        );
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}
