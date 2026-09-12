import { useMemo, useState } from "react";
import { SearchBar } from "../../components/common/SearchBar.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { filterStatusCodes, STATUS_CATEGORIES } from "./httpStatusCodes.data.js";

const tool = getToolById("http-status-codes");

const CATEGORY_STYLES = {
  "1xx": "border-muted-foreground/30 bg-muted text-muted-foreground",
  "2xx": "border-success/30 bg-success/10 text-success",
  "3xx": "border-primary/30 bg-primary/10 text-primary",
  "4xx": "border-warning/30 bg-warning/10 text-warning",
  "5xx": "border-destructive/30 bg-destructive/10 text-destructive",
};

export default function HttpStatusCodes() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const results = useMemo(() => filterStatusCodes(query, category), [query, category]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search status codes..." className="max-w-md" />

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
          {STATUS_CATEGORIES.map((c) => (
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
          <EmptyState title="No matching status codes" description="Try a different search term or category." />
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((item) => (
              <li
                key={item.code}
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-md border px-2 py-0.5 font-mono text-sm font-semibold",
                      CATEGORY_STYLES[item.category],
                    )}
                  >
                    {item.code}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <CopyButton text={String(item.code)} label="Copy" size="sm" variant="ghost" className="shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  );
}
