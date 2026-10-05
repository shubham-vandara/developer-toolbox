import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { NumberField } from "../../components/common/NumberField.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { cn } from "../../utils/cn.js";
import { appendToFilename, formatBytes, reductionPercent } from "../../utils/file.js";
import { encodeImage, getFormatOptions, OUTPUT_FORMATS } from "../../utils/image.js";
import { findQualityForTargetSize, getCompressedDimensions, resolveAutoFormat } from "./imageCompressor.utils.js";

const tool = getToolById("image-compressor");

function SizeStat({ label, value, tone }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-lg font-bold tabular-nums text-foreground sm:text-2xl",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function ImageCompressor() {
  const source = useImageFile();
  const lossyOptions = useMemo(() => getFormatOptions(["jpeg", "webp", "png"]), []);
  const [formatChoice, setFormatChoice] = useState("auto");
  const [mode, setMode] = useState("quality");
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState("");
  const [limitSize, setLimitSize] = useState(false);
  const [maxSide, setMaxSide] = useState(1920);
  const ready = source.status === "ready";

  const format = formatChoice === "auto" ? resolveAutoFormat(source.mime) : OUTPUT_FORMATS[formatChoice];
  const dims = ready ? getCompressedDimensions(source.width, source.height, limitSize ? maxSide : 0) : null;
  const defaultTargetKb = ready ? Math.max(10, Math.round(source.file.size / 1024 / 2)) : 100;
  const target = targetKb === "" ? defaultTargetKb : targetKb;
  const useTarget = mode === "target" && format.lossy;

  const output = useImageProcessing(
    async () => {
      const encodeAt = (q) => encodeImage(source.image, { ...dims, format, quality: q });
      if (useTarget) return findQualityForTargetSize(encodeAt, Math.max(1, target) * 1024);
      return { blob: await encodeAt(quality / 100), quality: quality / 100, reachedTarget: true };
    },
    [source.image, format.id, quality, useTarget, target, dims?.width, dims?.height],
    { enabled: ready && Boolean(dims?.width), delay: useTarget ? 400 : 200 },
  );
  const result = output.result;
  const outputUrl = useObjectUrl(result?.blob);

  if (!ready) {
    return (
      <ToolLayout tool={tool}>
        <ImageUpload source={source} />
      </ToolLayout>
    );
  }

  const saved = result ? reductionPercent(source.file.size, result.blob.size) : 0;
  const autoLabel = `Auto (${resolveAutoFormat(source.mime).label})`;

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <ImageSourceBar source={source} />

        <div className="rounded-lg border border-border bg-surface p-4 sm:p-5" aria-live="polite">
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <SizeStat label="Original" value={formatBytes(source.file.size)} />
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <SizeStat label="Compressed" value={result ? formatBytes(result.blob.size) : "…"} />
            <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <SizeStat
              label="Reduction"
              value={result ? `${saved > 0 ? "−" : "+"}${Math.abs(saved).toFixed(1)}%` : "…"}
              tone={result ? (saved > 0 ? "success" : "warning") : undefined}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">Compression</h2>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <SegmentedControl
                label="Output format"
                value={formatChoice}
                onChange={setFormatChoice}
                options={[{ value: "auto", label: autoLabel }, ...lossyOptions]}
                size="sm"
              />
              <SegmentedControl
                label="Compress by"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "quality", label: "Quality" },
                  { value: "target", label: "Target size", disabled: !format.lossy },
                ]}
                size="sm"
              />
              {!format.lossy ? (
                <p className="text-xs text-muted-foreground">
                  PNG is lossless, so quality doesn&apos;t apply. For real savings choose WebP or JPEG, or limit the
                  dimensions below.
                </p>
              ) : useTarget ? (
                <NumberField
                  id="compressor-target"
                  label="Target file size"
                  value={targetKb}
                  placeholder={String(defaultTargetKb)}
                  onChange={setTargetKb}
                  min={1}
                  suffix="KB"
                />
              ) : (
                <Slider
                  id="compressor-quality"
                  label="Quality"
                  value={quality}
                  min={1}
                  max={100}
                  onChange={setQuality}
                  valueLabel={`${quality}%`}
                  hint="Lower quality = smaller file. 60–80% is a good balance for photos."
                />
              )}
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <Checkbox
                  id="compressor-limit"
                  checked={limitSize}
                  onChange={setLimitSize}
                  label="Also limit dimensions"
                />
                {limitSize && (
                  <NumberField
                    id="compressor-max-side"
                    label="Longest side (max)"
                    value={maxSide}
                    onChange={setMaxSide}
                    min={1}
                    suffix="px"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  Output: {dims.width.toLocaleString()} × {dims.height.toLocaleString()} px
                  {limitSize ? "" : " (original dimensions)"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex min-w-0 flex-col gap-4">
            {output.status === "error" ? (
              <ErrorMessage title="Compression failed" message={output.error} />
            ) : (
              <ImagePreview src={outputUrl} alt="Compressed image preview" label="Compressed image">
                {!outputUrl && <ProcessingIndicator label="Compressing…" />}
              </ImagePreview>
            )}

            {result && saved <= 0 && (
              <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                The result isn&apos;t smaller than the original, which is already well optimized. Try a lower quality,
                WebP, or limiting the dimensions.
              </div>
            )}
            {result && useTarget && !result.reachedTarget && (
              <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                {target} KB can&apos;t be reached at these dimensions. This is the smallest result; try limiting the
                dimensions.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <DownloadButton
                blob={output.status === "done" ? result?.blob : null}
                filename={appendToFilename(source.file.name, "-compressed", format.extension)}
                label="Download compressed image"
              />
              {result && format.lossy && (
                <span className="text-xs text-muted-foreground">Encoded at {Math.round(result.quality * 100)}% quality</span>
              )}
              {output.status === "processing" && result && <ProcessingIndicator label="Updating…" />}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
