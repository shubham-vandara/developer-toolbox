import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock, Star } from "lucide-react";
import { SearchBar } from "../components/common/SearchBar.jsx";
import { ToolCard } from "../components/common/ToolCard.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { Select } from "../components/common/Select.jsx";
import { cn } from "../utils/cn.js";
import { getActiveCategories, getToolById, getToolCount, searchTools } from "../data/tools.js";
import { useDocumentHead } from "../hooks/useDocumentHead.js";
import { useFavoriteTools } from "../hooks/useFavoriteTools.js";
import { useRecentTools } from "../hooks/useRecentTools.js";

export function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const categories = getActiveCategories();
  const { favoriteIds, toggleFavorite } = useFavoriteTools();
  const [recentIds] = useRecentTools();

  useDocumentHead({
    title: "All Tools",
    description: "Browse every developer tool available in Developer Toolbox, organized by category.",
    path: "/tools",
  });

  const results = useMemo(() => {
    const base = searchTools(query);
    const filtered = activeCategory === "all" ? base : base.filter((tool) => tool.category === activeCategory);
    if (sortBy === "name") {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [query, activeCategory, sortBy]);

  const setCategory = (categoryId) => {
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  const recentTools = recentIds.map(getToolById).filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">All Tools</h1>
      <p className="mt-2 text-muted-foreground">
        Browse every tool, or search and filter by category. {getToolCount()} tools available.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <SearchBar value={query} onChange={setQuery} className="max-w-md flex-1" />
        <Select
          id="tools-sort"
          label="Sort"
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "default", label: "Recommended" },
            { value: "name", label: "Name (A-Z)" },
          ]}
          className="w-44"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            activeCategory === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={activeCategory === "all"}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategory(category.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              activeCategory === category.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={activeCategory === category.id}
          >
            {category.name} ({category.count})
          </button>
        ))}
      </div>

      {!query && activeCategory === "all" && (favoriteIds.length > 0 || recentTools.length > 0) && (
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          {favoriteIds.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                Favorites
              </h2>
              <ul className="space-y-1">
                {favoriteIds.map(getToolById).filter(Boolean).map((tool) => (
                  <li key={tool.id}>
                    <Link to={tool.path} className="text-sm text-muted-foreground hover:text-primary">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recentTools.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Recently used
              </h2>
              <ul className="space-y-1">
                {recentTools.map((tool) => (
                  <li key={tool.id}>
                    <Link to={tool.path} className="text-sm text-muted-foreground hover:text-primary">
                      {tool.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-10">
        {results.length === 0 ? (
          <EmptyState title="No tools found" description="Try a different search term or category." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite={favoriteIds.includes(tool.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
