import { cn } from "../../utils/cn.js";

// Compact label/value grid for file and result metadata.
export function FileInfo({ items, className }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {items.filter(Boolean).map((item) => (
        <div key={item.label} className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2.5">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              "mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground",
              item.tone === "success" && "text-success",
              item.tone === "warning" && "text-warning",
            )}
            title={typeof item.value === "string" ? item.value : undefined}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
