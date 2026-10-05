import { useMemo, useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ColorInput } from "../../components/common/ColorInput.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { formatBytes, replaceExtension } from "../../utils/file.js";
import { describeMime, encodeImage, getFormatOptions, OUTPUT_FORMATS } from "../../utils/image.js";
import { getConversionNotes } from "./imageConverter.utils.js";

const tool = getToolById("image-converter");

export default function ImageConverter() {
  const source = useImageFile();
  const formatOptions = useMemo(() => getFormatOptions(["png", "jpeg", "webp", "bmp"]), []);
  const [formatId, setFormatId] = useState("webp");
  const [quality, setQuality] = useState(90);
  const [background, setBackground] = useState("#ffffff");
  const format = OUTPUT_FORMATS[formatOptions.some((o) => o.value === formatId) ? formatId : "png"];
  const ready = source.status === "ready";

  const output = useImageProcessing(
    () =>
      encodeImage(source.image, {
        width: source.width,
        height: source.height,
        format,
        quality: quality / 100,
        background: format.alpha ? undefined : background,
      }),
    [source.image, format.id, quality, background],
    { enabled: ready },
  );
  const outputUrl = useObjectUrl(output.result);
  const notes = ready ? getConversionNotes(source.mime, format) : [];

  return (
    <ToolLayout tool={tool}>
      {!ready ? (
        <ImageUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-foreground">Output settings</h2>
                <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  {describeMime(source.mime)}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="font-medium text-foreground">{format.label}</span>
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <SegmentedControl label="Convert to" value={format.id} onChange={setFormatId} options={formatOptions} />
                {format.lossy && (
                  <Slider
                    id="converter-quality"
                    label="Quality"
                    value={quality}
                    min={1}
                    max={100}
                    onChange={setQuality}
                    valueLabel={`${quality}%`}
                  />
                )}
                {!format.alpha && (
                  <ColorInput
                    id="converter-background"
                    label="Background for transparent areas"
                    value={background}
                    onChange={setBackground}
                  />
                )}
                {notes.length > 0 && (
                  <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                    {notes.map((note) => (
                      <li key={note} className="flex gap-1.5">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <div className="flex min-w-0 flex-col gap-4">
              {output.status === "error" ? (
                <ErrorMessage title="Conversion failed" message={output.error} />
              ) : (
                <ImagePreview src={outputUrl} alt={`Converted ${format.label} image`} label="Converted image">
                  {!outputUrl && <ProcessingIndicator label="Converting…" />}
                </ImagePreview>
              )}
              {output.result && (
                <FileInfo
                  items={[
                    { label: "Original", value: `${describeMime(source.mime)} · ${formatBytes(source.file.size)}` },
                    { label: "Output", value: `${describeMime(output.result.type)} · ${formatBytes(output.result.size)}` },
                    { label: "Dimensions", value: `${source.width} × ${source.height}` },
                    {
                      label: "Size change",
                      value: `${output.result.size <= source.file.size ? "−" : "+"}${formatBytes(Math.abs(source.file.size - output.result.size))}`,
                      tone: output.result.size <= source.file.size ? "success" : "warning",
                    },
                  ]}
                />
              )}
              <div className="flex flex-wrap items-center gap-3">
                <DownloadButton
                  blob={output.status === "done" ? output.result : null}
                  filename={replaceExtension(source.file.name, format.extension)}
                  label={`Download ${format.label}`}
                />
                {output.status === "processing" && output.result && <ProcessingIndicator label="Updating…" />}
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
