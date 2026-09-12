import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { FileCode2, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { jsonToYaml, yamlToJson } from "./yamlJson.utils.js";

const tool = getToolById("yaml-json");
const SAMPLE_YAML = "name: John\nage: 25\ndeveloper: true\n";
const SAMPLE_JSON = '{\n  "name": "John",\n  "age": 25,\n  "developer": true\n}';

export default function YamlJsonConverter() {
  const [mode, setMode] = useState("yaml-to-json");
  const [input, setInput] = useState("");

  const result = input.trim() ? (mode === "yaml-to-json" ? yamlToJson(input) : jsonToYaml(input)) : null;
  const output = result?.success ? result.value : "";
  const error = result && !result.success ? result.error : null;

  return (
    <ToolLayout tool={tool}>
      <Tabs.Root value={mode} onValueChange={setMode} className="flex flex-col gap-6">
        <Tabs.List className="inline-flex w-fit rounded-lg border border-border bg-muted p-1" aria-label="Conversion direction">
          {[
            { value: "yaml-to-json", label: "YAML → JSON" },
            { value: "json-to-yaml", label: "JSON → YAML" },
          ].map(({ value, label }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                mode === value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <TextPanel
              id="yaml-json-input"
              label={mode === "yaml-to-json" ? "YAML" : "JSON"}
              value={input}
              onChange={setInput}
              placeholder={mode === "yaml-to-json" ? "Paste YAML here..." : "Paste JSON here..."}
              invalid={Boolean(error)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
              {!input && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(mode === "yaml-to-json" ? SAMPLE_YAML : SAMPLE_JSON)}
                >
                  Load sample
                </Button>
              )}
            </div>
          </div>

          <div>
            {error ? (
              <ErrorMessage title="Conversion failed" message={error} />
            ) : output ? (
              <TextPanel
                id="yaml-json-output"
                label={mode === "yaml-to-json" ? "JSON" : "YAML"}
                value={output}
                readOnly
                actions={<CopyButton text={output} />}
              />
            ) : (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">{mode === "yaml-to-json" ? "JSON" : "YAML"}</p>
                <EmptyState
                  icon={FileCode2}
                  title="Nothing here yet"
                  description={`Paste some ${mode === "yaml-to-json" ? "YAML" : "JSON"} to convert it.`}
                />
              </div>
            )}
          </div>
        </div>
      </Tabs.Root>
    </ToolLayout>
  );
}
