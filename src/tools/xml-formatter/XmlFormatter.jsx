import { useState } from "react";
import { Download, FileCode, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { formatXml, minifyXml } from "./xmlFormatter.utils.js";

const tool = getToolById("xml-formatter");
const SAMPLE = "<root><user id=\"1\"><name>John</name><active>true</active></user></root>";

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function XmlFormatter() {
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
            id="xml-input"
            label="Input"
            value={input}
            onChange={(value) => {
              setInput(value);
              if (!value.trim()) {
                setOutput("");
                setError(null);
              }
            }}
            placeholder="Paste XML here..."
            invalid={Boolean(error)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => run(formatXml)}>
              Format
            </Button>
            <Button variant="secondary" size="sm" onClick={() => run(minifyXml)}>
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
            <ErrorMessage title="Invalid XML" message={error} />
          ) : output ? (
            <TextPanel
              id="xml-output"
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
                      downloadFile(output, "data.xml");
                      showToast("data.xml downloaded");
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
              <EmptyState icon={FileCode} title="Nothing here yet" description="Paste some XML and click Format." />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
