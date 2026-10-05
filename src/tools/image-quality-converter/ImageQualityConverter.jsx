import { useMemo, useState } from "react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImageComparison } from "../../components/common/ImageComparison.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { appendToFilename, formatBytes, formatReduction, reductionPercent } from "../../utils/file.js";
import { describeMime, encodeImage, getFormatOptions, isEncodingSupported, OUTPUT_FORMATS } from "../../utils/image.js";
import { defaultQualityFormat, presetForQuality, QUALITY_PRESETS } from "./imageQualityConverter.utils.js";

const tool = getToolById("image-quality-converter");

function QualityWorkspace({ source }) {
  const formatOptions = useMemo(() => getFormatOptions(["jpeg", "webp"]), []);
  const [formatId, setFormatId] = useState(() => defaultQualityFormat(source.mime, isEncodingSupported("image/webp")));
  const [quality, setQuality] = useState(65);
  const format = OUTPUT_FORMATS[formatId];
  const preset = presetForQuality(quality);
  const presetInfo = QUALITY_PRESETS.find((p) => p.id === preset);

  const output = useImageProcessing(
    () => encodeImage(source.image, { width: source.width, height: source.height, format, quality: quality / 100 }),
    [source.image, formatId, quality],
  );
  const outputUrl = useObjectUrl(output.result);
  const result = output.result;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Quality level</h2>
            <p className="text-sm text-muted-foreground">Dimensions stay at {source.width} × {source.height} px.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SegmentedControl
              label="Preset"
              value={preset}
              onChange={(id) => {
                const match = QUALITY_PRESETS.find((p) => p.id === id);
                if (match) setQuality(match.quality);
              }}
              options={[
                ...QUALITY_PRESETS.map((p) => ({ value: p.id, label: p.label })),
                { value: "custom", label: "Custom", disabled: preset !== "custom" },
              ]}
              size="sm"
            />
            <Slider
              id="quality-level"
              label="Custom quality"
              value={quality}
              min={1}
              max={100}
              onChange={setQuality}
              valueLabel={`${quality}%`}
              hint={presetInfo?.description ?? "Fine-tune the exact encoder quality."}
            />
            <SegmentedControl label="Encode as" value={formatId} onChange={setFormatId} options={formatOptions} size="sm" />
            {source.mime !== format.mime && (
              <p className="text-xs text-muted-foreground">
                Quality levels apply to lossy formats, so this {describeMime(source.mime)} image is saved as {format.label}.
                {!format.alpha && " Transparent areas become white."}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Compare original and result</p>
          {output.status === "error" ? (
            <ErrorMessage title="Couldn't apply this quality" message={output.error} />
          ) : outputUrl ? (
            <ImageComparison
              beforeSrc={source.url}
              afterSrc={outputUrl}
              beforeLabel="Original"
              afterLabel={`${quality}% ${format.label}`}
              width={source.width}
              height={source.height}
            />
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-border">
              <ProcessingIndicator label="Encoding…" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">Drag the divider (or focus it and use the arrow keys) to compare. Check edges and fine detail for artifacts.</p>
        </div>
      </div>

      {result && (
        <FileInfo
          items={[
            { label: "Original size", value: formatBytes(source.file.size) },
            { label: "Output size", value: formatBytes(result.size) },
            {
              label: "Difference",
              value: formatReduction(source.file.size, result.size),
              tone: reductionPercent(source.file.size, result.size) >= 0 ? "success" : "warning",
            },
            { label: "Quality", value: `${quality}% · ${describeMime(result.type)}` },
          ]}
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <DownloadButton
          blob={output.status === "done" ? result : null}
          filename={appendToFilename(source.file.name, `-q${quality}`, format.extension)}
          label="Download image"
        />
        {output.status === "processing" && result && <ProcessingIndicator label="Updating…" />}
      </div>
    </div>
  );
}

export default function ImageQualityConverter() {
  const source = useImageFile();

  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <ImageUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} />
          <QualityWorkspace key={source.url} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
