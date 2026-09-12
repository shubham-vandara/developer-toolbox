import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeftRight, Code2, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { decodeHtmlEntities, encodeHtmlEntities } from "./htmlEntities.utils.js";

const tool = getToolById("html-entities");

export default function HtmlEntityTool() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");

  const result = input ? (mode === "encode" ? encodeHtmlEntities(input) : decodeHtmlEntities(input)) : null;
  const output = result?.success ? result.value : "";
  const error = result && !result.success ? result.error : null;

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode(mode === "encode" ? "decode" : "encode");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <Tabs.Root value={mode} onValueChange={setMode} className="flex flex-col gap-6">
        <Tabs.List className="inline-flex w-fit rounded-lg border border-border bg-muted p-1" aria-label="HTML entity mode">
          {["encode", "decode"].map((value) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                mode === value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {value}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextPanel
            id="html-entities-input"
            label={mode === "encode" ? "Text / HTML" : "Encoded HTML"}
            value={input}
            onChange={setInput}
            placeholder={mode === "encode" ? "Type or paste text..." : "Paste encoded HTML..."}
            stats={`${input.length.toLocaleString()} characters`}
          />

          <div>
            {error ? (
              <ErrorMessage title="Conversion failed" message={error} />
            ) : output ? (
              <TextPanel
                id="html-entities-output"
                label={mode === "encode" ? "Encoded HTML" : "Text / HTML"}
                value={output}
                readOnly
                stats={`${output.length.toLocaleString()} characters`}
                actions={<CopyButton text={output} />}
              />
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  {mode === "encode" ? "Encoded HTML" : "Text / HTML"}
                </p>
                <EmptyState icon={Code2} title="Nothing here yet" description="Enter some text to get started." />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleSwap} disabled={!output}>
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            Swap
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear
          </Button>
        </div>
      </Tabs.Root>
    </ToolLayout>
  );
}
