import { useCallback, useState } from "react";
import { Combine, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileDropZone } from "../../components/common/FileDropZone.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { SortableFileList } from "../../components/common/SortableFileList.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PrivacyNote } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useFileList } from "../../hooks/useFileList.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { LayoutPreview } from "../../components/pdf/LayoutPreview.jsx";
import { analyzeImageFile, IMAGE_ACCEPT, releaseImageItem } from "../../utils/pdf/imageInputs.js";
import { buildImagesPdf } from "../../utils/pdf/imagesToPdf.js";
import { formatBytes } from "../../utils/file.js";
import { getPdfErrorMessage } from "../../utils/pdf/engine.js";
import { getUserMessage } from "../../utils/image.js";

const tool = getToolById("images-to-pdf");
const errorMessage = (error) => (error?.name === "ImageToolError" ? getUserMessage(error) : getPdfErrorMessage(error));

export default function ImagesToPdf() {
  const list = useFileList({ analyze: analyzeImageFile, release: releaseImageItem, getErrorMessage: (e) => getUserMessage(e, "This image couldn't be read.") });
  const task = useTask({ getErrorMessage: errorMessage });
  const [pageSize, setPageSize] = useState("a4");
  const [orientation, setOrientation] = useState("auto");
  const [fit, setFit] = useState("fit");
  const [margin, setMargin] = useState(18);
  const { items } = list;
  const ready = items.filter((item) => item.status === "ready");
  const hasProblems = items.some((item) => item.status !== "ready");
  const options = { pageSize, orientation, fit, margin };

  const changed = (setter) => (value) => {
    task.reset();
    setter(value);
  };
  const add = useCallback((files) => { task.reset(); list.add(files); }, [list, task]);

  const generate = () =>
    task.run((report) => buildImagesPdf(ready.map((item) => ({ file: item.file, width: item.meta.width, height: item.meta.height })), options, report));

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <FileDropZone
          onFiles={add}
          multiple
          accept={IMAGE_ACCEPT}
          title={items.length ? "Add more images" : "Drop images here or click to browse"}
          hint="JPG, PNG, WebP, GIF, BMP or AVIF · each image becomes one page"
          className={items.length ? "py-6" : undefined}
        />
        {!items.length && <PrivacyNote />}

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <section className="flex min-w-0 flex-col gap-3" aria-label="Images in page order">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">
                  {items.length} image{items.length === 1 ? "" : "s"} → {ready.length} page{ready.length === 1 ? "" : "s"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => { task.reset(); list.clear(); }}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear all
                </Button>
              </div>
              <SortableFileList
                items={items}
                onMove={(from, to) => { task.reset(); list.move(from, to); }}
                onRemove={(id) => { task.reset(); list.remove(id); }}
                label="Images in page order"
                renderItem={(item) => (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-checkerboard flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded border border-border">
                      {item.meta?.url && <img src={item.meta.url} alt="" className="max-h-full max-w-full object-contain" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground" title={item.file.name}>{item.file.name}</p>
                      <p className={item.status === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                        {item.status === "loading" && "Reading…"}
                        {item.status === "error" && item.error}
                        {item.status === "ready" && `${item.meta.width} × ${item.meta.height} · ${formatBytes(item.file.size)}`}
                      </p>
                    </div>
                  </div>
                )}
              />
            </section>

            <Card className="self-start">
              <CardHeader>
                <h2 className="font-semibold text-foreground">Page setup</h2>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <SegmentedControl label="Page size" value={pageSize} onChange={changed(setPageSize)} size="sm"
                  options={[{ value: "a4", label: "A4" }, { value: "letter", label: "Letter" }, { value: "original", label: "Image size" }]} />
                {pageSize !== "original" && (
                  <>
                    <SegmentedControl label="Orientation" value={orientation} onChange={changed(setOrientation)} size="sm"
                      options={[{ value: "auto", label: "Auto" }, { value: "portrait", label: "Portrait" }, { value: "landscape", label: "Landscape" }]} />
                    <SegmentedControl label="Image fit" value={fit} onChange={changed(setFit)} size="sm"
                      options={[{ value: "fit", label: "Fit to page" }, { value: "fill", label: "Fill page" }, { value: "original", label: "Original size" }]} />
                    <Slider id="img-pdf-margin" label="Margin" value={margin} min={0} max={72} step={3} onChange={changed(setMargin)}
                      valueLabel={`${Math.round((margin / 72) * 25.4)} mm`} />
                  </>
                )}
                {ready[0] && <LayoutPreview image={ready[0].meta} options={options} />}
                {hasProblems && items.some((i) => i.status === "error") && <p className="text-xs text-destructive">Remove the images marked in red to continue.</p>}
                <Button onClick={generate} disabled={!ready.length || hasProblems || task.isRunning} size="md">
                  <Combine className="h-4 w-4" aria-hidden="true" />
                  Create PDF
                </Button>
                {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Creating PDF…")} />}
              </CardContent>
            </Card>
          </div>
        )}

        {task.status === "error" && <ErrorMessage title="Couldn't create the PDF" message={task.error} />}
        {task.status === "done" && (
          <PdfResult blob={task.result.blob} filename="images.pdf" items={[{ label: "Pages", value: String(task.result.pages) }]}
            onReset={() => { task.reset(); list.clear(); }} />
        )}
      </div>
    </ToolLayout>
  );
}
