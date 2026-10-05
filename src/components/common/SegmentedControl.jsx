import { cn } from "../../utils/cn.js";

// A small single-choice button group (e.g. units, presets, output modes).
export function SegmentedControl({ label, value, onChange, options, className, size = "md" }) {
  return (
    <div className={cn("min-w-0", className)}>
      {label && <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>}
      <div
        role="group"
        aria-label={label}
        className="inline-flex max-w-full flex-wrap gap-1 rounded-lg border border-border bg-muted p-1"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            disabled={option.disabled}
            title={option.title}
            className={cn(
              "rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              value === option.value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
