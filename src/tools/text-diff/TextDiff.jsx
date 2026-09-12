import { useMemo, useState } from "react";
import { GitCompareArrows, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { diffLines, formatUnifiedDiff, summarizeLineDiff } from "./textDiff.utils.js";

const tool = getToolById("text-diff");

const LINE_STYLES = {
  added: "border-l-4 border-success bg-success/10",
  removed: "border-l-4 border-destructive bg-destructive/10",
  unchanged: "border-l-4 border-transparent",
};
const LINE_MARKS = { added: "+", removed: "-", unchanged: " " };

export default function TextDiff() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");

  const result = useMemo(
    () => (original || changed ? diffLines(original, changed) : null),
    [original, changed],
  );

  const handleClear = () => {
    setOriginal("");
    setChanged("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextPanel id="diff-original" label="Original" value={original} onChange={setOriginal} placeholder="Paste the original text..." />
          <TextPanel id="diff-changed" label="Changed" value={changed} onChange={setChanged} placeholder="Paste the changed text..." />
        </div>

        <Button variant="outline" size="sm" className="w-fit" onClick={handleClear} disabled={!original && !changed}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </Button>

        {result && !result.success && <ErrorMessage title="Can't compare these texts" message={result.error} />}

        {result?.success && (
          <div>
            {(() => {
              const summary = summarizeLineDiff(result.diff);
              const hasChanges = summary.added > 0 || summary.removed > 0;
              return (
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {hasChanges
                      ? `${summary.added} added · ${summary.removed} removed · ${summary.unchanged} unchanged`
                      : "The texts are identical."}
                  </p>
                  {hasChanges && <CopyButton text={formatUnifiedDiff(result.diff)} label="Copy diff" />}
                </div>
              );
            })()}

            {result.diff.every((d) => d.type === "unchanged") ? (
              <EmptyState icon={GitCompareArrows} title="No differences" description="Both texts are identical." />
            ) : (
              <pre className="overflow-x-auto rounded-lg border border-border bg-code-background font-mono text-sm">
                {result.diff.map((d, index) => (
                  <div key={index} className={cn("px-3.5 py-0.5 whitespace-pre-wrap", LINE_STYLES[d.type])}>
                    <span className="mr-2 select-none text-muted-foreground">{LINE_MARKS[d.type]}</span>
                    {d.line || " "}
                  </div>
                ))}
              </pre>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
