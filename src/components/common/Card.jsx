import { cn } from "../../utils/cn.js";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1 p-4 sm:p-5", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4 pt-0 sm:p-5 sm:pt-0", className)} {...props} />;
}
