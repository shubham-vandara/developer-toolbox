import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { getToolById } from "../../data/tools.js";
import { countText } from "./textCounter.utils.js";

const tool = getToolById("text-counter");

const STAT_LABELS = [
  { key: "characters", label: "Characters" },
  { key: "charactersWithoutSpaces", label: "Without spaces" },
  { key: "words", label: "Words" },
  { key: "lines", label: "Lines" },
  { key: "sentences", label: "Sentences" },
  { key: "paragraphs", label: "Paragraphs" },
];

export default function TextCounter() {
  const [input, setInput] = useState("");
  const stats = useMemo(() => countText(input), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <TextPanel
          id="text-counter-input"
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Type or paste text here..."
          rows={10}
          actions={
            <div className="flex gap-2">
              <CopyButton text={input} />
              <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-lg border border-border bg-surface px-4 py-3 text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">{stats[key].toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
