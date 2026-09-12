import { useMemo, useState } from "react";
import { ArrowDownAZ, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { Select } from "../../components/common/Select.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { sortLines, SORT_MODES } from "./sortLines.utils.js";

const tool = getToolById("sort-lines");

export default function SortLines() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("az");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [preserveEmpty, setPreserveEmpty] = useState(true);

  const output = useMemo(
    () =>
      input.trim()
        ? sortLines(input, { mode, removeDuplicates, ignoreCase, preserveEmpty }).join("\n")
        : "",
    [input, mode, removeDuplicates, ignoreCase, preserveEmpty],
  );

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="sort-lines-input"
            label="Input"
            value={input}
            onChange={setInput}
            placeholder="Paste lines here, one per line..."
            stats={`${input ? input.split("\n").length : 0} lines`}
          />
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <Select id="sort-mode" label="Sort by" value={mode} onChange={setMode} options={SORT_MODES.map((m) => ({ value: m.id, label: m.label }))} className="w-48" />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-2">
              <Checkbox id="sort-remove-dup" checked={removeDuplicates} onChange={setRemoveDuplicates} label="Remove duplicates" />
              <Checkbox id="sort-ignore-case" checked={ignoreCase} onChange={setIgnoreCase} label="Ignore case" />
              <Checkbox id="sort-preserve-empty" checked={preserveEmpty} onChange={setPreserveEmpty} label="Preserve empty lines" />
            </div>
          </div>
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          </div>
        </div>

        <div>
          {output ? (
            <TextPanel
              id="sort-lines-output"
              label="Output"
              value={output}
              readOnly
              stats={`${output.split("\n").length} lines`}
              actions={<CopyButton text={output} />}
            />
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Output</p>
              <EmptyState icon={ArrowDownAZ} title="Nothing here yet" description="Paste some lines to sort them." />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
