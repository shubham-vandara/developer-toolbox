import { cn } from "../../utils/cn.js";

export function TextPanel({
  id,
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 12,
  stats,
  className,
  actions,
  invalid = false,
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {actions}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={rows}
        spellCheck={false}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full resize-y rounded-lg border bg-code-background px-3.5 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          readOnly && "bg-muted/60",
          invalid ? "border-destructive/50" : "border-input",
        )}
      />
      {stats && <p className="text-xs text-muted-foreground">{stats}</p>}
    </div>
  );
}
