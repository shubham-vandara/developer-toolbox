import { useMemo, useState } from "react";
import { CheckSquare, RotateCcw, RotateCw, Square, Trash2, Undo2 } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { ProcessingIndicator } from "../common/ProcessingIndicator.jsx";
import { PdfPageGrid } from "./PdfPageGrid.jsx";
import { PdfResult } from "./PdfResult.jsx";
import { usePageSelection } from "../../hooks/usePageSelection.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { appendToFilename } from "../../utils/file.js";
import { buildFromPages, openForEdit, savePdf } from "../../utils/pdf/engine.js";
import { normalizeRotation } from "../../utils/pdf/geometry.js";
import { allPages } from "../../utils/pdf/pageRanges.js";

const initialItems = (count) => allPages(count).map((n) => ({ key: n, pageNumber: n, rotation: 0 }));

/**
 * Visual page organizer shared by "Reorder Pages" and "Rotate & Rearrange".
 * Pages can be dragged (or moved with buttons), deleted, multi-selected and,
 * when `allowRotate`, rotated individually, in bulk or all at once.
 */
export function PageOrganizer({ source, allowRotate = false, actionLabel, actionIcon: ActionIcon, outputSuffix }) {
  const [items, setItems] = useState(() => initialItems(source.pageCount));
  const keys = useMemo(() => items.map((item) => item.key), [items]);
  const selection = usePageSelection(keys);
  const task = useTask();
  const original = items.length === source.pageCount && items.every((item, i) => item.pageNumber === i + 1 && item.rotation === 0);

  const update = (next) => {
    task.reset();
    setItems(next);
  };
  const move = (from, to) =>
    update(((next) => {
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    })([...items]));
  const rotate = (predicate, delta) =>
    update(items.map((item) => (predicate(item) ? { ...item, rotation: normalizeRotation(item.rotation + delta) } : item)));
  const remove = (predicate) => {
    update(items.filter((item) => !predicate(item)));
    selection.clear();
  };
  const reset = () => {
    update(initialItems(source.pageCount));
    selection.clear();
  };

  const exportPdf = () =>
    task.run(async (report) => {
      report(0, 0, "Building PDF…");
      const doc = await openForEdit(source.bytes);
      const out = await buildFromPages(
        doc,
        items.map((item) => item.pageNumber),
        (page, index, { degrees }) => {
          const extra = items[index].rotation;
          if (extra) page.setRotation(degrees(normalizeRotation(page.getRotation().angle + extra)));
        },
      );
      return { blob: await savePdf(out), pages: items.length, rotated: items.filter((i) => i.rotation).length };
    });

  const selectedCount = selection.list.length;
  const isSelected = (item) => selection.selected.has(item.key);

  return (
    <div className="flex flex-col gap-5">
      <div className="sticky top-16 z-10 flex flex-col gap-3 rounded-lg border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={selectedCount === items.length ? selection.clear : selection.selectAll} disabled={!items.length}>
            {selectedCount === items.length && items.length ? <Square className="h-3.5 w-3.5" aria-hidden="true" /> : <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />}
            {selectedCount === items.length && items.length ? "Deselect all" : "Select all"}
          </Button>
          {allowRotate && (
            <>
              <Button variant="outline" size="sm" onClick={() => rotate(isSelected, -90)} disabled={!selectedCount}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Rotate selected left
              </Button>
              <Button variant="outline" size="sm" onClick={() => rotate(isSelected, 90)} disabled={!selectedCount}>
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                Rotate selected right
              </Button>
              <Button variant="outline" size="sm" onClick={() => rotate(() => true, 90)} disabled={!items.length}>
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                Rotate all
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => remove(isSelected)} disabled={!selectedCount || selectedCount === items.length}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete selected{selectedCount ? ` (${selectedCount})` : ""}
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} disabled={original}>
            <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={exportPdf} disabled={!items.length || task.isRunning} size="md">
            {ActionIcon && <ActionIcon className="h-4 w-4" aria-hidden="true" />}
            {actionLabel}
          </Button>
          <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={items.map((i) => i.pageNumber).join(" → ")}>
            New order ({items.length} page{items.length === 1 ? "" : "s"}): {items.slice(0, 30).map((i) => i.pageNumber).join(" → ")}
            {items.length > 30 ? " → …" : ""}
          </p>
          {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress)} />}
        </div>
      </div>

      {task.status === "error" && <ErrorMessage title="Couldn't create the PDF" message={task.error} />}
      {task.status === "done" && (
        <PdfResult
          blob={task.result.blob}
          filename={appendToFilename(source.file.name, outputSuffix, "pdf")}
          items={[
            { label: "Pages", value: String(task.result.pages) },
            ...(allowRotate ? [{ label: "Pages rotated", value: String(task.result.rotated) }] : []),
          ]}
          onReset={task.reset}
          resetLabel="Keep editing"
        />
      )}

      <p className="text-sm text-muted-foreground">
        Drag pages to reorder, or use the ‹ › buttons. Click a page to select it (Shift+click for a range).
      </p>
      <PdfPageGrid
        doc={source.doc}
        items={items}
        selectable
        selected={selection.selected}
        onToggle={selection.toggle}
        reorderable
        onMove={move}
        getLabel={(item, index) => `#${index + 1} · page ${item.pageNumber}${item.rotation ? ` · ${item.rotation}°` : ""}`}
        renderActions={(item) => (
          <>
            {allowRotate && (
              <>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => rotate((i) => i.key === item.key, -90)} aria-label={`Rotate page ${item.pageNumber} left`}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => rotate((i) => i.key === item.key, 90)} aria-label={`Rotate page ${item.pageNumber} right`}>
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8"
              onClick={() => remove((i) => i.key === item.key)}
              disabled={items.length === 1}
              aria-label={`Delete page ${item.pageNumber}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        )}
      />
    </div>
  );
}
