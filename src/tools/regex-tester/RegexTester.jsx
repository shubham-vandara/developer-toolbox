import { useMemo, useState } from "react";
import { Regex } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { buildHighlightedSegments, replaceRegex, testRegex } from "./regexTester.utils.js";

const tool = getToolById("regex-tester");

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [input, setInput] = useState("");
  const [replacement, setReplacement] = useState("");

  const result = useMemo(() => (pattern && input ? testRegex(pattern, flags, input) : null), [pattern, flags, input]);
  const segments = useMemo(
    () => (result?.success ? buildHighlightedSegments(input, result.matches) : null),
    [input, result],
  );
  const replaceResult = useMemo(
    () => (pattern && input && replacement ? replaceRegex(pattern, flags, input, replacement) : null),
    [pattern, flags, input, replacement],
  );

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label htmlFor="regex-pattern" className="mb-1.5 block text-sm font-medium text-foreground">
              Pattern
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">/</span>
              <input
                id="regex-pattern"
                value={pattern}
                onChange={(event) => setPattern(event.target.value)}
                placeholder="\d+"
                spellCheck={false}
                aria-invalid={Boolean(result && !result.success) || undefined}
                className="h-10 flex-1 rounded-md border border-input bg-code-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive/50"
              />
              <span className="font-mono text-muted-foreground">/</span>
            </div>
          </div>
          <div>
            <label htmlFor="regex-flags" className="mb-1.5 block text-sm font-medium text-foreground">
              Flags
            </label>
            <input
              id="regex-flags"
              value={flags}
              onChange={(event) => setFlags(event.target.value)}
              placeholder="g"
              spellCheck={false}
              className="h-10 w-20 rounded-md border border-input bg-code-background px-3 text-center font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <TextPanel
          id="regex-input"
          label="Test string"
          value={input}
          onChange={setInput}
          placeholder="Paste text to test the pattern against..."
          rows={6}
        />

        {result && !result.success && <ErrorMessage title="Invalid regular expression" message={result.error} />}

        {segments && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Highlighted matches</p>
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-code-background px-3.5 py-3 font-mono text-sm text-foreground">
              {segments.map((segment, index) =>
                segment.isMatch ? (
                  <mark key={index} className="rounded bg-primary/25 text-foreground">
                    {segment.text}
                  </mark>
                ) : (
                  <span key={index}>{segment.text}</span>
                ),
              )}
            </pre>
          </div>
        )}

        {result?.success && (
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">
              {result.matches.length} match{result.matches.length === 1 ? "" : "es"}
            </p>
            {result.matches.length === 0 ? (
              <EmptyState icon={Regex} title="No matches" description="Nothing in the test string matches this pattern." />
            ) : (
              <ul className="flex flex-col gap-1.5">
                {result.matches.map((m, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-foreground">"{m.match}"</span>
                    <span className="text-xs text-muted-foreground">at index {m.index}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div>
          <label htmlFor="regex-replacement" className="mb-1.5 block text-sm font-medium text-foreground">
            Replacement (optional)
          </label>
          <input
            id="regex-replacement"
            value={replacement}
            onChange={(event) => setReplacement(event.target.value)}
            placeholder="Replacement text, e.g. $1"
            spellCheck={false}
            className="h-10 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {replaceResult?.success && (
          <TextPanel
            id="regex-replace-output"
            label="Result after replace"
            value={replaceResult.value}
            readOnly
            rows={4}
            actions={<CopyButton text={replaceResult.value} />}
          />
        )}
      </div>
    </ToolLayout>
  );
}
