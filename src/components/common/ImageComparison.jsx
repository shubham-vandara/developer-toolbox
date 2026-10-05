import { useState } from "react";
import { cn } from "../../utils/cn.js";

// Before/after slider. Both images share the same box so they line up exactly;
// a transparent range input on top makes it work with mouse, touch and keyboard.
export function ImageComparison({
  beforeSrc,
  afterSrc,
  beforeLabel = "Before",
  afterLabel = "After",
  width,
  height,
  className,
}) {
  const [position, setPosition] = useState(50);

  return (
    <div
      className={cn("bg-checkerboard relative max-h-112 w-full overflow-hidden rounded-lg border border-border", className)}
      style={{ aspectRatio: width && height ? `${width} / ${height}` : "4 / 3" }}
    >
      <img src={beforeSrc} alt={beforeLabel} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        draggable={false}
      />
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary shadow"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <span className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface shadow-md" />
      </div>
      <span className="pointer-events-none absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {afterLabel}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Comparison divider: ${beforeLabel} on the left, ${afterLabel} on the right`}
        aria-valuetext={`${Math.round(position)}%`}
        className="peer absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-lg ring-ring peer-focus-visible:ring-2"
        aria-hidden="true"
      />
    </div>
  );
}
