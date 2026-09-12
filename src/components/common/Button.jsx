import { forwardRef } from "react";
import { cn } from "../../utils/cn.js";

const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/95",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/70 active:bg-secondary/80",
  outline:
    "border border-border bg-transparent hover:bg-muted active:bg-muted/70",
  ghost: "bg-transparent hover:bg-muted active:bg-muted/70",
  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
  icon: "h-9 w-9 shrink-0",
};

export const Button = forwardRef(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
});
