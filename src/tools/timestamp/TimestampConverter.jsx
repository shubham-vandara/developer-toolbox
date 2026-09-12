import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Clock, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import {
  formatLocal,
  formatUTC,
  nowSeconds,
  parseDateInput,
  parseTimestamp,
  toUnixMilliseconds,
  toUnixSeconds,
} from "./timestamp.utils.js";

const tool = getToolById("timestamp");

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-mono text-sm text-foreground">{value}</p>
      </div>
      <CopyButton text={String(value)} size="sm" variant="ghost" />
    </div>
  );
}

function ResultsCard({ date }) {
  if (!date) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-4">
      <ResultRow label="Unix seconds" value={toUnixSeconds(date)} />
      <ResultRow label="Unix milliseconds" value={toUnixMilliseconds(date)} />
      <ResultRow label="Local time" value={formatLocal(date)} />
      <ResultRow label="UTC time" value={formatUTC(date)} />
    </div>
  );
}

export default function TimestampConverter() {
  const [mode, setMode] = useState("to-date");

  const [timestampInput, setTimestampInput] = useState("");
  const [unit, setUnit] = useState("seconds");
  const [timestampResult, setTimestampResult] = useState(null);
  const [timestampError, setTimestampError] = useState(null);

  const [dateInput, setDateInput] = useState("");
  const [dateResult, setDateResult] = useState(null);
  const [dateError, setDateError] = useState(null);

  const handleConvertTimestamp = (value = timestampInput, targetUnit = unit) => {
    if (!value.trim()) {
      setTimestampResult(null);
      setTimestampError(null);
      return;
    }
    const result = parseTimestamp(value, targetUnit);
    if (result.success) {
      setTimestampResult(result.date);
      setTimestampError(null);
    } else {
      setTimestampResult(null);
      setTimestampError(result.error);
    }
  };

  const handleConvertDate = (value = dateInput) => {
    if (!value.trim()) {
      setDateResult(null);
      setDateError(null);
      return;
    }
    const result = parseDateInput(value);
    if (result.success) {
      setDateResult(result.date);
      setDateError(null);
    } else {
      setDateResult(null);
      setDateError(result.error);
    }
  };

  const useCurrentTimestamp = () => {
    const seconds = String(nowSeconds());
    setUnit("seconds");
    setTimestampInput(seconds);
    handleConvertTimestamp(seconds, "seconds");
  };

  const useCurrentDate = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    setDateInput(local);
    handleConvertDate(local);
  };

  return (
    <ToolLayout tool={tool}>
      <Tabs.Root value={mode} onValueChange={setMode} className="flex flex-col gap-6">
        <Tabs.List className="inline-flex w-fit rounded-lg border border-border bg-muted p-1" aria-label="Conversion direction">
          <Tabs.Trigger
            value="to-date"
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              mode === "to-date" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Timestamp → Date
          </Tabs.Trigger>
          <Tabs.Trigger
            value="to-timestamp"
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              mode === "to-timestamp" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            Date → Timestamp
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="to-date" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="timestamp-input" className="mb-1.5 block text-sm font-medium text-foreground">
                Unix timestamp
              </label>
              <input
                id="timestamp-input"
                value={timestampInput}
                onChange={(event) => {
                  setTimestampInput(event.target.value);
                  handleConvertTimestamp(event.target.value, unit);
                }}
                placeholder={unit === "seconds" ? "1700000000" : "1700000000000"}
                className="h-9 w-full rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="timestamp-unit" className="mb-1.5 block text-sm font-medium text-foreground">
                Unit
              </label>
              <select
                id="timestamp-unit"
                value={unit}
                onChange={(event) => {
                  setUnit(event.target.value);
                  handleConvertTimestamp(timestampInput, event.target.value);
                }}
                className="h-9 rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="seconds">Seconds</option>
                <option value="milliseconds">Milliseconds</option>
              </select>
            </div>

            <Button variant="outline" size="md" onClick={useCurrentTimestamp}>
              <Clock className="h-4 w-4" aria-hidden="true" />
              Current timestamp
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setTimestampInput("");
                setTimestampResult(null);
                setTimestampError(null);
              }}
              disabled={!timestampInput}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          </div>

          {timestampError ? (
            <ErrorMessage title="Invalid timestamp" message={timestampError} />
          ) : (
            <ResultsCard date={timestampResult} />
          )}
        </Tabs.Content>

        <Tabs.Content value="to-timestamp" className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[240px]">
              <label htmlFor="date-input" className="mb-1.5 block text-sm font-medium text-foreground">
                Date &amp; time
              </label>
              <input
                id="date-input"
                type="datetime-local"
                step="1"
                value={dateInput}
                onChange={(event) => {
                  setDateInput(event.target.value);
                  handleConvertDate(event.target.value);
                }}
                className="h-9 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button variant="outline" size="md" onClick={useCurrentDate}>
              <Clock className="h-4 w-4" aria-hidden="true" />
              Use now
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                setDateInput("");
                setDateResult(null);
                setDateError(null);
              }}
              disabled={!dateInput}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear
            </Button>
          </div>

          {dateError ? (
            <ErrorMessage title="Invalid date" message={dateError} />
          ) : (
            <ResultsCard date={dateResult} />
          )}
        </Tabs.Content>
      </Tabs.Root>
    </ToolLayout>
  );
}
