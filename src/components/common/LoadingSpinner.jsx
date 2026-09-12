import { cn } from "../../utils/cn.js";

export function LoadingSpinner({ label = "Loading", className }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
        role="status"
        aria-label={label}
      />
    </div>
  );
}
