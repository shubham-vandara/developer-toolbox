import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, ShieldCheck, Zap } from "lucide-react";
import { SearchBar } from "../components/common/SearchBar.jsx";
import { ToolCard } from "../components/common/ToolCard.jsx";
import {
  getActiveCategories,
  getCategoryCount,
  getPopularTools,
  getToolCount,
  searchTools,
} from "../data/tools.js";
import { useDocumentHead } from "../hooks/useDocumentHead.js";
import { useFavoriteTools } from "../hooks/useFavoriteTools.js";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "../config.js";

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Instant results",
    description:
      "No spinners, no network round-trips — everything runs locally.",
  },
  {
    icon: ShieldCheck,
    title: "Private by design",
    description: "Your input never leaves your browser or touches a server.",
  },
  {
    icon: LayoutGrid,
    title: "Built to grow",
    description:
      "A small, focused toolbox today — with room for dozens more tools.",
  },
];

export function Home() {
  const [query, setQuery] = useState("");
  const { favoriteIds, toggleFavorite, isFavorite } = useFavoriteTools();
  const categories = getActiveCategories();
  const popularTools = getPopularTools();
  const stats = [
    { value: `${getToolCount()}+`, label: "Developer Tools" },
    { value: `${getCategoryCount()}`, label: "Categories" },
    { value: "100%", label: "Client-side" },
  ];

  useDocumentHead({
    description: SITE_DESCRIPTION,
    path: "/",
  });

  const results = useMemo(
    () => (query.trim() ? searchTools(query) : null),
    [query]
  );

  return (
    <div>
      <section className="border-b border-border bg-linear-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {SITE_NAME}
          </h1>
          <p className="mt-3 text-lg font-medium text-primary">
            {SITE_TAGLINE}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {SITE_DESCRIPTION}
          </p>

          <SearchBar
            value={query}
            onChange={setQuery}
            size="lg"
            className="mx-auto mt-8 max-w-xl"
            placeholder="Search developer tools..."
          />

          {results && (
            <p
              className="mt-3 text-sm text-muted-foreground"
              aria-live="polite"
            >
              {results.length === 0
                ? "No tools found."
                : `${results.length} tool${
                    results.length === 1 ? "" : "s"
                  } found`}
            </p>
          )}

          <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {results ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {results.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              Try a different search term, or browse{" "}
              <Link to="/tools" className="text-primary hover:underline">
                all tools
              </Link>
              .
            </p>
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
        </section>
      ) : (
        <>
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Popular Tools
              </h2>
              <Link
                to="/tools"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all tools
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popularTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite={isFavorite(tool.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>

          <section className="border-t border-border bg-surface/50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Categories
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/tools?category=${category.id}`}
                    className="rounded-lg border border-border bg-surface p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <p className="font-medium text-foreground">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.count} tool{category.count === 1 ? "" : "s"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
