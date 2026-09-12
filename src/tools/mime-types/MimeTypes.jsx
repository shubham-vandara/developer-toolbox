import { useMemo, useState } from "react";
import { SearchBar } from "../../components/common/SearchBar.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { filterMimeTypes } from "./mimeTypes.data.js";

const tool = getToolById("mime-types");

export default function MimeTypes() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterMimeTypes(query), [query]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by extension or MIME type..." className="max-w-md" />

        {results.length === 0 ? (
          <EmptyState title="No matching MIME types" description="Try a different extension or MIME type." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map((item) => (
              <div
                key={item.extension}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-code-background px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
                      {item.extension}
                    </span>
                    <span className="truncate font-mono text-sm text-muted-foreground">{item.mimeType}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <CopyButton text={item.mimeType} label="Copy" size="sm" variant="ghost" className="shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
