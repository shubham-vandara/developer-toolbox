import { useMemo, useState } from "react";
import { SearchBar } from "../../components/common/SearchBar.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { filterAsciiTable } from "./asciiReference.data.js";

const tool = getToolById("ascii-reference");

export default function AsciiReference() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => filterAsciiTable(query), [query]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by character, code, or name..." className="max-w-md" />

        {results.length === 0 ? (
          <EmptyState title="No matching characters" description="Try a different search term." />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((entry) => (
              <div
                key={entry.code}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-mono text-lg text-foreground">
                    {entry.printable ? entry.char : entry.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Dec {entry.code} · {entry.hex}
                  </p>
                </div>
                <CopyButton
                  text={entry.printable ? entry.char : entry.name}
                  size="sm"
                  variant="ghost"
                  className="shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
