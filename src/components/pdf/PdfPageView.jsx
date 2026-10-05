import { forwardRef, useEffect, useRef, useState } from "react";
import { getPageBox, renderPage } from "../../utils/pdf/engine.js";
import { getViewerSize } from "../../utils/pdf/geometry.js";
import { releaseCanvas } from "../../utils/image.js";
import { cn } from "../../utils/cn.js";

/**
 * One PDF page rendered to fit its container, with an overlay layer on top.
 * Overlay children are positioned in % of the page as displayed (viewer space).
 * onPageInfo receives { box, viewer } — the page's crop box/rotation and its
 * displayed size in points — so tools can map overlay positions to PDF space.
 */
export const PdfPageView = forwardRef(function PdfPageView(
  { doc, pageNumber, maxHeight = 640, onPageInfo, children, className, overlayProps },
  overlayRef,
) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState("loading");
  const onPageInfoRef = useRef(onPageInfo);
  useEffect(() => {
    onPageInfoRef.current = onPageInfo;
  });

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return undefined;
    let frame = 0;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(Math.floor(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const box = getPageBox(page);
      const next = { box, viewer: getViewerSize(box) };
      setInfo(next);
      onPageInfoRef.current?.(next);
    });
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber]);

  const aspect = info ? info.viewer.width / info.viewer.height : 0.75;
  const displayWidth = Math.max(1, Math.min(width, Math.floor(maxHeight * aspect)));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!info || !width || !canvas) return undefined;
    let cancelled = false;
    let task = null;
    setStatus("loading");
    doc.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      task = renderPage(page, canvas, { targetWidth: displayWidth });
      task.promise.then(
        () => !cancelled && setStatus("done"),
        (error) => !cancelled && error?.name !== "RenderingCancelledException" && setStatus("error"),
      );
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, info, width, displayWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    return () => releaseCanvas(canvas);
  }, []);

  return (
    <div ref={wrapperRef} className={cn("flex w-full justify-center", className)}>
      <div className="relative bg-white shadow-sm ring-1 ring-border" style={{ width: displayWidth, aspectRatio: aspect }}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        {status !== "done" && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
            {status === "error" ? "This page couldn't be displayed." : "Rendering page…"}
          </span>
        )}
        <div ref={overlayRef} className="absolute inset-0" {...overlayProps}>
          {info && children}
        </div>
      </div>
    </div>
  );
});

export function PageNavigator({ pageNumber, pageCount, onChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        className="rounded-md border border-border px-2.5 py-1 hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(pageNumber - 1)}
        disabled={pageNumber <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>
      <label className="flex items-center gap-1.5 text-muted-foreground">
        Page
        <input
          type="number"
          min={1}
          max={pageCount}
          value={pageNumber}
          onChange={(event) => {
            const n = Number(event.target.value);
            if (n >= 1 && n <= pageCount) onChange(n);
          }}
          className="h-8 w-16 rounded-md border border-input bg-surface px-2 text-center tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Page number"
        />
        of {pageCount}
      </label>
      <button
        type="button"
        className="rounded-md border border-border px-2.5 py-1 hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(pageNumber + 1)}
        disabled={pageNumber >= pageCount}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
