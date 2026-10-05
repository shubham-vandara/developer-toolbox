import { useMemo, useState } from "react";
import { Images } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { BlobThumb } from "../../components/pdf/BlobThumb.jsx";
import { PageSelector } from "../../components/pdf/PageSelector.jsx";
import { PdfPageGrid } from "../../components/pdf/PdfPageGrid.jsx";
import { ResultFiles } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { usePageSelection } from "../../hooks/usePageSelection.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { getFormatOptions, getUserMessage, OUTPUT_FORMATS } from "../../utils/image.js";
import { getPdfErrorMessage } from "../../utils/pdf/engine.js";
import { allPages } from "../../utils/pdf/pageRanges.js";
import { DPI_OPTIONS, rasterizePages } from "../../utils/pdf/rasterize.js";

const tool = getToolById("pdf-to-images");
const errorMessage = (error) => (error?.name === "ImageToolError" ? getUserMessage(error) : getPdfErrorMessage(error));

function ConvertWorkspace({ source }) {
  const pageNumbers = useMemo(() => allPages(source.pageCount), [source.pageCount]);
  const items = useMemo(() => pageNumbers.map((n) => ({ key: n, pageNumber: n })), [pageNumbers]);
  const selection = usePageSelection(pageNumbers, pageNumbers);
  const formatOptions = useMemo(() => getFormatOptions(["png", "jpeg", "webp"]), []);
  const [formatId, setFormatId] = useState("png");
  const [quality, setQuality] = useState(90);
  const [dpi, setDpi] = useState(150);
  const task = useTask({ getErrorMessage: errorMessage });
  const format = OUTPUT_FORMATS[formatId];
  const base = source.file.name.replace(/\.pdf$/i, "");

  const changed = (setter) => (value) => {
    task.reset();
    setter(value);
  };

  const convert = () =>
    task.run(async (report) => {
      const rendered = await rasterizePages(source.doc, selection.list, { dpi, format, quality: quality / 100 }, report);
      return rendered.map((r) => ({
        name: `${base}-page-${r.pageNumber}.${format.extension}`,
        blob: r.blob,
        detail: `${r.width} × ${r.height}`,
      }));
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader>
            <h2 className="font-semibold text-foreground">Image settings</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SegmentedControl label="Format" value={formatId} onChange={changed(setFormatId)} options={formatOptions} size="sm" />
            {format.lossy && (
              <Slider id="pdf-img-quality" label="Quality" value={quality} min={10} max={100} onChange={changed(setQuality)} valueLabel={`${quality}%`} />
            )}
            <SegmentedControl
              label="Resolution"
              value={dpi}
              onChange={changed(setDpi)}
              options={DPI_OPTIONS.map((value) => ({ value, label: `${value} DPI` }))}
              size="sm"
            />
            <p className="text-xs text-muted-foreground">150 DPI suits screens; 300 DPI suits printing but makes much larger files.</p>
            <Button onClick={convert} disabled={!selection.list.length || task.isRunning} size="md">
              <Images className="h-4 w-4" aria-hidden="true" />
              Convert {selection.list.length} page{selection.list.length === 1 ? "" : "s"}
            </Button>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Rendering…")} />}
          </CardContent>
        </Card>

        <section className="flex min-w-0 flex-col gap-4" aria-label="Choose pages">
          <PageSelector id="pdf-img-pages" pageCount={source.pageCount} value={selection.list} onChange={changed(selection.set)} />
          <PdfPageGrid
            doc={source.doc}
            items={items}
            selectable
            selected={selection.selected}
            onToggle={(key, event) => {
              task.reset();
              selection.toggle(key, event);
            }}
          />
        </section>
      </div>

      {task.status === "error" && <ErrorMessage title="Conversion failed" message={task.error} />}
      {task.status === "done" && (
        <ResultFiles
          files={task.result}
          zipName={`${base}-images.zip`}
          onReset={task.reset}
          renderPreview={(file) => <BlobThumb blob={file.blob} alt={file.name} />}
        />
      )}
    </div>
  );
}

export default function PdfToImages() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <ConvertWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
