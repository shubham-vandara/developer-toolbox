import { useState } from "react";
import { RotateCcw, Stamp } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ColorInput } from "../../components/common/ColorInput.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileDropZone } from "../../components/common/FileDropZone.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Select } from "../../components/common/Select.jsx";
import { SelectedFile } from "../../components/common/SelectedFile.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { PageNavigator, PdfPageView } from "../../components/pdf/PdfPageView.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { PageScope } from "../../components/pdf/PageScope.jsx";
import { usePageScope } from "../../hooks/usePageScope.js";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { appendToFilename } from "../../utils/file.js";
import { getUserMessage } from "../../utils/image.js";
import { getPdfErrorMessage, loadPdfLib, openForEdit, savePdf, yieldToBrowser } from "../../utils/pdf/engine.js";
import { POSITIONS } from "../../utils/pdf/geometry.js";
import { assertEncodable, drawImageAt, drawTextAt, embedImage, hexToRgb01, pageGeometry } from "../../utils/pdf/stamp.js";
import { imageFileToEmbeddableBytes } from "../../utils/pdf/imageInputs.js";
import { layoutWatermark, WATERMARK_IMAGE_MIMES } from "./pdfWatermark.utils.js";

const tool = getToolById("pdf-watermark");
const DEFAULTS = { mode: "text", text: "CONFIDENTIAL", fontSize: 60, color: "#dc2626", opacity: 25, rotation: 45, position: "center", scale: 40 };
const errorMessage = (error) => (error?.name === "ImageToolError" ? getUserMessage(error) : getPdfErrorMessage(error));

function WatermarkOverlay({ settings, viewer, imageUrl, imageSize }) {
  const layout = layoutWatermark(settings, viewer, imageSize);
  if (!layout) return null;
  const svgY = viewer.height - layout.center.y;
  return (
    <svg viewBox={`0 0 ${viewer.width} ${viewer.height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
      <g transform={`rotate(${-settings.rotation} ${layout.center.x} ${svgY})`} opacity={settings.opacity / 100}>
        {settings.mode === "text" ? (
          <text
            x={layout.center.x}
            y={svgY + settings.fontSize * 0.35}
            textAnchor="middle"
            fontFamily="Helvetica, Arial, sans-serif"
            fontWeight="700"
            fontSize={settings.fontSize}
            fill={settings.color}
          >
            {settings.text}
          </text>
        ) : (
          imageUrl && (
            <image href={imageUrl} x={layout.center.x - layout.width / 2} y={svgY - layout.height / 2} width={layout.width} height={layout.height} />
          )
        )}
      </g>
    </svg>
  );
}

function WatermarkWorkspace({ source }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [previewPage, setPreviewPage] = useState(1);
  const [viewer, setViewer] = useState(null);
  const scope = usePageScope(source.pageCount);
  const image = useImageFile({ mimes: WATERMARK_IMAGE_MIMES });
  const task = useTask({ getErrorMessage: errorMessage });
  const imageSize = image.status === "ready" ? { width: image.width, height: image.height } : null;
  const set = (key) => (value) => {
    task.reset();
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const canApply = scope.pages.length > 0 && (settings.mode === "text" ? settings.text.trim() : imageSize);

  const apply = () =>
    task.run(async (report) => {
      const lib = await loadPdfLib();
      const doc = await openForEdit(source.bytes);
      const color = hexToRgb01(settings.color);
      const font = settings.mode === "text" ? await doc.embedFont(lib.StandardFonts.HelveticaBold) : null;
      if (font) assertEncodable(font, settings.text);
      const embedded = settings.mode === "image" ? await embedImage(doc, await imageFileToEmbeddableBytes(image.file, image.mime)) : null;
      const pages = doc.getPages();
      for (let i = 0; i < scope.pages.length; i += 1) {
        report(i, scope.pages.length, "Watermarking page");
        const page = pages[scope.pages[i] - 1];
        const { viewer: pageViewer } = pageGeometry(page);
        const layout = layoutWatermark(settings, pageViewer, imageSize, font);
        const common = { center: layout.center, angle: settings.rotation, opacity: settings.opacity / 100 };
        if (font) drawTextAt(page, settings.text, { ...common, font, size: settings.fontSize, color }, lib);
        else drawImageAt(page, embedded, { ...common, width: layout.width, height: layout.height }, lib);
        if (i % 20 === 19) await yieldToBrowser();
      }
      report(0, 0, "Saving PDF…");
      return { blob: await savePdf(doc), pages: scope.pages.length };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader>
            <h2 className="font-semibold text-foreground">Watermark</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SegmentedControl value={settings.mode} onChange={set("mode")} size="sm"
              options={[{ value: "text", label: "Text" }, { value: "image", label: "Image" }]} />
            {settings.mode === "text" ? (
              <>
                <div>
                  <label htmlFor="wm-text" className="mb-1.5 block text-sm font-medium text-foreground">Text</label>
                  <input id="wm-text" value={settings.text} maxLength={120} onChange={(e) => set("text")(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <Slider id="wm-size" label="Font size" value={settings.fontSize} min={8} max={160} onChange={set("fontSize")} valueLabel={`${settings.fontSize} pt`} />
                <ColorInput id="wm-color" label="Color" value={settings.color} onChange={set("color")} />
              </>
            ) : image.status === "ready" ? (
              <>
                <SelectedFile name={image.file.name} thumbnailUrl={image.url} details={[`${image.width} × ${image.height}`]} onClear={image.reset} onReplace={image.load} />
                <Slider id="wm-scale" label="Size" value={settings.scale} min={5} max={100} onChange={set("scale")} valueLabel={`${settings.scale}% of page width`} />
              </>
            ) : (
              <>
                <FileDropZone onFile={image.load} accept="image/png,image/jpeg,image/webp" title="Choose a watermark image" hint="PNG (transparent works best), JPEG or WebP" allowPaste={false} className="py-6" />
                {image.status === "error" && <p className="text-xs text-destructive">{image.error}</p>}
              </>
            )}
            <Slider id="wm-opacity" label="Opacity" value={settings.opacity} min={5} max={100} onChange={set("opacity")} valueLabel={`${settings.opacity}%`} />
            <Slider id="wm-rotation" label="Rotation" value={settings.rotation} min={-180} max={180} step={5} onChange={set("rotation")} valueLabel={`${settings.rotation}°`} />
            <Select id="wm-position" label="Position" value={settings.position} onChange={set("position")} options={POSITIONS} />
            <PageScope scope={scope} id="wm-pages" onChange={task.reset} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={apply} disabled={!canApply || task.isRunning} size="md">
                <Stamp className="h-4 w-4" aria-hidden="true" />
                Apply watermark
              </Button>
              <Button variant="outline" onClick={() => { task.reset(); setSettings(DEFAULTS); }}>
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </Button>
            </div>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress)} />}
          </CardContent>
        </Card>

        <section className="flex min-w-0 flex-col items-center gap-3" aria-label="Preview">
          <PageNavigator pageNumber={previewPage} pageCount={source.pageCount} onChange={setPreviewPage} />
          <PdfPageView doc={source.doc} pageNumber={previewPage} maxHeight={620} onPageInfo={(info) => setViewer(info.viewer)}>
            {viewer && (!scope.pages.length || scope.pages.includes(previewPage)) && (
              <WatermarkOverlay settings={settings} viewer={viewer} imageUrl={image.url} imageSize={imageSize} />
            )}
          </PdfPageView>
          <p className="text-xs text-muted-foreground">Preview — the original file isn’t changed; a new PDF is created.</p>
        </section>
      </div>

      {task.status === "error" && <ErrorMessage title="Couldn't apply the watermark" message={task.error} />}
      {task.status === "done" && (
        <PdfResult blob={task.result.blob} filename={appendToFilename(source.file.name, "-watermarked", "pdf")}
          items={[{ label: "Pages watermarked", value: String(task.result.pages) }]} onReset={task.reset} resetLabel="Adjust watermark" />
      )}
    </div>
  );
}

export default function PdfWatermark() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <WatermarkWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
