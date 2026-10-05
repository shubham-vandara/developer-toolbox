import { cn } from "../../utils/cn.js";

// Image shown on a checkerboard so transparency is visible; always fits its box.
export function ImagePreview({ src, alt, label, className, imageClassName, children, ...props }) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-2", className)}>
      {label && <figcaption className="text-sm font-medium text-foreground">{label}</figcaption>}
      <div className="bg-checkerboard relative flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-border p-2">
        {src && (
          <img
            src={src}
            alt={alt}
            className={cn("max-h-104 max-w-full object-contain", imageClassName)}
            {...props}
          />
        )}
        {children}
      </div>
    </figure>
  );
}
