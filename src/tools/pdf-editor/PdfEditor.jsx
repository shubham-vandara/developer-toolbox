import { useCallback, useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Highlighter, ImagePlus, Info, MousePointer2, Pencil, Redo2, Save, Trash2, Type, Undo2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ColorInput } from "../../components/common/ColorInput.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { OverlayBox } from "../../components/pdf/OverlayBox.jsx";
import { PageNavigator, PdfPageView } from "../../components/pdf/PdfPageView.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useHistory } from "../../hooks/useHistory.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { cn } from "../../utils/cn.js";
import { appendToFilename } from "../../utils/file.js";
import { detectImageMime, getUserMessage } from "../../utils/image.js";
import { drawBounds, exportWithElements, FONTS, LINE_HEIGHT, textBox, translateElement } from "../../utils/pdf/annotations.js";
import { getPdfErrorMessage } from "../../utils/pdf/engine.js";
import { imageFileToEmbeddableBytes } from "../../utils/pdf/imageInputs.js";

const tool = getToolById("pdf-editor");
const MODES = [
  { value: "select", label: "Select", icon: MousePointer2 },
  { value: "text", label: "Text", icon: Type },
  { value: "image", label: "Image", icon: ImagePlus },
  { value: "draw", label: "Draw", icon: Pencil },
  { value: "highlight", label: "Highlight", icon: Highlighter },
];
// Give thin drawings a usable hit area.
const padRect = (r, pad = 0.01) => ({ x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), w: Math.min(1, r.w + pad * 2), h: Math.min(1, r.h + pad * 2) });
const errorMessage = (error) => (error?.name === "ImageToolError" ? getUserMessage(error) : getPdfErrorMessage(error));
let nextId = 0;
const newId = () => `e${++nextId}`;

function useElementWidth(ref) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

function ElementView({ el, scale }) {
  if (el.type === "text") {
    return (
      <div
        className="pointer-events-none whitespace-pre"
        style={{ fontSize: el.fontSize * scale, lineHeight: LINE_HEIGHT, color: el.color, textAlign: el.align, fontFamily: FONTS[el.font].css }}
      >
        {el.text}
      </div>
    );
  }
  if (el.type === "image") return <img src={el.url} alt="" draggable={false} className="pointer-events-none h-full w-full" style={{ opacity: el.opacity ?? 1 }} />;
  if (el.type === "highlight") return <div className="h-full w-full mix-blend-multiply" style={{ background: el.color, opacity: el.opacity }} />;
  return null;
}

function EditorWorkspace({ source }) {
  const history = useHistory({});
  const [pageNumber, setPageNumber] = useState(1);
  const [viewer, setViewer] = useState(null);
  const [mode, setMode] = useState("select");
  const [selectedId, setSelectedId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [style, setStyle] = useState({ color: "#111827", fontSize: 16, align: "left", font: "helvetica", strokeWidth: 2, highlight: "#facc15" });
  const overlayRef = useRef(null);
  const fileInputRef = useRef(null);
  const gesture = useRef(null);
  const urls = useRef(new Set());
  const overlayWidth = useElementWidth(overlayRef);
  const task = useTask({ getErrorMessage: errorMessage });
  const elements = history.present[pageNumber] ?? [];
  const selected = elements.find((e) => e.id === selectedId) ?? null;
  const scale = viewer && overlayWidth ? overlayWidth / viewer.width : 1;
  const total = Object.values(history.present).reduce((sum, list) => sum + list.length, 0);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const setPageElements = useCallback(
    (fn, method = "apply") => {
      task.reset();
      history[method]((all) => ({ ...all, [pageNumber]: fn(all[pageNumber] ?? []) }));
    },
    [history, pageNumber, task],
  );
  const updateElement = (id, patch, method = "apply") =>
    setPageElements((list) => list.map((e) => (e.id === id ? { ...e, ...(typeof patch === "function" ? patch(e) : patch) } : e)), method);
  const removeSelected = () => {
    if (!selectedId) return;
    setPageElements((list) => list.filter((e) => e.id !== selectedId));
    setSelectedId(null);
  };

  // Keep text boxes sized to their content.
  const withTextSize = (el) => (el.type === "text" && viewer ? { ...el, ...textBox(el, viewer) } : el);

  const pointFromEvent = (event) => {
    const r = overlayRef.current.getBoundingClientRect();
    return [Math.min(Math.max((event.clientX - r.left) / r.width, 0), 1), Math.min(Math.max((event.clientY - r.top) / r.height, 0), 1)];
  };

  const onOverlayPointerDown = (event) => {
    if (event.target !== event.currentTarget && mode === "select") return;
    const [x, y] = pointFromEvent(event);
    if (mode === "select") {
      setSelectedId(null);
    } else if (mode === "text") {
      const el = withTextSize({ id: newId(), type: "text", x, y, text: "Text", fontSize: style.fontSize, color: style.color, align: style.align, font: style.font });
      setPageElements((list) => [...list, el]);
      setSelectedId(el.id);
      setMode("select");
      requestAnimationFrame(() => document.getElementById("editor-text")?.select());
    } else if (mode === "draw" || mode === "highlight") {
      event.currentTarget.setPointerCapture(event.pointerId);
      const el =
        mode === "draw"
          ? { id: newId(), type: "draw", points: [[x, y]], color: style.color, width: style.strokeWidth }
          : { id: newId(), type: "highlight", x, y, w: 0, h: 0, color: style.highlight, opacity: 0.35 };
      gesture.current = { id: el.id, start: [x, y] };
      history.begin();
      setPageElements((list) => [...list, el], "preview");
    }
  };

  const onOverlayPointerMove = (event) => {
    const g = gesture.current;
    if (!g) return;
    const [x, y] = pointFromEvent(event);
    if (mode === "draw") updateElement(g.id, (e) => ({ points: [...e.points, [x, y]] }), "preview");
    else updateElement(g.id, { x: Math.min(x, g.start[0]), y: Math.min(y, g.start[1]), w: Math.abs(x - g.start[0]), h: Math.abs(y - g.start[1]) }, "preview");
  };

  const onOverlayPointerUp = () => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    // Drop accidental taps.
    setPageElements((list) => list.filter((e) => e.id !== g.id || (e.type === "draw" ? e.points.length > 1 : e.w > 0.005 && e.h > 0.003)), "preview");
    history.commit();
  };

  const addImage = async (file) => {
    setNotice(null);
    try {
      const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
      const mime = detectImageMime(head);
      if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) throw new Error("unsupported");
      const bytes = await imageFileToEmbeddableBytes(file, mime);
      const blob = new Blob([bytes], { type: bytes[0] === 0x89 ? "image/png" : "image/jpeg" });
      const url = URL.createObjectURL(blob);
      urls.current.add(url);
      const bitmap = await createImageBitmap(blob);
      const ratio = bitmap.height / bitmap.width;
      bitmap.close();
      const w = 0.3;
      const h = viewer ? (w * viewer.width * ratio) / viewer.height : w * ratio;
      const el = { id: newId(), type: "image", x: 0.35, y: 0.3, w, h: Math.min(h, 0.9), bytes, url, opacity: 1 };
      setPageElements((list) => [...list, el]);
      setSelectedId(el.id);
      setMode("select");
    } catch {
      setNotice("That image couldn't be added. Choose a PNG, JPEG or WebP image.");
    }
  };

  const onKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) history.redo();
      else history.undo();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      history.redo();
    } else if ((event.key === "Delete" || event.key === "Backspace") && selectedId && event.target.tagName !== "TEXTAREA" && event.target.tagName !== "INPUT") {
      event.preventDefault();
      removeSelected();
    }
  };

  const changeStyle = (key, value) => {
    setStyle((s) => ({ ...s, [key]: value }));
    if (!selected) return;
    const map = { color: "color", fontSize: "fontSize", align: "align", font: "font", strokeWidth: "width", highlight: "color" };
    const applies =
      (selected.type === "text" && ["color", "fontSize", "align", "font"].includes(key)) ||
      (selected.type === "draw" && ["color", "strokeWidth"].includes(key)) ||
      (selected.type === "highlight" && key === "highlight");
    if (applies) updateElement(selected.id, (e) => withTextSize({ ...e, [map[key]]: value }));
  };

  return (
    <div className="flex flex-col gap-5" onKeyDown={onKeyDown}>
      <div className="flex gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground" role="note">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <span className="font-medium text-foreground">Adds new content on top of pages</span> — text, images, drawings and highlights.
          Existing text and images in the PDF can’t be edited or removed in the browser.
        </p>
      </div>

      <div className="sticky top-16 z-10 flex flex-col gap-3 rounded-lg border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Tool" className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted p-1">
            {MODES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => (value === "image" ? fileInputRef.current?.click() : setMode(value))}
                className={cn("inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium", mode === value ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} aria-hidden="true"
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) addImage(f); }} />
          <Button variant="outline" size="icon" onClick={history.undo} disabled={!history.canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon" onClick={history.redo} disabled={!history.canRedo} aria-label="Redo" title="Redo (Ctrl+Y)">
            <Redo2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="sm" onClick={removeSelected} disabled={!selected}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </Button>
          <div className="ml-auto flex items-center gap-3">
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Saving…")} />}
            <Button onClick={() => task.run((report) => exportWithElements(source.bytes, history.present, report))} disabled={!total || task.isRunning}>
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              Save PDF
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {mode === "text" && "Click on the page where the text should go."}
          {mode === "draw" && "Drag on the page to draw."}
          {mode === "highlight" && "Drag over the area to highlight."}
          {mode === "select" && "Click an element to select it. Drag to move; drag the corner handle to resize. Arrow keys nudge, Alt+Shift+arrows resize, Delete removes."}
        </p>
      </div>

      {notice && <ErrorMessage title="Image not added" message={notice} />}
      {task.status === "error" && <ErrorMessage title="Couldn't save the PDF" message={task.error} />}
      {task.status === "done" && (
        <PdfResult blob={task.result} filename={appendToFilename(source.file.name, "-edited", "pdf")} items={[{ label: "Elements added", value: String(total) }]} onReset={task.reset} resetLabel="Keep editing" />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <section className="flex min-w-0 flex-col items-center gap-3" aria-label="Page editor">
          <PageNavigator pageNumber={pageNumber} pageCount={source.pageCount} onChange={(n) => { setPageNumber(n); setSelectedId(null); }} />
          <PdfPageView
            doc={source.doc}
            pageNumber={pageNumber}
            maxHeight={760}
            onPageInfo={(info) => setViewer(info.viewer)}
            ref={overlayRef}
            overlayProps={{
              "data-overlay-root": true,
              onPointerDown: onOverlayPointerDown,
              onPointerMove: onOverlayPointerMove,
              onPointerUp: onOverlayPointerUp,
              onPointerCancel: onOverlayPointerUp,
              className: cn("absolute inset-0 touch-none", mode === "text" && "cursor-text", (mode === "draw" || mode === "highlight") && "cursor-crosshair"),
            }}
          >
            {viewer && (
              <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                {elements.filter((e) => e.type === "draw").map((e) => (
                  <polyline key={e.id} points={e.points.map((p) => p.join(",")).join(" ")} fill="none" stroke={e.color}
                    strokeWidth={e.width * scale} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                ))}
              </svg>
            )}
            {viewer && elements.map((el) => {
              const rect = el.type === "draw" ? padRect(drawBounds(el.points)) : { x: el.x, y: el.y, w: el.w, h: el.h };
              return (
                <OverlayBox
                  key={el.id}
                  rect={rect}
                  label={`${el.type} element`}
                  selected={el.id === selectedId}
                  onSelect={() => setSelectedId(el.id)}
                  interactive={mode === "select"}
                  resizable={el.type === "image" || el.type === "highlight"}
                  keepAspect={el.type === "image"}
                  onStart={history.begin}
                  onEnd={history.commit}
                  onChange={(next) =>
                    updateElement(el.id, (e) => (e.type === "draw" ? translateElement(e, next.x - rect.x, next.y - rect.y) : { x: next.x, y: next.y, ...(e.type === "text" ? {} : { w: next.w, h: next.h }) }), "preview")
                  }
                  className={el.type === "draw" ? "bg-transparent" : undefined}
                >
                  <ElementView el={el} scale={scale} />
                </OverlayBox>
              );
            })}
          </PdfPageView>
          <p className="text-xs text-muted-foreground">{total} element{total === 1 ? "" : "s"} added across all pages.</p>
        </section>

        <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 lg:self-start" aria-label="Properties">
          <h2 className="text-sm font-semibold text-foreground">{selected ? `Selected ${selected.type}` : "Style for new elements"}</h2>
          {selected?.type === "text" && (
            <div>
              <label htmlFor="editor-text" className="mb-1.5 block text-sm font-medium text-foreground">Text</label>
              <textarea id="editor-text" rows={3} value={selected.text}
                onChange={(e) => updateElement(selected.id, (el) => withTextSize({ ...el, text: e.target.value || " " }))}
                className="w-full rounded-md border border-input bg-surface px-2.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
          )}
          {(!selected || selected.type === "text") && (
            <>
              <SegmentedControl label="Font" value={selected?.font ?? style.font} onChange={(v) => changeStyle("font", v)} size="sm"
                options={Object.entries(FONTS).map(([value, f]) => ({ value, label: f.label }))} />
              <Slider id="editor-size" label="Font size" value={selected?.fontSize ?? style.fontSize} min={6} max={96} onChange={(v) => changeStyle("fontSize", v)} valueLabel={`${selected?.fontSize ?? style.fontSize} pt`} />
              <div role="group" aria-label="Alignment" className="flex gap-1">
                {[["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]].map(([value, Icon]) => (
                  <Button key={value} variant={(selected?.align ?? style.align) === value ? "secondary" : "ghost"} size="icon" aria-pressed={(selected?.align ?? style.align) === value}
                    onClick={() => changeStyle("align", value)} aria-label={`Align ${value}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ))}
              </div>
            </>
          )}
          {(!selected || selected.type === "text" || selected.type === "draw") && (
            <ColorInput id="editor-color" label="Text & pen color" value={selected && selected.type !== "highlight" ? selected.color : style.color} onChange={(v) => changeStyle("color", v)} />
          )}
          {(!selected || selected.type === "draw") && (
            <Slider id="editor-stroke" label="Pen width" value={selected?.width ?? style.strokeWidth} min={1} max={12} onChange={(v) => changeStyle("strokeWidth", v)} valueLabel={`${selected?.width ?? style.strokeWidth} pt`} />
          )}
          {(!selected || selected.type === "highlight") && (
            <ColorInput id="editor-highlight" label="Highlight color" value={selected?.type === "highlight" ? selected.color : style.highlight} onChange={(v) => changeStyle("highlight", v)} />
          )}
          {selected?.type === "image" && (
            <Slider id="editor-opacity" label="Opacity" value={Math.round((selected.opacity ?? 1) * 100)} min={10} max={100}
              onChange={(v) => updateElement(selected.id, { opacity: v / 100 })} valueLabel={`${Math.round((selected.opacity ?? 1) * 100)}%`} />
          )}
          <p className="text-xs text-muted-foreground">Built-in PDF fonts support Latin characters only.</p>
        </aside>
      </div>
    </div>
  );
}

export default function PdfEditor() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <EditorWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
