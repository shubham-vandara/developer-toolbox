import { useMemo, useState } from "react";
import { Download, FileX2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { buildGitignore, GITIGNORE_TEMPLATES } from "./gitignoreTemplates.data.js";

const tool = getToolById("gitignore-generator");

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function GitignoreGenerator() {
  const [selected, setSelected] = useState(["node"]);
  const { showToast } = useToast();

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const output = useMemo(() => buildGitignore(selected), [selected]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">Select what to ignore</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            {GITIGNORE_TEMPLATES.map((template) => (
              <Checkbox
                key={template.id}
                id={`gitignore-${template.id}`}
                checked={selected.includes(template.id)}
                onChange={() => toggle(template.id)}
                label={template.label}
              />
            ))}
          </div>
        </div>

        {output ? (
          <TextPanel
            id="gitignore-output"
            label=".gitignore"
            value={output}
            readOnly
            rows={16}
            actions={
              <div className="flex gap-2">
                <CopyButton text={output} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadFile(output, ".gitignore");
                    showToast(".gitignore downloaded");
                  }}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </Button>
              </div>
            }
          />
        ) : (
          <EmptyState icon={FileX2} title="Nothing selected" description="Choose at least one stack to generate a .gitignore." />
        )}
      </div>
    </ToolLayout>
  );
}
