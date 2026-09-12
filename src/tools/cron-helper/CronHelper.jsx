import { useMemo, useState } from "react";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { buildCronExpression, CRON_PRESETS, describeCronExpression } from "./cronHelper.utils.js";

const tool = getToolById("cron-helper");

const FIELDS = [
  { id: "minute", label: "Minute", placeholder: "*" },
  { id: "hour", label: "Hour", placeholder: "*" },
  { id: "dayOfMonth", label: "Day of month", placeholder: "*" },
  { id: "month", label: "Month", placeholder: "*" },
  { id: "dayOfWeek", label: "Day of week", placeholder: "*" },
];

export default function CronHelper() {
  const [fields, setFields] = useState({ minute: "0", hour: "9", dayOfMonth: "*", month: "*", dayOfWeek: "1-5" });

  const expression = useMemo(() => buildCronExpression(fields), [fields]);
  const result = useMemo(() => describeCronExpression(expression), [expression]);

  const applyPreset = (value) => {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = value.split(" ");
    setFields({ minute, hour, dayOfMonth, month, dayOfWeek });
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {CRON_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.value)}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {FIELDS.map(({ id, label, placeholder }) => (
            <div key={id}>
              <label htmlFor={`cron-${id}`} className="mb-1.5 block text-sm font-medium text-foreground">
                {label}
              </label>
              <input
                id={`cron-${id}`}
                value={fields[id]}
                onChange={(event) => setFields((prev) => ({ ...prev, [id]: event.target.value }))}
                placeholder={placeholder}
                spellCheck={false}
                className="h-10 w-full rounded-md border border-input bg-code-background px-3 text-center font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-surface px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-lg text-foreground">{expression}</p>
            <CopyButton text={expression} />
          </div>
        </div>

        {result.success ? (
          <p className="text-sm text-muted-foreground">{result.description}</p>
        ) : (
          <ErrorMessage title="Invalid cron expression" message={result.error} />
        )}

        <p className="text-xs text-muted-foreground">
          This is a reference and expression builder only — it does not schedule or execute any jobs.
        </p>
      </div>
    </ToolLayout>
  );
}
