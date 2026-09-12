import { useMemo, useState } from "react";
import { ListMinus, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { removeDuplicateLines } from "./removeDuplicateLines.utils.js";

const tool = getToolById("remove-duplicate-lines");

export default function RemoveDuplicateLines() {
  const [input, setInput] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [sort, setSort] = useState(false);

  const result = useMemo(
    () => (input.trim() ? removeDuplicateLines(input, { ignoreCase, trimLines, sort }) : null),
    [input, ignoreCase, trimLines, sort],
  );
  const output = result ? result.lines.join("\n") : "";

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="dedupe-input"
            label="Input"
            value={input}
            onChange={setInput}
            placeholder="Paste lines here, one per line..."
            stats={`${input ? input.split("\n").length : 0} lines`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Checkbox id="dedupe-ignore-case" checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" />
            <Checkbox id="dedupe-trim" checked={trimLines} onChange={setTrimLines} label="Trim whitespace" />
            <Checkbox id="dedupe-sort" checked={sort} onChange={setSort} label="Sort result" />
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        <div>
          {result ? (
            <TextPanel
              id="dedupe-output"
              label="Output"
              value={output}
              readOnly
              stats={`${result.lines.length} unique line${result.lines.length === 1 ? "" : "s"} · ${result.removedCount} duplicate${result.removedCount === 1 ? "" : "s"} removed`}
              actions={<CopyButton text={output} />}
            />
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Output</p>
              <EmptyState
                icon={ListMinus}
                title="Nothing here yet"
                description="Paste some lines to remove duplicates."
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
