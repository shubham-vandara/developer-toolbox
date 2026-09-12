import { useMemo, useState } from "react";
import { Bug, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { formatStackTrace, isVendorFrame } from "./stackTraceFormatter.utils.js";

const tool = getToolById("stack-trace-formatter");

function entryToText(entry) {
  if (entry.type === "frame") {
    const location = entry.column !== undefined ? `${entry.file}:${entry.line}:${entry.column}` : `${entry.file}:${entry.line}`;
    return `  at ${entry.function} (${location})`;
  }
  return entry.text;
}

export default function StackTraceFormatter() {
  const [input, setInput] = useState("");
  const [hideVendorFrames, setHideVendorFrames] = useState(false);

  const result = useMemo(
    () => (input.trim() ? formatStackTrace(input, { hideVendorFrames }) : null),
    [input, hideVendorFrames],
  );

  const plainText = result?.success ? result.entries.map(entryToText).join("\n") : "";

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <TextPanel
          id="stack-trace-input"
          label="Stack trace"
          value={input}
          onChange={setInput}
          placeholder="Paste a Java, JavaScript, or Python stack trace..."
          rows={10}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox
            id="stack-hide-vendor"
            checked={hideVendorFrames}
            onChange={setHideVendorFrames}
            label="Hide vendor / library frames (node_modules, site-packages, jars)"
          />
          <div className="flex gap-2">
            {result?.success && <CopyButton text={plainText} label="Copy" />}
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        {result && !result.success && <ErrorMessage title="Nothing to format" message={result.error} />}

        {result?.success &&
          (result.entries.length === 0 ? (
            <EmptyState icon={Bug} title="No frames left" description="Every frame was hidden as a vendor frame." />
          ) : (
            <pre className="overflow-x-auto rounded-lg border border-border bg-code-background px-3.5 py-3 font-mono text-sm">
              {result.entries.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    "whitespace-pre-wrap py-0.5",
                    entry.type === "cause" && "mt-1 font-semibold text-warning",
                    entry.type === "frame" && isVendorFrame(entry) && "text-muted-foreground",
                    entry.type === "frame" && !isVendorFrame(entry) && "text-foreground",
                    entry.type === "text" && "text-foreground",
                  )}
                >
                  {entry.type === "frame" ? (
                    <>
                      <span className="text-muted-foreground">at </span>
                      <span className="font-semibold">{entry.function}</span>
                      <span className="text-muted-foreground"> (</span>
                      <span className="text-primary">
                        {entry.file}:{entry.line}
                        {entry.column !== undefined ? `:${entry.column}` : ""}
                      </span>
                      <span className="text-muted-foreground">)</span>
                    </>
                  ) : (
                    entry.text
                  )}
                </div>
              ))}
            </pre>
          ))}
      </div>
    </ToolLayout>
  );
}
