import { useCallback, useEffect, useRef, useState } from "react";

let nextId = 0;

/**
 * An ordered list of user-selected files, each analyzed asynchronously
 * (e.g. page count, dimensions). Items: { id, file, status, meta, error }.
 * `analyze(file)` resolves to `meta` or throws an error with a user-safe message.
 * `release(item)` frees per-item resources (object URLs) on removal.
 */
export function useFileList({ analyze, release, getErrorMessage = (e) => e?.message ?? "This file couldn't be read." }) {
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => itemsRef.current.forEach((item) => release?.(item)), [release]);

  const update = useCallback((id, patch) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const add = useCallback(
    (files) => {
      const added = files.map((file) => ({ id: `f${++nextId}`, file, status: "loading", meta: null, error: null }));
      setItems((prev) => [...prev, ...added]);
      added.forEach(async (item) => {
        try {
          const meta = await analyze(item.file);
          // Removed while analyzing: free what was just created and stop.
          if (!itemsRef.current.some((i) => i.id === item.id)) {
            release?.({ ...item, meta });
            return;
          }
          update(item.id, { status: "ready", meta });
        } catch (error) {
          update(item.id, { status: "error", error: getErrorMessage(error) });
        }
      });
    },
    [analyze, getErrorMessage, release, update],
  );

  const remove = useCallback(
    (id) => {
      setItems((prev) => {
        const item = prev.find((i) => i.id === id);
        if (item) release?.(item);
        return prev.filter((i) => i.id !== id);
      });
    },
    [release],
  );

  const move = useCallback((from, to) => {
    setItems((prev) => {
      if (to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => release?.(item));
      return [];
    });
  }, [release]);

  return { items, add, remove, move, clear };
}
