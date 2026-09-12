import { useMemo, useState } from "react";
import { SearchBar } from "../../components/common/SearchBar.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { filterGitEntries, GIT_CATEGORIES } from "./gitCheatsheet.data.js";

const tool = getToolById("git-cheatsheet");

export default function GitCheatsheet() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const results = useMemo(() => filterGitEntries(query, category), [query, category]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search git commands..." className="max-w-md" />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
            aria-pressed={category === "all"}
          >
            All
          </button>
          {GIT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={category === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>

        {results.length === 0 ? (
          <EmptyState title="No matching commands" description="Try a different search term or category." />
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((entry) => (
              <li
                key={entry.command}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <code className="block truncate font-mono text-sm font-semibold text-foreground">{entry.command}</code>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>
                <CopyButton text={entry.command} label="Copy" size="sm" variant="ghost" className="shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  );
}
