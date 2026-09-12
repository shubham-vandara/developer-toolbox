import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { Select } from "../../components/common/Select.jsx";
import { getToolById } from "../../data/tools.js";
import { slugify } from "./slugify.utils.js";

const tool = getToolById("slug-generator");

export default function SlugGenerator() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);

  const output = useMemo(() => slugify(input, { separator, lowercase }), [input, separator, lowercase]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <TextPanel
          id="slug-input"
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Type or paste a title..."
          rows={4}
          stats={`${input.length.toLocaleString()} characters`}
          actions={
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          }
        />

        <div className="flex flex-wrap items-end gap-3">
          <Select
            id="slug-separator"
            label="Separator"
            value={separator}
            onChange={setSeparator}
            options={[
              { value: "-", label: "Hyphen (-)" },
              { value: "_", label: "Underscore (_)" },
            ]}
            className="w-44"
          />
          <Checkbox id="slug-lowercase" checked={lowercase} onChange={setLowercase} label="Lowercase" className="pb-2" />
        </div>

        <TextPanel
          id="slug-output"
          label="Slug"
          value={output}
          readOnly
          rows={2}
          stats={`${output.length.toLocaleString()} characters`}
          actions={<CopyButton text={output} />}
        />
      </div>
    </ToolLayout>
  );
}
