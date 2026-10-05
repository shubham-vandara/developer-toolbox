import { memo, useEffect, useRef, useState } from "react";
import { renderPage } from "../../utils/pdf/engine.js";
import { releaseCanvas } from "../../utils/image.js";
import { cn } from "../../utils/cn.js";

// At most two thumbnails render at once, so long documents don't spike CPU/memory.
const MAX_CONCURRENT = 2;
let active = 0;
const waiting = [];

function schedule(job) {
  return new Promise((resolve, reject) => {
    const run = () => {
      active += 1;
      job()
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          waiting.shift()?.();
        });
    };
    if (active < MAX_CONCURRENT) run();
    else waiting.push(run);
  });
}

/**
 * Lazily rendered page thumbnail. It renders only while near the viewport and
 * frees its canvas when scrolled far away, so documents with hundreds of pages
 * never keep every page rendered in memory.
 */
export const PdfThumbnail = memo(function PdfThumbnail({ doc, pageNumber, rotation = 0, width = 180, className, alt }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | rendering | done | error
  const [aspect, setAspect] = useState(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "800px 0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!visible || !canvas) return undefined;
    let cancelled = false;
    let task = null;
    setStatus("rendering");
    schedule(async () => {
      if (cancelled) return;
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const viewport = page.getViewport({ scale: 1, rotation: page.rotate + rotation });
      setAspect(viewport.width / viewport.height);
      task = renderPage(page, canvas, { targetWidth: width, rotation });
      await task.promise;
    })
      .then(() => !cancelled && setStatus("done"))
      .catch((error) => {
        if (!cancelled && error?.name !== "RenderingCancelledException") setStatus("error");
      });
    return () => {
      cancelled = true;
      task?.cancel();
      // Free the bitmap once off-screen; it re-renders when scrolled back.
      releaseCanvas(canvas);
      setStatus("idle");
    };
  }, [visible, doc, pageNumber, rotation, width]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex w-full items-center justify-center overflow-hidden rounded bg-white", className)}
      style={{ aspectRatio: aspect ?? 0.75 }}
    >
      {/* 0×0 until rendered: an unsized canvas would allocate a default 300×150 bitmap. */}
      <canvas
        ref={canvasRef}
        width={0}
        height={0}
        role="img"
        aria-label={alt ?? `Page ${pageNumber}`}
        className={cn("block h-full w-full object-contain", status !== "done" && "invisible")}
      />
      {status !== "done" && (
        <span className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500" aria-hidden="true">
          {status === "error" ? "Preview unavailable" : <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-500" />}
        </span>
      )}
    </div>
  );
});
