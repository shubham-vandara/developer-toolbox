import { useMemo, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { formatLogs } from "./logFormatter.utils.js";

const tool = getToolById("log-formatter");

const LEVEL_STYLES = {
  ERROR: "border-destructive/30 bg-destructive/10 text-destructive",
  FATAL: "border-destructive/30 bg-destructive/10 text-destructive",
  WARN: "border-warning/30 bg-warning/10 text-warning",
  WARNING: "border-warning/30 bg-warning/10 text-warning",
  INFO: "border-primary/30 bg-primary/10 text-primary",
  DEBUG: "border-border bg-muted text-muted-foreground",
  TRACE: "border-border bg-muted text-muted-foreground",
};

export default function LogFormatter() {
  const [input, setInput] = useState("");
  const result = useMemo(() => (input.trim() ? formatLogs(input) : null), [input]);

  const allFormatted = result?.success ? result.entries.map((e) => e.formatted).join("\n\n") : "";

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <TextPanel
          id="log-input"
          label="Raw logs"
          value={input}
          onChange={setInput}
          placeholder="Paste raw log lines (plain text or JSON) here..."
          rows={8}
          actions={
            <div className="flex gap-2">
              {result?.success && <CopyButton text={allFormatted} label="Copy all" />}
              <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
            </div>
          }
        />

        {result && !result.success && <ErrorMessage title="Nothing to format" message={result.error} />}

        {result?.success &&
          (result.entries.length === 0 ? (
            <EmptyState icon={FileText} title="No log lines found" description="Paste some log lines above." />
          ) : (
            <ul className="flex flex-col gap-2">
              {result.entries.map((entry, index) => (
                <li key={index} className="rounded-lg border border-border bg-surface px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    {entry.level ? (
                      <span
                        className={cn(
                          "rounded-md border px-2 py-0.5 font-mono text-xs font-semibold",
                          LEVEL_STYLES[entry.level] ?? "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {entry.level}
                      </span>
                    ) : (
                      <span />
                    )}
                    <CopyButton text={entry.formatted} size="sm" variant="ghost" />
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-foreground">
                    {entry.formatted}
                  </pre>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </ToolLayout>
  );
}
