import { useCallback, useEffect, useRef, useState } from "react";
import { Pipette, Trash2, X } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { cn } from "../../utils/cn.js";
import { createCanvas, getUserMessage, releaseCanvas } from "../../utils/image.js";
import { addToHistory, MAGNIFIER_PIXELS, pixelToColor, readableTextColor, toImagePoint } from "./imageColorPicker.utils.js";

const tool = getToolById("image-color-picker");
// Keep the sampling canvas within what every browser (incl. iOS Safari) allows.
const MAX_SAMPLE_PIXELS = 16_000_000;
const MAGNIFIER_SIZE = 132;

function useSampler(source) {
  const samplerRef = useRef(null);
  const [error, setError] = useState(null);
  const [downscaled, setDownscaled] = useState(false);

  useEffect(() => {
    let sampler = null;
    try {
      const scale = Math.min(1, Math.sqrt(MAX_SAMPLE_PIXELS / (source.width * source.height)));
      const width = Math.max(1, Math.floor(source.width * scale));
      const height = Math.max(1, Math.floor(source.height * scale));
      const { canvas } = createCanvas(width, height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingEnabled = false; // keep real pixel values, never blends
      ctx.drawImage(source.image, 0, 0, width, height);
      sampler = { canvas, ctx, width, height };
      samplerRef.current = sampler;
      setDownscaled(scale < 1);
    } catch (err) {
      setError(getUserMessage(err, "This image couldn't be prepared for color picking."));
    }
    return () => {
      samplerRef.current = null;
      releaseCanvas(sampler?.canvas);
    };
  }, [source.image, source.width, source.height]);

  const sample = useCallback(
    (point) => {
      const sampler = samplerRef.current;
      if (!sampler) return null;
      const sx = Math.min(sampler.width - 1, Math.floor((point.x * sampler.width) / source.width));
      const sy = Math.min(sampler.height - 1, Math.floor((point.y * sampler.height) / source.height));
      try {
        return { data: sampler.ctx.getImageData(sx, sy, 1, 1).data, sx, sy };
      } catch {
        return null;
      }
    },
    [source.width, source.height],
  );

  return { samplerRef, sample, error, downscaled };
}

function Magnifier({ samplerRef, sampled }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const sampler = samplerRef.current;
    if (!canvas || !sampler || !sampled) return;
    const ctx = canvas.getContext("2d");
    const half = Math.floor(MAGNIFIER_PIXELS / 2);
    const cell = MAGNIFIER_SIZE / MAGNIFIER_PIXELS;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);
    ctx.drawImage(sampler.canvas, sampled.sx - half, sampled.sy - half, MAGNIFIER_PIXELS, MAGNIFIER_PIXELS, 0, 0, MAGNIFIER_SIZE, MAGNIFIER_SIZE);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(half * cell, half * cell, cell, cell);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(half * cell - 1.5, half * cell - 1.5, cell + 3, cell + 3);
  }, [samplerRef, sampled]);

  return (
    <canvas
      ref={canvasRef}
      width={MAGNIFIER_SIZE}
      height={MAGNIFIER_SIZE}
      className="bg-checkerboard h-33 w-33 shrink-0 rounded-lg border border-border [image-rendering:pixelated]"
      aria-label="Magnified view of the pixels around the selected point"
      role="img"
    />
  );
}

function ColorValue({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <code className="min-w-0 flex-1 truncate rounded-md border border-input bg-code-background px-2.5 py-1.5 font-mono text-sm text-foreground">
        {value}
      </code>
      <CopyButton text={value} />
    </div>
  );
}

function PickerWorkspace({ source }) {
  const { samplerRef, sample, error, downscaled } = useSampler(source);
  const [point, setPoint] = useState(null);
  const [current, setCurrent] = useState(null);
  const [sampled, setSampled] = useState(null);
  const [history, setHistory] = useState([]);
  const imageRef = useRef(null);

  const select = (nextPoint, commit) => {
    const result = sample(nextPoint);
    if (!result) return;
    const color = pixelToColor(result.data, nextPoint);
    setPoint(nextPoint);
    setSampled(result);
    setCurrent(color);
    if (commit) setHistory((prev) => addToHistory(prev, color));
  };

  const pointFromEvent = (event) =>
    toImagePoint(event.clientX, event.clientY, imageRef.current.getBoundingClientRect(), source.width, source.height);

  const onKeyDown = (event) => {
    const step = event.shiftKey ? 10 : 1;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    const base = point ?? { x: Math.floor(source.width / 2), y: Math.floor(source.height / 2) };
    if (delta) {
      event.preventDefault();
      select(
        {
          x: Math.min(Math.max(base.x + delta[0], 0), source.width - 1),
          y: Math.min(Math.max(base.y + delta[1], 0), source.height - 1),
        },
        false,
      );
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(base, true);
    }
  };

  if (error) return <ErrorMessage title="Can't pick colors from this image" message={error} />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="bg-checkerboard flex justify-center overflow-hidden rounded-lg border border-border p-2 sm:p-4">
          <div
            className="relative cursor-crosshair touch-manipulation select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            tabIndex={0}
            role="application"
            aria-label="Image color picker. Click or tap to pick a color. Arrow keys move the picker, Enter saves the color."
            onKeyDown={onKeyDown}
            onPointerDown={(event) => select(pointFromEvent(event), true)}
            onPointerMove={(event) => {
              if (event.pointerType === "mouse" && event.buttons === 0) select(pointFromEvent(event), false);
            }}
          >
            <img ref={imageRef} src={source.url} alt="Uploaded image to pick colors from" className="block max-h-128 max-w-full" draggable={false} />
            {point && (
              <span
                className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.8)]"
                style={{
                  left: `${((point.x + 0.5) / source.width) * 100}%`,
                  top: `${((point.y + 0.5) / source.height) * 100}%`,
                  backgroundColor: current?.hex,
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Click or tap to pick and save a color. Hover to preview. Keyboard: focus the image, use the arrow keys (Shift for 10px), and press Enter to save.
          {downscaled && " This very large image is sampled from a reduced copy, so colors are accurate to about one pixel."}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {current ? (
          <section aria-live="polite" aria-label="Selected color" className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Magnifier samplerRef={samplerRef} sampled={sampled} />
              <div
                className="flex flex-1 items-end rounded-lg border border-border p-2 font-mono text-sm font-semibold"
                style={{ backgroundColor: current.rgb, color: readableTextColor(current.hex) }}
              >
                {current.hex}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Pixel {current.point.x}, {current.point.y}
              {current.alpha < 1 && ` · ${Math.round(current.alpha * 100)}% opacity`}
            </p>
            <ColorValue label="HEX" value={current.hex} />
            <ColorValue label="RGB" value={current.rgb} />
            <ColorValue label="HSL" value={current.hsl} />
          </section>
        ) : (
          <EmptyState icon={Pipette} title="No color picked yet" description="Click anywhere on the image to pick a color." />
        )}

        <section aria-label="Picked colors" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Picked colors {history.length > 0 && `(${history.length})`}</h2>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">Colors you pick will appear here.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {history.map((color) => (
                <li key={color.id} className="flex items-center gap-2 rounded-md border border-border bg-surface p-1.5">
                  <button
                    type="button"
                    onClick={() => select(color.point, false)}
                    className={cn(
                      "h-7 w-7 shrink-0 rounded border border-border",
                      current?.id === color.id && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                    )}
                    style={{ backgroundColor: color.rgb }}
                    aria-label={`Select ${color.hex}`}
                  />
                  <code className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">{color.hex}</code>
                  <CopyButton text={color.hex} label="HEX" className="min-w-0" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setHistory((prev) => prev.filter((item) => item.id !== color.id))}
                    aria-label={`Remove ${color.hex}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ImageColorPicker() {
  const source = useImageFile();

  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <ImageUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} />
          <PickerWorkspace key={source.url} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
