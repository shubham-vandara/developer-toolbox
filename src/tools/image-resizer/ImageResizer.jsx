import { useMemo, useState } from "react";
import { Lock, LockOpen, RotateCcw } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { NumberField } from "../../components/common/NumberField.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { appendToFilename, formatBytes } from "../../utils/file.js";
import {
  encodeImage,
  getFormatByMime,
  getFormatOptions,
  isEncodingSupported,
  linkedDimension,
  OUTPUT_FORMATS,
  validateDimensions,
} from "../../utils/image.js";
import { PERCENT_PRESETS, scaleByPercent, WIDTH_PRESETS } from "./imageResizer.utils.js";

const tool = getToolById("image-resizer");

function ResizerWorkspace({ source }) {
  const [unit, setUnit] = useState("px");
  const [width, setWidth] = useState(source.width);
  const [height, setHeight] = useState(source.height);
  const [percent, setPercent] = useState(100);
  const [locked, setLocked] = useState(true);
  const [formatChoice, setFormatChoice] = useState("original");
  const formatOptions = useMemo(() => getFormatOptions(["png", "jpeg", "webp"]), []);

  const originalFormat = getFormatByMime(source.mime);
  const keepFormat = originalFormat && isEncodingSupported(originalFormat.mime) ? originalFormat : OUTPUT_FORMATS.png;
  const format = formatChoice === "original" ? keepFormat : OUTPUT_FORMATS[formatChoice];

  const target = unit === "percent" ? scaleByPercent(source.width, source.height, percent) : { width, height };
  const validation = unit === "percent" && !(percent > 0) ? "Enter a percentage above 0." : validateDimensions(target.width, target.height);

  const output = useImageProcessing(
    () => encodeImage(source.image, { width: target.width, height: target.height, format, quality: 0.92 }),
    [source.image, target.width, target.height, format.id],
    { enabled: !validation, delay: 350 },
  );
  const outputUrl = useObjectUrl(output.result);

  const changeWidth = (value) => {
    setWidth(value);
    if (locked) setHeight(linkedDimension(value, source.width, source.height, "width"));
  };
  const changeHeight = (value) => {
    setHeight(value);
    if (locked) setWidth(linkedDimension(value, source.width, source.height, "height"));
  };
  const toggleLock = () => {
    const next = !locked;
    setLocked(next);
    if (next && width) setHeight(linkedDimension(width, source.width, source.height, "width"));
  };
  const reset = () => {
    setWidth(source.width);
    setHeight(source.height);
    setPercent(100);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">New size</h2>
          <p className="text-sm text-muted-foreground">
            Original: {source.width.toLocaleString()} × {source.height.toLocaleString()} px
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SegmentedControl
            label="Resize by"
            value={unit}
            onChange={setUnit}
            options={[
              { value: "px", label: "Pixels" },
              { value: "percent", label: "Percentage" },
            ]}
            size="sm"
          />

          {unit === "px" ? (
            <>
              <div className="flex items-end gap-2">
                <NumberField id="resize-width" label="Width" value={width} onChange={changeWidth} min={1} suffix="px" className="flex-1" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleLock}
                  aria-pressed={locked}
                  aria-label={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  title={locked ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                >
                  {locked ? <Lock className="h-4 w-4" aria-hidden="true" /> : <LockOpen className="h-4 w-4" aria-hidden="true" />}
                </Button>
                <NumberField id="resize-height" label="Height" value={height} onChange={changeHeight} min={1} suffix="px" className="flex-1" />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Width presets</p>
                <div className="flex flex-wrap gap-1.5">
                  {WIDTH_PRESETS.map((preset) => (
                    <Button key={preset} variant="outline" size="sm" onClick={() => changeWidth(preset)} aria-pressed={width === preset}>
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <NumberField id="resize-percent" label="Scale" value={percent} onChange={setPercent} min={1} suffix="%" />
              <div className="flex flex-wrap gap-1.5">
                {PERCENT_PRESETS.map((preset) => (
                  <Button key={preset} variant="outline" size="sm" onClick={() => setPercent(preset)} aria-pressed={percent === preset}>
                    {preset}%
                  </Button>
                ))}
              </div>
            </>
          )}

          <SegmentedControl
            label="Output format"
            value={formatChoice}
            onChange={setFormatChoice}
            options={[{ value: "original", label: `Original (${keepFormat.label})` }, ...formatOptions]}
            size="sm"
          />

          <Button variant="outline" size="sm" onClick={reset} className="self-start">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset size
          </Button>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        {validation ? (
          <ErrorMessage title="Check the size" message={validation} />
        ) : output.status === "error" ? (
          <ErrorMessage title="Resize failed" message={output.error} />
        ) : (
          <ImagePreview src={outputUrl} alt="Resized image preview" label="Resized image">
            {!outputUrl && <ProcessingIndicator label="Resizing…" />}
          </ImagePreview>
        )}
        {!validation && (
          <FileInfo
            items={[
              { label: "Original", value: `${source.width} × ${source.height}` },
              { label: "New size", value: `${target.width} × ${target.height}` },
              { label: "Scale", value: `${Math.round((target.width / source.width) * 100)}%` },
              { label: "File size", value: output.result ? formatBytes(output.result.size) : "…" },
            ]}
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <DownloadButton
            blob={output.status === "done" && !validation ? output.result : null}
            filename={appendToFilename(source.file.name, `-${target.width}x${target.height}`, format.extension)}
            label="Download resized image"
          />
          {output.status === "processing" && output.result && <ProcessingIndicator label="Updating…" />}
        </div>
      </div>
    </div>
  );
}

export default function ImageResizer() {
  const source = useImageFile();

  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <ImageUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} />
          <ResizerWorkspace key={source.url} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
