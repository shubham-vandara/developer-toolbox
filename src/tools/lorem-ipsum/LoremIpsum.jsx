import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { Select } from "../../components/common/Select.jsx";
import { getToolById } from "../../data/tools.js";
import { generateLoremIpsum } from "./loremIpsum.utils.js";

const tool = getToolById("lorem-ipsum");
const UNIT_OPTIONS = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
];

export default function LoremIpsum() {
  const [unit, setUnit] = useState("paragraphs");
  const [count, setCount] = useState(3);
  const [startWithClassic, setStartWithClassic] = useState(true);
  const [output, setOutput] = useState(() => generateLoremIpsum({ unit: "paragraphs", count: 3, startWithClassic: true }));

  const handleGenerate = () => setOutput(generateLoremIpsum({ unit, count, startWithClassic }));

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <Select id="lorem-unit" label="Generate" value={unit} onChange={setUnit} options={UNIT_OPTIONS} className="w-40" />
          <div>
            <label htmlFor="lorem-count" className="mb-1.5 block text-sm font-medium text-foreground">
              Quantity
            </label>
            <input
              id="lorem-count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="h-9 w-24 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Checkbox
            id="lorem-classic"
            checked={startWithClassic}
            onChange={setStartWithClassic}
            label="Start with 'Lorem ipsum...'"
            className="pb-2"
          />
          <Button onClick={handleGenerate}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Generate
          </Button>
        </div>

        <TextPanel
          id="lorem-output"
          label="Output"
          value={output}
          readOnly
          rows={14}
          actions={<CopyButton text={output} />}
        />
      </div>
    </ToolLayout>
  );
}
