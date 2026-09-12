import { AlertCircle } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function ErrorMessage({ title = "Invalid input", message, detail, className }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium text-destructive">{title}</p>
        {message && <p className="text-destructive/90">{message}</p>}
        {detail && <p className="text-muted-foreground">{detail}</p>}
      </div>
    </div>
  );
}
