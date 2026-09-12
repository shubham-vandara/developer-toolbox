import { useCallback, useState } from "react";
import { readStorage, writeStorage } from "../utils/storage.js";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
}
