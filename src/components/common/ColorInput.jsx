import { cn } from "../../utils/cn.js";

export function ColorInput({ id, label, value, onChange, disabled, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-surface p-1 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="font-mono text-sm uppercase text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}
