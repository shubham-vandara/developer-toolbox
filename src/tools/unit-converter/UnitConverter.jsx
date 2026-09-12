import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { Select } from "../../components/common/Select.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { convertUnit, UNIT_CATEGORIES } from "./unitConverter.utils.js";

const tool = getToolById("unit-converter");

function firstTwoUnitIds(category) {
  const ids = Object.keys(UNIT_CATEGORIES[category].units);
  return [ids[0], ids[1] ?? ids[0]];
}

export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [[fromUnit, toUnit], setUnits] = useState(() => firstTwoUnitIds("length"));
  const [value, setValue] = useState("1");

  const unitOptions = Object.entries(UNIT_CATEGORIES[category].units).map(([id, def]) => ({
    value: id,
    label: def.label,
  }));

  const result = useMemo(() => convertUnit(category, value, fromUnit, toUnit), [category, value, fromUnit, toUnit]);

  const handleCategoryChange = (nextCategory) => {
    setCategory(nextCategory);
    setUnits(firstTwoUnitIds(nextCategory));
  };

  const handleSwap = () => setUnits([toUnit, fromUnit]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <Select
          id="unit-category"
          label="Category"
          value={category}
          onChange={handleCategoryChange}
          options={Object.entries(UNIT_CATEGORIES).map(([id, def]) => ({ value: id, label: def.label }))}
          className="w-48"
        />

        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div>
            <label htmlFor="unit-value" className="mb-1.5 block text-sm font-medium text-foreground">
              Value
            </label>
            <input
              id="unit-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-surface px-3.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleSwap} aria-label="Swap units" className="mx-auto">
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Select
            id="unit-from"
            label="From"
            value={fromUnit}
            onChange={(v) => setUnits([v, toUnit])}
            options={unitOptions}
          />
        </div>

        <Select id="unit-to" label="To" value={toUnit} onChange={(v) => setUnits([fromUnit, v])} options={unitOptions} className="max-w-xs" />

        {result.success ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3">
            <p className="font-mono text-lg text-foreground">
              {Number(result.value.toPrecision(10)).toString()}
            </p>
            <CopyButton text={String(result.value)} />
          </div>
        ) : (
          <ErrorMessage title="Can't convert this value" message={result.error} />
        )}
      </div>
    </ToolLayout>
  );
}
