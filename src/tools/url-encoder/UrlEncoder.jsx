import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeftRight, Link2, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { transformUrl, URL_MODES } from "./url.utils.js";

const tool = getToolById("url-encoder");
const OPPOSITE_MODE = {
  "encode-uri": "decode-uri",
  "decode-uri": "encode-uri",
  "encode-component": "decode-component",
  "decode-component": "encode-component",
};

export default function UrlEncoder() {
  const [mode, setMode] = useState("encode-uri");
  const [input, setInput] = useState("");

  const result = input ? transformUrl(input, mode) : null;
  const output = result?.success ? result.value : "";
  const error = result && !result.success ? result.error : null;

  const handleSwap = () => {
    if (output) {
      setInput(output);
      setMode(OPPOSITE_MODE[mode]);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <Tabs.Root value={mode} onValueChange={setMode} className="flex flex-col gap-6">
        <Tabs.List
          className="inline-flex w-fit flex-wrap gap-1 rounded-lg border border-border bg-muted p-1"
          aria-label="URL transform mode"
        >
          {URL_MODES.map(({ id, label }) => (
            <Tabs.Trigger
              key={id}
              value={id}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                mode === id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TextPanel
            id="url-input"
            label="Input"
            value={input}
            onChange={setInput}
            placeholder="Type or paste text/URL here..."
            stats={`${input.length.toLocaleString()} characters`}
            invalid={Boolean(error)}
          />

          <div>
            {error ? (
              <ErrorMessage title="Conversion failed" message={error} />
            ) : output ? (
              <TextPanel
                id="url-output"
                label="Output"
                value={output}
                readOnly
                stats={`${output.length.toLocaleString()} characters`}
                actions={<CopyButton text={output} />}
              />
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Output</p>
                <EmptyState icon={Link2} title="Nothing here yet" description="Enter text to see the result." />
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
