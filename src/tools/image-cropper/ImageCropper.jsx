import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { appendToFilename, formatBytes } from "../../utils/file.js";
import { encodeImage, getFormatByMime, getFormatOptions, isEncodingSupported, OUTPUT_FORMATS } from "../../utils/image.js";
import { ASPECT_PRESETS, createInitialCrop, moveCrop, resizeCrop, roundCrop } from "./imageCropper.utils.js";

const tool = getToolById("image-cropper");
const HANDLES = [
  { id: "nw", className: "top-0 left-0 cursor-nwse-resize" },
  { id: "n", className: "top-0 left-1/2 cursor-ns-resize" },
  { id: "ne", className: "top-0 left-full cursor-nesw-resize" },
  { id: "e", className: "top-1/2 left-full cursor-ew-resize" },
  { id: "se", className: "top-full left-full cursor-nwse-resize" },
  { id: "s", className: "top-full left-1/2 cursor-ns-resize" },
  { id: "sw", className: "top-full left-0 cursor-nesw-resize" },
  { id: "w", className: "top-1/2 left-0 cursor-ew-resize" },
];

function CropArea({ source, crop, onChange, aspect }) {
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const bounds = { width: source.width, height: source.height };

  const startDrag = (event, handle) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = frameRef.current.getBoundingClientRect();
    dragRef.current = {
      handle,
      crop,
      startX: event.clientX,
      startY: event.clientY,
      scale: source.width / rect.width,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = (event.clientX - drag.startX) * drag.scale;
    const dy = (event.clientY - drag.startY) * drag.scale;
    onChange(drag.handle === "move" ? moveCrop(drag.crop, dx, dy, bounds) : resizeCrop(drag.crop, drag.handle, dx, dy, bounds, aspect));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const onKeyDown = (event) => {
    const step = Math.max(1, Math.round(Math.max(source.width, source.height) / 100)) * (event.altKey ? 0.1 : 1);
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!delta) return;
    event.preventDefault();
    onChange(event.shiftKey ? resizeCrop(crop, "se", delta[0], delta[1], bounds, aspect) : moveCrop(crop, delta[0], delta[1], bounds));
  };

  const pct = (value, total) => `${(value / total) * 100}%`;
  const pointerHandlers = { onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag };

  return (
    <div className="bg-checkerboard flex justify-center overflow-hidden rounded-lg border border-border p-2 sm:p-4">
      <div ref={frameRef} className="relative touch-none select-none">
        <img src={source.url} alt="Image being cropped" className="block max-h-112 max-w-full" draggable={false} />
        <div
          role="group"
          tabIndex={0}
          aria-label="Crop area. Arrow keys move it; Shift + arrow keys resize it."
          onPointerDown={(event) => startDrag(event, "move")}
          {...pointerHandlers}
          onKeyDown={onKeyDown}
          className="absolute cursor-move outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{
            left: pct(crop.x, source.width),
            top: pct(crop.y, source.height),
            width: pct(crop.width, source.width),
            height: pct(crop.height, source.height),
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.55)",
          }}
        >
          <div className="pointer-events-none absolute inset-0 border border-white/90" aria-hidden="true">
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/40" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/40" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/40" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/40" />
          </div>
          {HANDLES.map((handle) => (
            <div
              key={handle.id}
              onPointerDown={(event) => startDrag(event, handle.id)}
              {...pointerHandlers}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center ${handle.className}`}
              aria-hidden="true"
            >
              <span className="h-3 w-3 rounded-sm border border-primary bg-white shadow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CropperWorkspace({ source }) {
  const [aspectId, setAspectId] = useState("free");
  const aspect = ASPECT_PRESETS.find((preset) => preset.value === aspectId).ratio;
  const [crop, setCrop] = useState(() => createInitialCrop(source.width, source.height, null));
  const [formatChoice, setFormatChoice] = useState("original");
  const formatOptions = useMemo(() => getFormatOptions(["png", "jpeg", "webp"]), []);

  const originalFormat = getFormatByMime(source.mime);
  const keepFormat = originalFormat && isEncodingSupported(originalFormat.mime) ? originalFormat : OUTPUT_FORMATS.png;
  const format = formatChoice === "original" ? keepFormat : OUTPUT_FORMATS[formatChoice];
  const bounds = { width: source.width, height: source.height };
  const rect = roundCrop(crop, bounds);

  const output = useImageProcessing(
    () => encodeImage(source.image, { width: rect.width, height: rect.height, crop: rect, format, quality: 0.92 }),
    [source.image, rect.x, rect.y, rect.width, rect.height, format.id],
    { delay: 350 },
  );
  const outputUrl = useObjectUrl(output.result);

  const changeAspect = (value) => {
    setAspectId(value);
    const ratio = ASPECT_PRESETS.find((preset) => preset.value === value).ratio;
    if (ratio) setCrop(createInitialCrop(source.width, source.height, ratio));
  };

  return (
    <div className="flex flex-col gap-6">
      <CropArea source={source} crop={crop} onChange={setCrop} aspect={aspect} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Crop settings</h2>
            <p className="text-sm text-muted-foreground">Drag the box or its handles. Keyboard: arrows move, Shift + arrows resize.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SegmentedControl label="Aspect ratio" value={aspectId} onChange={changeAspect} options={ASPECT_PRESETS} size="sm" />
            <SegmentedControl
              label="Output format"
              value={formatChoice}
              onChange={setFormatChoice}
              options={[{ value: "original", label: `Original (${keepFormat.label})` }, ...formatOptions]}
              size="sm"
            />
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => setCrop(createInitialCrop(source.width, source.height, aspect))}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset crop
            </Button>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          {output.status === "error" ? (
            <ErrorMessage title="Crop failed" message={output.error} />
          ) : (
            <ImagePreview src={outputUrl} alt="Cropped result" label="Result" imageClassName="max-h-72">
              {!outputUrl && <ProcessingIndicator label="Cropping…" />}
            </ImagePreview>
          )}
          <FileInfo
            items={[
              { label: "Crop size", value: `${rect.width} × ${rect.height}` },
              { label: "Position", value: `${rect.x}, ${rect.y}` },
              { label: "Ratio", value: (rect.width / rect.height).toFixed(3) },
              { label: "File size", value: output.result ? formatBytes(output.result.size) : "…" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <DownloadButton
              blob={output.status === "done" ? output.result : null}
              filename={appendToFilename(source.file.name, "-cropped", format.extension)}
              label="Download cropped image"
            />
            {output.status === "processing" && output.result && <ProcessingIndicator label="Updating…" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImageCropper() {
  const source = useImageFile();

  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <ImageUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} />
          <CropperWorkspace key={source.url} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
