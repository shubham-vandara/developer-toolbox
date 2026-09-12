import { useLocalStorage } from "./useLocalStorage.js";

const MAX_RECENT = 5;

export function useRecentTools() {
  const [recentIds, setRecentIds] = useLocalStorage("recent-tools", []);

  const addRecentTool = (toolId) => {
    setRecentIds((prev) => [toolId, ...prev.filter((id) => id !== toolId)].slice(0, MAX_RECENT));
  };

  return [recentIds, addRecentTool];
}
