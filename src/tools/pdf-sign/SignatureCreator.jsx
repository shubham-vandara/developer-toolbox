import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "../../components/common/Button.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { FileDropZone } from "../../components/common/FileDropZone.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { cn } from "../../utils/cn.js";
import { canvasToBlob, detectImageMime, releaseCanvas } from "../../utils/image.js";
import { alphaBounds, INK_COLORS, removeWhiteBackground, SIGNATURE_FONTS } from "./pdfSign.utils.js";

// Crop a canvas to its visible ink and return PNG bytes + aspect ratio.
async function trimToPng(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const box = alphaBounds(data, canvas.width, canvas.height);
  if (!box) return null;
  const pad = 4;
  const out = document.createElement("canvas");
  out.width = box.width + pad * 2;
  out.height = box.height + pad * 2;
  out.getContext("2d").drawImage(canvas, box.x, box.y, box.width, box.height, pad, pad, box.width, box.height);
  const blob = await canvasToBlob(out, "image/png");
  const result = { bytes: new Uint8Array(await blob.arrayBuffer()), ratio: out.height / out.width };
  releaseCanvas(out);
  return result;
}

function DrawPad({ color, onChange }) {
  const canvasRef = useRef(null);
  const last = useRef(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
  }, []);

  const point = (event) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  };

  const down = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    last.current = { ...point(event), mid: null };
  };
  const move = (event) => {
    if (!last.current) return;
    const p = point(event);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = event.pointerType === "pen" && event.pressure ? 1.5 + event.pressure * 2.5 : 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Smooth with quadratic curves through midpoints.
    const mid = { x: (last.current.x + p.x) / 2, y: (last.current.y + p.y) / 2 };
    ctx.beginPath();
    ctx.moveTo(last.current.mid?.x ?? last.current.x, last.current.mid?.y ?? last.current.y);
    ctx.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    ctx.stroke();
    last.current = { ...p, mid };
    if (empty) setEmpty(false);
  };
  const up = () => {
    if (!last.current) return;
    last.current = null;
    onChange(canvasRef.current);
  };
  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="h-44 w-full touch-none rounded-lg border-2 border-dashed border-border bg-white"
          aria-label="Signature drawing area. Draw with a mouse, finger or stylus."
          role="img"
        />
        {empty && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-400">Sign here</span>}
        <span className="pointer-events-none absolute right-6 bottom-8 left-6 border-b border-neutral-300" aria-hidden="true" />
      </div>
      <Button variant="ghost" size="sm" className="self-start" onClick={clear} disabled={empty}>
        <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
        Clear
      </Button>
    </div>
  );
}

/**
 * Create a signature by drawing, typing or uploading. Calls onReady with
 * { bytes (PNG), ratio } or null when there is no usable signature.
 */
export function SignatureCreator({ onReady }) {
  const [method, setMethod] = useState("draw");
  const [color, setColor] = useState(INK_COLORS[0].value);
  const [typed, setTyped] = useState("");
  const [font, setFont] = useState("script");
  const [removeWhite, setRemoveWhite] = useState(true);
  const [upload, setUpload] = useState(null);
  const [error, setError] = useState(null);

  const fromTyped = async (text, fontKey, ink) => {
    if (!text.trim()) return onReady(null);
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    const css = SIGNATURE_FONTS.find((f) => f.value === fontKey).css;
    ctx.font = `${css.startsWith("italic") ? "italic " : ""}160px ${css.replace(/^italic /, "")}`;
    ctx.fillStyle = ink;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 40, 200, 1520);
    onReady(await trimToPng(canvas));
    releaseCanvas(canvas);
  };

  const fromUpload = async (file, clearWhite) => {
    setError(null);
    const head = new Uint8Array(await file.slice(0, 64).arrayBuffer());
    if (!["image/png", "image/jpeg", "image/webp"].includes(detectImageMime(head))) {
      setError("Choose a PNG, JPEG or WebP image of your signature.");
      return onReady(null);
    }
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1600 / bitmap.width);
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    if (clearWhite) {
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      removeWhiteBackground(pixels.data);
      ctx.putImageData(pixels, 0, 0);
    }
    const result = await trimToPng(canvas);
    releaseCanvas(canvas);
    if (!result) setError("No signature was found in that image.");
    onReady(result);
  };

  const switchMethod = (value) => {
    setMethod(value);
    setError(null);
    onReady(null);
    if (value === "type") fromTyped(typed, font, color);
    if (value === "upload" && upload) fromUpload(upload, removeWhite);
  };

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl value={method} onChange={switchMethod} size="sm" options={[
        { value: "draw", label: "Draw" },
        { value: "type", label: "Type" },
        { value: "upload", label: "Upload image" },
      ]} />
      {method !== "upload" && (
        <div role="group" aria-label="Ink color" className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ink</span>
          {INK_COLORS.map((ink) => (
            <button key={ink.value} type="button" aria-label={ink.label} aria-pressed={color === ink.value}
              onClick={() => { setColor(ink.value); if (method === "type") fromTyped(typed, font, ink.value); }}
              className={cn("h-7 w-7 rounded-full border-2", color === ink.value ? "border-primary ring-2 ring-primary/30" : "border-transparent")}
              style={{ background: ink.value }} />
          ))}
        </div>
      )}
      {method === "draw" && (
        <DrawPad color={color} onChange={async (canvas) => onReady(canvas ? await trimToPng(canvas) : null)} />
      )}
      {method === "type" && (
        <>
          <div>
            <label htmlFor="sign-typed" className="mb-1.5 block text-sm font-medium text-foreground">Your name</label>
            <input id="sign-typed" value={typed} maxLength={60} onChange={(e) => { setTyped(e.target.value); fromTyped(e.target.value, font, color); }}
              className="h-9 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <SegmentedControl label="Style" value={font} onChange={(v) => { setFont(v); fromTyped(typed, v, color); }} size="sm"
            options={SIGNATURE_FONTS.map((f) => ({ value: f.value, label: f.label }))} />
          {typed && (
            <p className="truncate rounded-md border border-border bg-white px-4 py-3 text-4xl" style={{ fontFamily: SIGNATURE_FONTS.find((f) => f.value === font).css.replace(/^italic /, ""), fontStyle: font === "serif" ? "italic" : undefined, color }}>
              {typed}
            </p>
          )}
        </>
      )}
      {method === "upload" && (
        <>
          <FileDropZone onFile={(file) => { setUpload(file); fromUpload(file, removeWhite); }} accept="image/png,image/jpeg,image/webp" allowPaste={false}
            title={upload ? upload.name : "Choose a signature image"} hint="A photo or scan of your signature on white paper works well." className="py-6" />
          <Checkbox id="sign-remove-white" checked={removeWhite} onChange={(v) => { setRemoveWhite(v); if (upload) fromUpload(upload, v); }} label="Remove white background" />
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </>
      )}
    </div>
  );
}
