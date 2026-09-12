import { cn } from "../../utils/cn.js";

export function EmptyState({ icon: Icon, title, description, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
