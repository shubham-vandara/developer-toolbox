import { useMemo, useState } from "react";
import { Database, Download, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { formatSql } from "./sqlFormatter.utils.js";

const tool = getToolById("sql-formatter");
const SAMPLE = "select id, name, email from users where active = true order by name asc;";

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const { showToast } = useToast();

  const result = useMemo(() => (input.trim() ? formatSql(input) : null), [input]);
  const output = result?.success ? result.value : "";
  const error = result && !result.success ? result.error : null;

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
        This tool only formats SQL text. It never connects to a database or executes anything.
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="sql-input"
            label="SQL Input"
            value={input}
            onChange={setInput}
            placeholder="Paste a SQL query..."
            invalid={Boolean(error)}
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
          {error ? (
            <ErrorMessage title="Couldn't format this SQL" message={error} />
          ) : output ? (
            <TextPanel
              id="sql-output"
              label="Formatted SQL"
              value={output}
              readOnly
              actions={
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      downloadFile(output, "query.sql");
                      showToast("query.sql downloaded");
                    }}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </Button>
                </div>
              }
            />
          ) : (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Formatted SQL</p>
              <EmptyState icon={Database} title="Nothing here yet" description="Paste a SQL query to format it." />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
