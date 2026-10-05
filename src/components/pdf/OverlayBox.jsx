import { useRef } from "react";
import { cn } from "../../utils/cn.js";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const MIN = 0.01;

/**
 * A movable (and optionally resizable) element over a page. `rect` is in
 * fractions of the page as displayed: { x, y, w, h } with a top-left origin.
 * Mouse, touch and pen all work (Pointer Events). Keyboard: arrows move,
 * Shift = bigger steps, Alt+Shift+arrows resize. Gestures call onStart /
 * onChange / onEnd so the caller can record a single undo step per drag.
 */
export function OverlayBox({
  rect,
  onChange,
  onStart,
  onEnd,
  selected,
  onSelect,
  resizable = true,
  keepAspect = false,
  label,
  interactive = true,
  onKeyDown,
  children,
  className,
}) {
  const drag = useRef(null);

  const begin = (event, mode) => {
    if (!interactive) return;
    event.stopPropagation();
    event.preventDefault();
    onSelect?.();
    const parent = event.currentTarget.closest("[data-overlay-root]") ?? event.currentTarget.parentElement;
    const bounds = parent.getBoundingClientRect();
    drag.current = { mode, startX: event.clientX, startY: event.clientY, rect, bounds };
    event.currentTarget.setPointerCapture(event.pointerId);
    onStart?.();
  };

  const move = (event) => {
    const d = drag.current;
    if (!d) return;
    const dx = (event.clientX - d.startX) / d.bounds.width;
    const dy = (event.clientY - d.startY) / d.bounds.height;
    const r = d.rect;
    if (d.mode === "move") {
      onChange({ ...r, x: clamp(r.x + dx, 0, 1 - r.w), y: clamp(r.y + dy, 0, 1 - r.h) });
    } else {
      let w = clamp(r.w + dx, MIN, 1 - r.x);
      let h = clamp(r.h + dy, MIN, 1 - r.y);
      if (keepAspect) {
        const ratio = (r.w * d.bounds.width) / (r.h * d.bounds.height);
        h = (w * d.bounds.width) / ratio / d.bounds.height;
        if (r.y + h > 1) {
          h = 1 - r.y;
          w = (h * d.bounds.height * ratio) / d.bounds.width;
        }
      }
      onChange({ ...r, w, h });
    }
  };

  const end = () => {
    if (!drag.current) return;
    drag.current = null;
    onEnd?.();
  };

  const handleKey = (event) => {
    const step = event.shiftKey ? 0.05 : 0.005;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (delta && interactive) {
      event.preventDefault();
      onStart?.();
      if (event.altKey && resizable) {
        const w = clamp(rect.w + delta[0], MIN, 1 - rect.x);
        const h = keepAspect ? (w / rect.w) * rect.h : clamp(rect.h + delta[1], MIN, 1 - rect.y);
        onChange({ ...rect, w, h: Math.min(h, 1 - rect.y) });
      } else {
        onChange({ ...rect, x: clamp(rect.x + delta[0], 0, 1 - rect.w), y: clamp(rect.y + delta[1], 0, 1 - rect.h) });
      }
      onEnd?.();
      return;
    }
    onKeyDown?.(event);
  };

  return (
    <div
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-label={label}
      aria-pressed={selected}
      onPointerDown={(event) => begin(event, "move")}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={handleKey}
      onFocus={() => interactive && onSelect?.()}
      className={cn(
        "absolute touch-none select-none outline-none",
        interactive && "cursor-move",
        selected ? "ring-2 ring-primary ring-offset-1" : interactive && "hover:ring-1 hover:ring-primary/60",
        className,
      )}
      style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${rect.h * 100}%`, pointerEvents: interactive ? "auto" : "none" }}
    >
      {children}
      {selected && resizable && interactive && (
        <span
          onPointerDown={(event) => begin(event, "resize")}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          className="absolute -right-2.5 -bottom-2.5 flex h-5 w-5 cursor-nwse-resize items-center justify-center"
          aria-hidden="true"
        >
          <span className="h-3 w-3 rounded-sm border border-primary bg-white shadow" />
        </span>
      )}
    </div>
  );
}
