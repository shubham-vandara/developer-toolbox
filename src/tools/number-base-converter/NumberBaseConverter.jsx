import { useState } from "react";
import { Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { getToolById } from "../../data/tools.js";
import { BASES, convertFromBase } from "./numberBase.utils.js";

const tool = getToolById("number-base-converter");
const EMPTY_VALUES = { binary: "", decimal: "", octal: "", hexadecimal: "" };

export default function NumberBaseConverter() {
  const [values, setValues] = useState({ binary: "11111111", decimal: "255", octal: "377", hexadecimal: "FF" });
  const [errors, setErrors] = useState({});

  const handleChange = (id, radix, raw) => {
    if (!raw.trim()) {
      setValues(EMPTY_VALUES);
      setErrors({});
      return;
    }

    const result = convertFromBase(raw, radix);
    if (result.success) {
      setValues(result.values);
      setErrors({});
    } else {
      setValues((prev) => ({ ...prev, [id]: raw }));
      setErrors({ [id]: result.error });
    }
  };

  const handleClear = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-5">
        {BASES.map(({ id, label, radix }) => (
          <div key={id}>
            <label htmlFor={`base-${id}`} className="mb-1.5 block text-sm font-medium text-foreground">
              {label}
            </label>
            <div className="flex gap-2">
              <input
                id={`base-${id}`}
                value={values[id]}
                onChange={(event) => handleChange(id, radix, event.target.value)}
                placeholder="0"
                spellCheck={false}
                aria-invalid={Boolean(errors[id]) || undefined}
                className="h-10 flex-1 rounded-md border border-input bg-code-background px-3.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive/50"
              />
              <CopyButton text={values[id]} size="md" />
            </div>
            {errors[id] && <p className="mt-1 text-xs text-destructive">{errors[id]}</p>}
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={handleClear} className="w-fit">
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </Button>
      </div>
    </ToolLayout>
  );
}
