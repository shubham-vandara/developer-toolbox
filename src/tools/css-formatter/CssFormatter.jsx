import { useState } from "react";
import { Download, Paintbrush, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { formatCss, minifyCss } from "./cssFormatter.utils.js";

const tool = getToolById("css-formatter");
const SAMPLE = ".card{padding:16px;border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.1)}";

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CssFormatter() {
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

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <TextPanel
            id="css-input"
            label="Input"
            value={input}
            onChange={(value) => {
              setInput(value);
              if (!value.trim()) {
                setOutput("");
                setError(null);
              }
            }}
            placeholder="Paste CSS here..."
            invalid={Boolean(error)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => run(formatCss)}>
              Format
            </Button>
            <Button variant="secondary" size="sm" onClick={() => run(minifyCss)}>
              Minify
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear} disabled={!input}>
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
            <ErrorMessage title="Couldn't process this CSS" message={error} />
          ) : output ? (
            <TextPanel
              id="css-output"
              label="Output"
              value={output}
              readOnly
              actions={
                <div className="flex gap-2">
                  <CopyButton text={output} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      downloadFile(output, "styles.css");
                      showToast("styles.css downloaded");
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
              <EmptyState icon={Paintbrush} title="Nothing here yet" description="Paste some CSS and click Format." />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
