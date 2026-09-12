import { useState } from "react";
import { Fingerprint, RefreshCw, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { generateUuids } from "./uuid.utils.js";

const tool = getToolById("uuid-generator");
const QUANTITY_OPTIONS = [1, 5, 10, 25, 50, 100];

export default function UuidGenerator() {
  const [quantity, setQuantity] = useState(5);
  const [uuids, setUuids] = useState(() => generateUuids(5));

  const handleGenerate = () => setUuids(generateUuids(quantity));
  const handleClear = () => setUuids([]);

  const allText = uuids.join("\n");

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="uuid-quantity" className="mb-1.5 block text-sm font-medium text-foreground">
              Quantity
            </label>
            <select
              id="uuid-quantity"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {QUANTITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleGenerate} size="md">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Generate
          </Button>

          {uuids.length > 0 && (
            <>
              <CopyButton text={allText} label="Copy all" />
              <Button variant="outline" size="md" onClick={handleClear}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </>
          )}
        </div>

        {uuids.length === 0 ? (
          <EmptyState
            icon={Fingerprint}
            title="No UUIDs yet"
            description="Choose a quantity and click Generate to create UUIDs."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {uuids.map((id, index) => (
              <li key={`${id}-${index}`} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <code className="truncate font-mono text-sm text-foreground">{id}</code>
                <CopyButton text={id} size="sm" variant="ghost" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  );
}
