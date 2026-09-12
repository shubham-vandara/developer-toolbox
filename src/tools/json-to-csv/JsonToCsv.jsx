import { useMemo, useState } from "react";
import { Download, Table2, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { jsonToCsv } from "./jsonToCsv.utils.js";

const tool = getToolById("json-to-csv");
const SAMPLE = '[\n  { "name": "John", "age": 25 },\n  { "name": "Jane", "age": 30 }\n]';

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function JsonToCsv() {
  const [input, setInput] = useState("");
  const { showToast } = useToast();

  const result = useMemo(() => (input.trim() ? jsonToCsv(input) : null), [input]);
  const output = result?.success ? result.value : "";
  const error = result && !result.success ? result.error : null;

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="json-to-csv-input"
            label="JSON Input"
            value={input}
            onChange={setInput}
            placeholder="Paste a JSON array of objects..."
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
            <ErrorMessage title="Couldn't convert to CSV" message={error} />
          ) : output ? (
            <TextPanel
              id="json-to-csv-output"
              label="CSV Output"
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
                      downloadFile(output, "data.csv", "text/csv");
                      showToast("data.csv downloaded");
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
              <p className="mb-2 text-sm font-medium text-foreground">CSV Output</p>
              <EmptyState
                icon={Table2}
                title="Nothing here yet"
                description="Paste a JSON array of objects to convert it to CSV."
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
