import { useMemo, useState } from "react";
import { Download, FileJson, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { csvToJson } from "./csvToJson.utils.js";

const tool = getToolById("csv-to-json");
const SAMPLE = "name,age\nJohn,25\nJane,30";

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CsvToJson() {
  const [input, setInput] = useState("");
  const { showToast } = useToast();

  const result = useMemo(() => (input.trim() ? csvToJson(input) : null), [input]);
  const output = result?.success ? result.value : "";
  const error = result && !result.success ? result.error : null;

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="csv-to-json-input"
            label="CSV Input"
            value={input}
            onChange={setInput}
            placeholder="Paste CSV data with a header row..."
            stats={`${input.length.toLocaleString()} characters`}
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
            <ErrorMessage title="Couldn't parse CSV" message={error} />
          ) : output ? (
            <TextPanel
              id="csv-to-json-output"
              label="JSON Output"
              value={output}
              readOnly
              stats={`${result.rowCount} row${result.rowCount === 1 ? "" : "s"} · ${result.columnCount} column${result.columnCount === 1 ? "" : "s"}`}
              actions={
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      downloadFile(output, "data.json", "application/json");
                      showToast("data.json downloaded");
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
              <p className="mb-2 text-sm font-medium text-foreground">JSON Output</p>
              <EmptyState
                icon={FileJson}
                title="Nothing here yet"
                description="Paste CSV data with a header row to convert it to JSON."
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
