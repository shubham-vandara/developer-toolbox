import { cn } from "../../utils/cn.js";

// Inline "working…" status for in-place processing (vs. the page-level LoadingSpinner).
export function ProcessingIndicator({ label = "Processing…", className }) {
  return (
    <div role="status" className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
      {label}
    </div>
  );
}
