import { useMemo, useState } from "react";
import { CaseSensitive, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { countWords, TEXT_CASE_TRANSFORMS } from "./textCase.utils.js";

const tool = getToolById("text-case-converter");

export default function TextCaseConverter() {
  const [input, setInput] = useState("");

  const results = useMemo(
    () => TEXT_CASE_TRANSFORMS.map(({ id, label, transform }) => ({ id, label, value: transform(input) })),
    [input],
  );

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div>
          <TextPanel
            id="text-case-input"
            label="Input"
            value={input}
            onChange={setInput}
            placeholder="Type or paste text here..."
            rows={5}
            stats={`${input.length.toLocaleString()} characters · ${countWords(input).toLocaleString()} words`}
          />
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        {!input.trim() ? (
          <EmptyState
            icon={CaseSensitive}
            title="Nothing to convert yet"
            description="Type some text above to see it converted into every case."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {result.label}
                  </p>
                  <p className="truncate font-mono text-sm text-foreground" title={result.value}>
                    {result.value || "—"}
                  </p>
                </div>
                <CopyButton text={result.value} size="sm" variant="ghost" />
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
