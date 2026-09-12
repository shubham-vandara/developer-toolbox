import { useMemo, useState } from "react";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { formatHsl, formatRgb, parseColor } from "./colorConverter.utils.js";

const tool = getToolById("color-converter");

function ResultField({ label, value }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          className="h-10 flex-1 rounded-md border border-input bg-code-background px-3.5 font-mono text-sm text-foreground"
        />
        <CopyButton text={value} size="md" />
      </div>
    </div>
  );
}

export default function ColorConverter() {
  const [input, setInput] = useState("#3498db");
  const result = useMemo(() => parseColor(input), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="color-input" className="mb-1.5 block text-sm font-medium text-foreground">
              Color value
            </label>
            <input
              id="color-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="#3498db, rgb(52, 152, 219), hsl(204, 70%, 53%)..."
              spellCheck={false}
              className="h-10 w-full rounded-md border border-input bg-surface px-3.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="color-picker" className="mb-1.5 block text-sm font-medium text-foreground">
              Picker
            </label>
            <input
              id="color-picker"
              type="color"
              value={result.success ? result.hex : "#3498db"}
              onChange={(event) => setInput(event.target.value)}
              className="h-10 w-14 cursor-pointer rounded-md border border-input bg-surface p-1"
            />
          </div>
        </div>

        {result.success ? (
          <>
            <div
              className="h-24 w-full rounded-lg border border-border"
              style={{ backgroundColor: result.hex }}
              role="img"
              aria-label={`Color preview: ${result.hex}`}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ResultField label="HEX" value={result.hex} />
              <ResultField label="RGB" value={formatRgb(result.rgb)} />
              <ResultField label="HSL" value={formatHsl(result.hsl)} />
            </div>
          </>
        ) : (
          <ErrorMessage title="Invalid color" message={result.error} />
        )}
      </div>
    </ToolLayout>
  );
}
