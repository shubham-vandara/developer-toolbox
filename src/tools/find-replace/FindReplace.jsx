import { useMemo, useState } from "react";
import { Replace, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { findReplace } from "./findReplace.utils.js";

const tool = getToolById("find-replace");

export default function FindReplace() {
  const [input, setInput] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [replaceAll, setReplaceAll] = useState(true);

  const result = useMemo(
    () => (input && find ? findReplace(input, { find, replace, caseSensitive, useRegex, replaceAll }) : null),
    [input, find, replace, caseSensitive, useRegex, replaceAll],
  );

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <TextPanel
          id="find-replace-input"
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Paste text here..."
          rows={8}
          actions={
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="find-text" className="mb-1.5 block text-sm font-medium text-foreground">
              Find
            </label>
            <input
              id="find-text"
              value={find}
              onChange={(event) => setFind(event.target.value)}
              placeholder={useRegex ? "Regular expression..." : "Text to find..."}
              className="h-9 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="replace-text" className="mb-1.5 block text-sm font-medium text-foreground">
              Replace with
            </label>
            <input
              id="replace-text"
              value={replace}
              onChange={(event) => setReplace(event.target.value)}
              placeholder="Replacement text..."
              className="h-9 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Checkbox id="fr-case" checked={caseSensitive} onChange={setCaseSensitive} label="Case-sensitive" />
          <Checkbox id="fr-regex" checked={useRegex} onChange={setUseRegex} label="Use regular expression" />
          <Checkbox
            id="fr-all"
            checked={replaceAll}
            onChange={setReplaceAll}
            label={replaceAll ? "Replace all" : "Replace first only"}
          />
        </div>

        {result?.success === false ? (
          <ErrorMessage title="Invalid pattern" message={result.error} />
        ) : result ? (
          <TextPanel
            id="find-replace-output"
            label="Output"
            value={result.value}
            readOnly
            rows={8}
            stats={`${result.matchCount} match${result.matchCount === 1 ? "" : "es"} found`}
            actions={<CopyButton text={result.value} />}
          />
        ) : (
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Output</p>
            <EmptyState
              icon={Replace}
              title="Nothing to replace yet"
              description="Enter text and a search term to see the result."
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
