import { useMemo, useState } from "react";
import { FileDiff, Trash2, WandSparkles } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { formatJson, parseJsonSafe } from "../json/json.utils.js";
import { diffValues, formatDiffValue, summarizeDiff } from "./jsonDiff.utils.js";

const tool = getToolById("json-diff");

const TYPE_STYLES = {
  added: "border-success/30 bg-success/10 text-success",
  removed: "border-destructive/30 bg-destructive/10 text-destructive",
  changed: "border-warning/30 bg-warning/10 text-warning",
};

export default function JsonDiff() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const leftResult = left.trim() ? parseJsonSafe(left) : null;
  const rightResult = right.trim() ? parseJsonSafe(right) : null;

  const changes = useMemo(() => {
    if (leftResult?.success && rightResult?.success) {
      return diffValues(leftResult.value, rightResult.value);
    }
    return null;
  }, [leftResult, rightResult]);

  const summary = changes ? summarizeDiff(changes) : null;

  const formatBoth = () => {
    if (leftResult?.success) setLeft(formatJson(left).value);
    if (rightResult?.success) setRight(formatJson(right).value);
  };

  const diffText = changes
    ? changes
        .map((c) => {
          if (c.type === "added") return `+ ${c.path}: ${formatDiffValue(c.newValue)}`;
          if (c.type === "removed") return `- ${c.path}: ${formatDiffValue(c.oldValue)}`;
          return `~ ${c.path}: ${formatDiffValue(c.oldValue)} → ${formatDiffValue(c.newValue)}`;
        })
        .join("\n")
    : "";

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextPanel
            id="json-diff-left"
            label="Original"
            value={left}
            onChange={setLeft}
            placeholder="Paste the original JSON..."
            invalid={Boolean(leftResult && !leftResult.success)}
          />
          <TextPanel
            id="json-diff-right"
            label="Changed"
            value={right}
            onChange={setRight}
            placeholder="Paste the changed JSON..."
            invalid={Boolean(rightResult && !rightResult.success)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={formatBoth} disabled={!left && !right}>
            <WandSparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Format both
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLeft("");
              setRight("");
            }}
            disabled={!left && !right}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        </div>

        {leftResult && !leftResult.success && (
          <ErrorMessage title="Original JSON is invalid" message={leftResult.error.message} />
        )}
        {rightResult && !rightResult.success && (
          <ErrorMessage title="Changed JSON is invalid" message={rightResult.error.message} />
        )}

        {changes && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-foreground">
                  {changes.length === 0 ? "No differences" : `${changes.length} difference${changes.length === 1 ? "" : "s"}`}
                </span>
                {summary && changes.length > 0 && (
                  <span className="text-muted-foreground">
                    ({summary.added} added · {summary.removed} removed · {summary.changed} changed)
                  </span>
                )}
              </div>
              {changes.length > 0 && <CopyButton text={diffText} label="Copy diff" />}
            </div>

            {changes.length === 0 ? (
              <EmptyState icon={FileDiff} title="The documents are identical" description="No differences were found." />
            ) : (
              <ul className="flex flex-col gap-2">
                {changes.map((change) => (
                  <li
                    key={`${change.type}-${change.path}`}
                    className={cn("rounded-lg border px-4 py-2.5 font-mono text-sm", TYPE_STYLES[change.type])}
                  >
                    <span className="font-semibold">{change.path}</span>
                    {change.type === "added" && <span> added: {formatDiffValue(change.newValue)}</span>}
                    {change.type === "removed" && <span> removed: {formatDiffValue(change.oldValue)}</span>}
                    {change.type === "changed" && (
                      <span>
                        {" "}
                        changed: {formatDiffValue(change.oldValue)} → {formatDiffValue(change.newValue)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
