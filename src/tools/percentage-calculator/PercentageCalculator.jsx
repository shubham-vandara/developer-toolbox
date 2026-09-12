import { useMemo, useState } from "react";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { percentChange, percentOf, whatPercent } from "./percentageCalculator.utils.js";

const tool = getToolById("percentage-calculator");

function NumberField({ id, label, value, onChange }) {
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        className="h-10 w-full rounded-md border border-input bg-surface px-3.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function ResultRow({ result, suffix = "" }) {
  const text = result.success ? `${Number(result.value.toPrecision(10))}${suffix}` : null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <p className="font-mono text-lg text-foreground">{result.success ? text : "—"}</p>
      {result.success && <CopyButton text={text} size="sm" />}
    </div>
  );
}

export default function PercentageCalculator() {
  const [percent, setPercent] = useState("25");
  const [total, setTotal] = useState("200");
  const percentOfResult = useMemo(() => percentOf(percent, total), [percent, total]);

  const [part, setPart] = useState("50");
  const [partTotal, setPartTotal] = useState("200");
  const whatPercentResult = useMemo(() => whatPercent(part, partTotal), [part, partTotal]);

  const [from, setFrom] = useState("50");
  const [to, setTo] = useState("75");
  const changeResult = useMemo(() => percentChange(from, to), [from, to]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">What is X% of Y?</h2>
          <div className="flex flex-wrap gap-3">
            <NumberField id="pct-percent" label="Percent" value={percent} onChange={setPercent} />
            <NumberField id="pct-total" label="Of" value={total} onChange={setTotal} />
          </div>
          <div className="mt-3">
            <ResultRow result={percentOfResult} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">X is what percent of Y?</h2>
          <div className="flex flex-wrap gap-3">
            <NumberField id="pct-part" label="Value" value={part} onChange={setPart} />
            <NumberField id="pct-part-total" label="Out of" value={partTotal} onChange={setPartTotal} />
          </div>
          <div className="mt-3">
            <ResultRow result={whatPercentResult} suffix="%" />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Percent change from X to Y</h2>
          <div className="flex flex-wrap gap-3">
            <NumberField id="pct-from" label="From" value={from} onChange={setFrom} />
            <NumberField id="pct-to" label="To" value={to} onChange={setTo} />
          </div>
          <div className="mt-3">
            <ResultRow result={changeResult} suffix="%" />
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
