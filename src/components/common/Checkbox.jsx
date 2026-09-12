import { Check } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function Checkbox({ id, checked, onChange, label, className }) {
  return (
    <label
      htmlFor={id}
      className={cn("flex cursor-pointer select-none items-center gap-2 text-sm text-foreground", className)}
    >
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer h-4 w-4 shrink-0 appearance-none rounded border border-input bg-surface checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <Check
          className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100"
          aria-hidden="true"
        />
      </span>
      {label}
    </label>
  );
}
