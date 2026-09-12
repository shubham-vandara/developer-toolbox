import { useMemo, useState } from "react";
import { Braces, Download, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { formatJson, minifyJson } from "./json.utils.js";

const tool = getToolById("json-formatter");
const SAMPLE = '{\n  "name": "John",\n  "age": 25,\n  "developer": true\n}';

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const run = (transform) => {
    if (!input.trim()) {
      setError(null);
      setOutput("");
      return;
    }
    const result = transform(input);
    if (result.success) {
      setError(null);
      setOutput(result.value);
    } else {
      setError(result.error);
      setOutput("");
    }
  };

  const handleFormat = () => run((value) => formatJson(value, 2));
  const handleMinify = () => run(minifyJson);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleFormat();
    }
  };

  const outputLineCount = useMemo(() => (output ? output.split("\n").length : 0), [output]);

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div onKeyDown={handleKeyDown}>
          <TextPanel
            id="json-input"
            label="Input"
            value={input}
            onChange={(value) => {
              setInput(value);
              if (!value.trim()) {
                setOutput("");
                setError(null);
              }
            }}
            placeholder="Paste JSON here..."
            stats={`${input.length.toLocaleString()} characters · Ctrl/Cmd + Enter to format`}
            invalid={Boolean(error)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={handleFormat} size="sm">
              Format
            </Button>
            <Button onClick={handleMinify} variant="secondary" size="sm">
              Minify
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
            {!input && (
              <Button onClick={() => setInput(SAMPLE)} variant="ghost" size="sm">
                Load sample
              </Button>
            )}
          </div>
        </div>

        <div>
          {error ? (
            <ErrorMessage
              title="Invalid JSON"
              message={error.message}
              detail={
                error.line
                  ? `Check the JSON near line ${error.line}, column ${error.column}.`
                  : undefined
              }
            />
          ) : output ? (
            <TextPanel
              id="json-output"
              label="Output"
              value={output}
              readOnly
              stats={`${output.length.toLocaleString()} characters · ${outputLineCount} line${outputLineCount === 1 ? "" : "s"}`}
              actions={
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      downloadFile(output, "data.json");
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
              <p className="mb-2 text-sm font-medium text-foreground">Output</p>
              <EmptyState
                icon={Braces}
                title="Nothing here yet"
                description="Paste some JSON and click Format to get started."
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
