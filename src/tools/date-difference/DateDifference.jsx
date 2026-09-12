import { useMemo, useState } from "react";
import { Info, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { getToolById } from "../../data/tools.js";
import { calculateDateDifference } from "./dateDifference.utils.js";

const tool = getToolById("date-difference");

function StatCard({ value, label }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3 text-center">
      <p className="text-2xl font-bold tabular-nums text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function DateDifference() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const result = useMemo(() => (start && end ? calculateDateDifference(start, end) : null), [start, end]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date-start" className="mb-1.5 block text-sm font-medium text-foreground">
              Start date
            </label>
            <input
              id="date-start"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-surface px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="date-end" className="mb-1.5 block text-sm font-medium text-foreground">
              End date
            </label>
            <input
              id="date-end"
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-surface px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => {
            setStart("");
            setEnd("");
          }}
          disabled={!start && !end}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </Button>

        {result?.success === false && <ErrorMessage title="Invalid dates" message={result.error} />}

        {result?.success && (
          <div className="flex flex-col gap-3">
            {result.reversed && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm text-primary">
                <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
                The end date was before the start date, so they were swapped automatically.
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={result.years} label="Years" />
              <StatCard value={result.months} label="Months" />
              <StatCard value={result.days} label="Days" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard value={result.totalDays} label="Total days" />
              <StatCard value={result.totalHours} label="Total hours" />
              <StatCard value={result.totalMinutes} label="Total minutes" />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
