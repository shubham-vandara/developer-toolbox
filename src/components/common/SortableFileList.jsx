import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, X } from "lucide-react";
import { Button } from "./Button.jsx";
import { cn } from "../../utils/cn.js";

/**
 * Reorderable list of files. Drag rows on desktop, or use the up/down buttons
 * (keyboard and touch friendly). renderItem(item, index) draws the row body.
 */
export function SortableFileList({ items, onMove, onRemove, renderItem, label = "Files" }) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  return (
    <ol className="flex flex-col gap-2" aria-label={`${label}. Drag to reorder, or use the move buttons.`}>
      {items.map((item, index) => (
        <li
          key={item.id}
          draggable
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
          onDrop={(event) => {
            event.preventDefault();
            if (dragIndex !== null && dragIndex !== index) onMove(dragIndex, index);
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-lg border bg-surface p-2 sm:gap-3",
            item.status === "error" ? "border-destructive/40" : "border-border",
            dragIndex === index && "opacity-40",
            overIndex === index && dragIndex !== index && "border-dashed border-primary",
          )}
        >
          <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-muted-foreground sm:block" aria-hidden="true" />
          <span className="w-6 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
          <div className="min-w-0 flex-1">{renderItem(item, index)}</div>
          <div className="flex shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Move ${item.file.name} up`}>
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={index === items.length - 1}
              onClick={() => onMove(index, index + 1)}
              aria-label={`Move ${item.file.name} down`}
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.file.name}`}>
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}
