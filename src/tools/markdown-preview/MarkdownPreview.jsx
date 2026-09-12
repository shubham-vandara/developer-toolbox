import { useMemo, useState } from "react";
import { NotebookText, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { renderMarkdown } from "./markdownPreview.utils.js";

const tool = getToolById("markdown-preview");
const SAMPLE = "# Hello, Markdown\n\nThis is a **live preview**. It supports:\n\n- Lists\n- `inline code`\n- [Links](https://example.com)\n\n```js\nconst answer = 42;\n```\n";

export default function MarkdownPreview() {
  const [input, setInput] = useState("");
  const result = useMemo(() => renderMarkdown(input), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="markdown-input"
            label="Markdown"
            value={input}
            onChange={setInput}
            placeholder="Type or paste Markdown here..."
            rows={16}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
            {!input && (
              <Button variant="ghost" size="sm" onClick={() => setInput(SAMPLE)}>
                Load sample
              </Button>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Preview</p>
          {result.html ? (
            <div
              className="prose prose-sm max-w-none rounded-lg border border-border bg-surface px-4 py-3 dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          ) : (
            <EmptyState
              icon={NotebookText}
              title="Nothing to preview yet"
              description="Type some Markdown to see it rendered here."
            />
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
