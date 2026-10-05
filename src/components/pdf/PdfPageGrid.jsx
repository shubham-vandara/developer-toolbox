import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { cn } from "../../utils/cn.js";
import { PdfThumbnail } from "./PdfThumbnail.jsx";

/**
 * Grid of page thumbnails used by every page-level PDF tool.
 *
 * items: [{ key, pageNumber, rotation? }] — `pageNumber` is the 1-based page in the source PDF.
 * selectable: click a card (or Space/Enter) to toggle `selected` (a Set of keys).
 * reorderable: drag cards, or use the ← → buttons (keyboard/touch alternative).
 * renderActions(item, index): extra per-page controls (rotate, delete…).
 */
export function PdfPageGrid({
  doc,
  items,
  selectable = false,
  selected,
  onToggle,
  reorderable = false,
  onMove,
  renderActions,
  getLabel = (item, index) => `Page ${item.pageNumber}${reorderable && index + 1 !== item.pageNumber ? ` · #${index + 1}` : ""}`,
  getTone,
}) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      aria-label={reorderable ? "Pages. Drag to reorder, or use the move buttons." : "Pages"}
    >
      {items.map((item, index) => {
        const isSelected = selectable && selected?.has(item.key);
        const tone = getTone?.(item, index);
        return (
          <li
            key={item.key}
            draggable={reorderable}
            onDragStart={(event) => {
              setDragIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(index));
            }}
            onDragOver={(event) => {
              if (dragIndex === null) return;
              event.preventDefault();
              setOverIndex(index);
            }}
            onDragLeave={() => setOverIndex((current) => (current === index ? null : current))}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex !== null && dragIndex !== index) onMove?.(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              "flex min-w-0 flex-col gap-2 rounded-lg border bg-surface p-2 transition-colors",
              isSelected ? "border-primary ring-2 ring-primary/30" : "border-border",
              tone === "muted" && "opacity-50",
              dragIndex === index && "opacity-40",
              overIndex === index && dragIndex !== index && "border-primary border-dashed",
              reorderable && "cursor-grab active:cursor-grabbing",
            )}
          >
            <div
              className={cn("relative", selectable && "cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}
              {...(selectable
                ? {
                    role: "checkbox",
                    tabIndex: 0,
                    "aria-checked": Boolean(isSelected),
                    "aria-label": `Select page ${item.pageNumber}`,
                    onClick: (event) => onToggle?.(item.key, event),
                    onKeyDown: (event) => {
                      if (event.key === " " || event.key === "Enter") {
                        event.preventDefault();
                        onToggle?.(item.key, event);
                      }
                    },
                  }
                : {})}
            >
              <PdfThumbnail doc={doc} pageNumber={item.pageNumber} rotation={item.rotation ?? 0} className="border border-border" />
              {selectable && (
                <span
                  className={cn(
                    "absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded border shadow-sm",
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-neutral-400 bg-white/90",
                  )}
                  aria-hidden="true"
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-xs font-medium text-foreground">{getLabel(item, index)}</span>
              {reorderable && (
                <span className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === 0}
                    onClick={() => onMove?.(index, index - 1)}
                    aria-label={`Move page ${item.pageNumber} earlier`}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === items.length - 1}
                    onClick={() => onMove?.(index, index + 1)}
                    aria-label={`Move page ${item.pageNumber} later`}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </span>
              )}
            </div>
            {renderActions && <div className="flex flex-wrap items-center gap-1">{renderActions(item, index)}</div>}
          </li>
        );
      })}
    </ul>
  );
}
