import { useLocalStorage } from "./useLocalStorage.js";

export function useFavoriteTools() {
  const [favoriteIds, setFavoriteIds] = useLocalStorage("favorite-tools", []);

  const toggleFavorite = (toolId) => {
    setFavoriteIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId],
    );
  };

  const isFavorite = (toolId) => favoriteIds.includes(toolId);

  return { favoriteIds, toggleFavorite, isFavorite };
}
