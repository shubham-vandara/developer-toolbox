import { useMemo, useState } from "react";
import { Type } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { textToAsciiArt } from "./asciiArt.utils.js";

const tool = getToolById("ascii-art");

export default function AsciiArt() {
  const [input, setInput] = useState("");
  const result = useMemo(() => (input.trim() ? textToAsciiArt(input) : null), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="ascii-art-input" className="mb-1.5 block text-sm font-medium text-foreground">
            Text
          </label>
          <input
            id="ascii-art-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type something, e.g. HELLO"
            spellCheck={false}
            className="h-10 w-full rounded-md border border-input bg-surface px-3.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Supports A-Z, 0-9, spaces, and basic punctuation. Unsupported characters render as blank space.
          </p>
        </div>

        {result?.success === false && <ErrorMessage title="Nothing to render" message={result.error} />}

        {result?.success ? (
          <TextPanel
            id="ascii-art-output"
            label="Output"
            value={result.value}
            readOnly
            rows={10}
            actions={<CopyButton text={result.value} />}
          />
        ) : (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Output</p>
            <EmptyState icon={Type} title="Nothing here yet" description="Type some text above to render it as ASCII art." />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
