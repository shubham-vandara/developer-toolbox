import { useState } from "react";
import { Dices, Download, Info } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Select } from "../../components/common/Select.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { DATA_TYPES, generateRandomData } from "./randomDataGenerator.utils.js";

const tool = getToolById("random-data-generator");
const QUANTITY_OPTIONS = [5, 10, 25, 50, 100];

function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function RandomDataGenerator() {
  const [type, setType] = useState("name");
  const [quantity, setQuantity] = useState(10);
  const [data, setData] = useState(() => generateRandomData("name", 10));
  const { showToast } = useToast();

  const output = JSON.stringify(data, null, 2);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">Fake/Test Data.</span> All values are randomly generated and do not
            represent real people or information.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Select
            id="random-data-type"
            label="Data type"
            value={type}
            onChange={setType}
            options={DATA_TYPES.map((t) => ({ value: t.id, label: t.label }))}
            className="w-48"
          />
          <Select
            id="random-data-quantity"
            label="Quantity"
            value={String(quantity)}
            onChange={(v) => setQuantity(Number(v))}
            options={QUANTITY_OPTIONS.map((q) => ({ value: String(q), label: String(q) }))}
            className="w-28"
          />
          <Button onClick={() => setData(generateRandomData(type, quantity))}>
            <Dices className="h-4 w-4" aria-hidden="true" />
            Generate
          </Button>
        </div>

        <TextPanel
          id="random-data-output"
          label="JSON Output"
          value={output}
          readOnly
          rows={14}
          stats={`${data.length} value${data.length === 1 ? "" : "s"}`}
          actions={
            <div className="flex gap-2">
              <CopyButton text={output} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadFile(output, "random-data.json");
                  showToast("random-data.json downloaded");
                }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Download
              </Button>
            </div>
          }
        />
      </div>
    </ToolLayout>
  );
}
