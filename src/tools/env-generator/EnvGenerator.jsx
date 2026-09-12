import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { getToolById } from "../../data/tools.js";
import { buildEnvExample, buildEnvFile } from "./envGenerator.utils.js";

const tool = getToolById("env-generator");
let rowId = 0;
const createRow = (key = "", value = "") => ({ id: ++rowId, key, value });

export default function EnvGenerator() {
  const [rows, setRows] = useState(() => [
    createRow("PORT", "3000"),
    createRow("DATABASE_URL", "postgres://localhost:5432/app"),
  ]);
  const [includeExample, setIncludeExample] = useState(true);

  const updateRow = (id, field, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };
  const removeRow = (id) => setRows((prev) => prev.filter((row) => row.id !== id));
  const addRow = () => setRows((prev) => [...prev, createRow()]);

  const envFile = useMemo(() => buildEnvFile(rows), [rows]);
  const envExample = useMemo(() => buildEnvExample(rows), [rows]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                value={row.key}
                onChange={(event) => updateRow(row.id, "key", event.target.value)}
                placeholder="KEY"
                spellCheck={false}
                className="h-10 flex-1 rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="text-muted-foreground">=</span>
              <input
                value={row.value}
                onChange={(event) => updateRow(row.id, "value", event.target.value)}
                placeholder="value"
                spellCheck={false}
                className="h-10 flex-1 rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeRow(row.id)}
                aria-label="Remove variable"
                disabled={rows.length === 1}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRow} className="w-fit">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add variable
          </Button>
        </div>

        <Checkbox
          id="env-include-example"
          checked={includeExample}
          onChange={setIncludeExample}
          label="Also generate .env.example"
        />

        <div className={includeExample ? "grid grid-cols-1 gap-6 lg:grid-cols-2" : ""}>
          <TextPanel
            id="env-output"
            label=".env"
            value={envFile}
            readOnly
            rows={10}
            actions={<CopyButton text={envFile} />}
          />
          {includeExample && (
            <TextPanel
              id="env-example-output"
              label=".env.example"
              value={envExample}
              readOnly
              rows={10}
              actions={<CopyButton text={envExample} />}
            />
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
