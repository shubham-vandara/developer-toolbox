import { useState } from "react";
import { ImageUp, Lock, LockOpen } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { ColorInput } from "../../components/common/ColorInput.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { NumberField } from "../../components/common/NumberField.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SelectedFile } from "../../components/common/SelectedFile.jsx";
import { SVG_ACCEPT, SVG_SAMPLE, SvgSourceInput } from "../../components/common/SvgSourceInput.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { useSvgSource } from "../../hooks/useSvgSource.js";
import { formatBytes, replaceExtension } from "../../utils/file.js";
import { assertCanvasSize, encodeImage, linkedDimension, loadImage, OUTPUT_FORMATS, validateDimensions } from "../../utils/image.js";
import { resizeSvgMarkup, svgToBlob } from "../../utils/svg.js";

const tool = getToolById("svg-to-png");
const SCALE_PRESETS = [1, 2, 3, 4];

async function rasterizeSvg(result, width, height, background) {
  assertCanvasSize(width, height);
  // Render the vector at the exact output size so the PNG stays sharp.
  const sized = resizeSvgMarkup(result.svg, result.info, width, height);
  const url = URL.createObjectURL(svgToBlob(sized));
  try {
    const image = await loadImage(url, { verifyDecode: false });
    return await encodeImage(image, { width, height, format: OUTPUT_FORMATS.png, background, smoothing: false });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function SizeControls({ info, width, height, setWidth, setHeight, locked, setLocked }) {
  const changeWidth = (value) => {
    setWidth(value);
    if (locked) setHeight(linkedDimension(value, info.width, info.height, "width"));
  };
  const changeHeight = (value) => {
    setHeight(value);
    if (locked) setWidth(linkedDimension(value, info.width, info.height, "height"));
  };
  const applyScale = (scale) => {
    setWidth(Math.round(info.width * scale));
    setHeight(Math.round(info.height * scale));
  };

  return (
    <>
      <div className="flex items-end gap-2">
        <NumberField id="svg-png-width" label="Width" value={width} onChange={changeWidth} min={1} suffix="px" className="flex-1" />
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (!locked && width) setHeight(linkedDimension(width, info.width, info.height, "width"));
            setLocked(!locked);
          }}
          aria-pressed={locked}
          aria-label={locked ? "Unlock aspect ratio" : "Lock aspect ratio"}
        >
          {locked ? <Lock className="h-4 w-4" aria-hidden="true" /> : <LockOpen className="h-4 w-4" aria-hidden="true" />}
        </Button>
        <NumberField id="svg-png-height" label="Height" value={height} onChange={changeHeight} min={1} suffix="px" className="flex-1" />
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          Scale from {info.width} × {info.height}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SCALE_PRESETS.map((scale) => (
            <Button key={scale} variant="outline" size="sm" onClick={() => applyScale(scale)}>
              {scale}×
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}

function ConvertPanel({ result, baseName }) {
  const [width, setWidth] = useState(() => Math.min(result.info.width * 2, 4096));
  const [height, setHeight] = useState(() => linkedDimension(Math.min(result.info.width * 2, 4096), result.info.width, result.info.height, "width"));
  const [locked, setLocked] = useState(true);
  const [transparent, setTransparent] = useState(true);
  const [background, setBackground] = useState("#ffffff");
  const validation = validateDimensions(width, height);

  const output = useImageProcessing(
    () => rasterizeSvg(result, width, height, transparent ? undefined : background),
    [result.svg, width, height, transparent, background],
    { enabled: !validation, delay: 300 },
  );
  const pngUrl = useObjectUrl(output.result);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">PNG settings</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SizeControls
            info={result.info}
            width={width}
            height={height}
            setWidth={setWidth}
            setHeight={setHeight}
            locked={locked}
            setLocked={setLocked}
          />
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <Checkbox id="svg-png-transparent" checked={transparent} onChange={setTransparent} label="Transparent background" />
            {!transparent && (
              <ColorInput id="svg-png-background" label="Background color" value={background} onChange={setBackground} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-4">
        {validation ? (
          <ErrorMessage title="Check the size" message={validation} />
        ) : output.status === "error" ? (
          <ErrorMessage title="Conversion failed" message={output.error} />
        ) : (
          <ImagePreview src={pngUrl} alt="Generated PNG" label="PNG output">
            {!pngUrl && <ProcessingIndicator label="Rendering…" />}
          </ImagePreview>
        )}
        {output.result && !validation && (
          <FileInfo
            items={[
              { label: "SVG size", value: `${result.info.width} × ${result.info.height}` },
              { label: "PNG size", value: `${width} × ${height}` },
              { label: "File size", value: formatBytes(output.result.size) },
              { label: "Background", value: transparent ? "Transparent" : background.toUpperCase() },
            ]}
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <DownloadButton
            blob={output.status === "done" && !validation ? output.result : null}
            filename={replaceExtension(baseName, "png")}
            label="Download PNG"
          />
          {output.status === "processing" && output.result && <ProcessingIndicator label="Updating…" />}
        </div>
      </div>
    </div>
  );
}

export default function SvgToPng() {
  const svg = useSvgSource();
  const { result } = svg;

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        {svg.text ? (
          <SelectedFile
            name={svg.fileName ?? "Pasted SVG markup"}
            thumbnailUrl={null}
            details={["SVG", result?.success && `${result.info.width} × ${result.info.height}`]}
            accept={SVG_ACCEPT}
            onReplace={svg.loadFile}
            onClear={svg.reset}
          />
        ) : (
          <SvgSourceInput svg={svg} />
        )}

        {svg.text && result && !result.success && (
          <ErrorMessage title="Invalid SVG" message={result.error} detail={result.detail} />
        )}
        {result?.success ? (
          // Re-initialize the size controls when a different SVG size arrives.
          <ConvertPanel key={`${result.info.width}x${result.info.height}`} result={result} baseName={svg.fileName ?? "image.svg"} />
        ) : (
          !svg.text && <EmptyState icon={ImageUp} title="No SVG yet" description="Upload or paste an SVG to convert it to PNG." />
        )}

        <details className="group rounded-lg border border-border bg-surface" open={!svg.fileName}>
          <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-foreground">SVG source</summary>
          <div className="px-4 pb-4">
            <TextPanel
              id="svg-png-source"
              label="Markup"
              value={svg.text}
              onChange={svg.setText}
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">…</svg>'
              rows={8}
              actions={
                !svg.text && (
                  <Button variant="ghost" size="sm" onClick={() => svg.setText(SVG_SAMPLE)}>
                    Load sample
                  </Button>
                )
              }
            />
          </div>
        </details>
      </div>
    </ToolLayout>
  );
}
