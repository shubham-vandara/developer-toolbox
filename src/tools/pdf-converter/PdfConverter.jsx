import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRightLeft, Check, Minus, X } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileDropZone } from "../../components/common/FileDropZone.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { SortableFileList } from "../../components/common/SortableFileList.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload, PrivacyNote } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useFileList } from "../../hooks/useFileList.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { cn } from "../../utils/cn.js";
import { getUserMessage } from "../../utils/image.js";
import { getPdfErrorMessage } from "../../utils/pdf/engine.js";
import { buildImagesPdf } from "../../utils/pdf/imagesToPdf.js";
import { analyzeImageFile, IMAGE_ACCEPT, releaseImageItem } from "../../utils/pdf/imageInputs.js";
import { pdfToDocxImages, pdfToDocxText, pdfToImageFiles, pdfToPptx, pdfToXlsx } from "./convertPdf.js";

const tool = getToolById("pdf-converter");
const errorMessage = (error) => (error?.name === "ImageToolError" ? getUserMessage(error) : getPdfErrorMessage(error, "The conversion failed."));

const FROM_PDF = [
  { id: "docx-text", label: "Word – editable text", ext: "docx", keeps: "Text and paragraphs you can edit.", loses: "Layout, images, fonts and tables. Scanned PDFs have no text to extract.", run: pdfToDocxText },
  { id: "docx-images", label: "Word – page images", ext: "docx", keeps: "The exact look of every page.", loses: "Text isn’t editable (each page is a picture).", run: pdfToDocxImages },
  { id: "xlsx", label: "Excel", ext: "xlsx", keeps: "Text arranged into rows and columns, one sheet per page; numbers become numeric cells.", loses: "Formatting. Works best for simple tables; complex layouts may need tidying.", run: pdfToXlsx },
  { id: "pptx", label: "PowerPoint", ext: "pptx", keeps: "One slide per page with the exact look; page text goes into the speaker notes.", loses: "Slide content isn’t editable text.", run: pdfToPptx },
  { id: "jpeg", label: "JPG", ext: "jpg", keeps: "Each page as a 150 DPI image (ZIP for multi-page PDFs).", loses: "Text isn’t selectable.", image: true },
  { id: "png", label: "PNG", ext: "png", keeps: "Each page as a lossless 150 DPI image (ZIP for multi-page PDFs).", loses: "Text isn’t selectable; files are larger than JPG.", image: true },
];

const SUPPORT = [
  ["PDF → Word (DOCX)", "partial", "Editable text or exact page images"],
  ["PDF → Excel (XLSX)", "partial", "Table reconstruction from text"],
  ["PDF → PowerPoint (PPTX)", "yes", "Slides as page images + notes"],
  ["PDF → JPG / PNG", "yes", "150 DPI; more options in PDF to Images"],
  ["JPG / PNG → PDF", "yes", "More options in Images to PDF"],
  ["Word / Excel / PowerPoint → PDF", "no", "Needs a full Office layout engine — not possible reliably in a browser"],
];

function SupportBadge({ level }) {
  const map = {
    yes: { icon: Check, className: "text-success", label: "Supported" },
    partial: { icon: Minus, className: "text-warning", label: "Supported with limits" },
    no: { icon: X, className: "text-destructive", label: "Not available" },
  };
  const { icon: Icon, className, label } = map[level];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function FromPdf() {
  const source = usePdfFile();
  const [targetId, setTargetId] = useState("docx-text");
  const task = useTask({ getErrorMessage: errorMessage });
  const target = FROM_PDF.find((t) => t.id === targetId);
  const base = source.file?.name.replace(/\.pdf$/i, "") ?? "document";

  const convert = () =>
    task.run(async (report) => {
      if (target.image) return pdfToImageFiles(source.doc, target.id, base, report);
      return { blob: await target.run(source.doc, report), filename: `${base}.${target.ext}` };
    });

  if (source.status !== "ready") return <PdfUpload source={source} />;
  return (
    <div className="flex flex-col gap-5">
      <PdfSourceBar source={{ ...source, reset: () => { task.reset(); source.reset(); } }} />
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Convert to</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="Output format" className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FROM_PDF.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={t.id === targetId}
                onClick={() => { task.reset(); setTargetId(t.id); }}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  t.id === targetId ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                )}
              >
                <span className="block text-sm font-semibold text-foreground">{t.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">.{t.ext}{t.image && source.pageCount > 1 ? " in a .zip" : ""}</span>
              </button>
            ))}
          </div>
          <dl className="grid gap-2 rounded-md bg-muted/60 p-3 text-xs sm:grid-cols-2">
            <div><dt className="font-medium text-success">Keeps</dt><dd className="text-muted-foreground">{target.keeps}</dd></div>
            <div><dt className="font-medium text-warning">Doesn’t keep</dt><dd className="text-muted-foreground">{target.loses}</dd></div>
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={convert} disabled={task.isRunning} size="md">
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              Convert to {target.label.split(" – ")[0]}
            </Button>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Converting…")} />}
          </div>
        </CardContent>
      </Card>
      {task.status === "error" && <ErrorMessage title="Conversion not possible" message={task.error} />}
      {task.status === "done" && <PdfResult blob={task.result.blob} filename={task.result.filename} onReset={task.reset} resetLabel="Convert again" />}
    </div>
  );
}

function ToPdf() {
  const list = useFileList({ analyze: analyzeImageFile, release: releaseImageItem, getErrorMessage: (e) => getUserMessage(e, "This image couldn't be read.") });
  const task = useTask({ getErrorMessage: errorMessage });
  const ready = list.items.filter((i) => i.status === "ready");
  const add = useCallback((files) => { task.reset(); list.add(files); }, [list, task]);

  return (
    <div className="flex flex-col gap-5">
      <FileDropZone onFiles={add} multiple accept={IMAGE_ACCEPT} title="Drop JPG or PNG images to convert to PDF" hint="Each image becomes a page (fit to A4). For page size, margins and fit options use Images to PDF." className={list.items.length ? "py-6" : undefined} />
      {!list.items.length && <PrivacyNote />}
      {list.items.length > 0 && (
        <>
          <SortableFileList items={list.items} onMove={(a, b) => { task.reset(); list.move(a, b); }} onRemove={(id) => { task.reset(); list.remove(id); }} label="Images"
            renderItem={(item) => (
              <p className="truncate text-sm text-foreground" title={item.file.name}>
                {item.file.name}{" "}
                <span className={item.status === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                  {item.status === "error" ? item.error : item.status === "ready" ? `${item.meta.width} × ${item.meta.height}` : "Reading…"}
                </span>
              </p>
            )} />
          <div className="flex flex-wrap items-center gap-3">
            <Button size="md" disabled={!ready.length || ready.length !== list.items.length || task.isRunning}
              onClick={() => task.run(async (report) => ({ ...(await buildImagesPdf(ready.map((i) => ({ file: i.file, width: i.meta.width, height: i.meta.height })), { pageSize: "a4", orientation: "auto", fit: "fit", margin: 18 }, report)), filename: "converted.pdf" }))}>
              <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
              Convert to PDF
            </Button>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Converting…")} />}
          </div>
        </>
      )}
      {task.status === "error" && <ErrorMessage title="Conversion failed" message={task.error} />}
      {task.status === "done" && <PdfResult blob={task.result.blob} filename={task.result.filename} items={[{ label: "Pages", value: String(task.result.pages) }]} onReset={() => { task.reset(); list.clear(); }} />}
      <div className="rounded-lg border border-border bg-surface p-4 text-sm">
        <p className="font-medium text-foreground">Word, Excel and PowerPoint → PDF aren’t available</p>
        <p className="mt-1 text-muted-foreground">
          Turning Office files into PDFs faithfully requires a complete Office layout engine (fonts, pagination, tables, charts). No browser-only library does this reliably, and this tool never uploads your documents to a conversion server. Use “Save as PDF” / “Export to PDF” in Word, Excel, PowerPoint, LibreOffice or Google Docs instead.
        </p>
      </div>
    </div>
  );
}

export default function PdfConverter() {
  const [direction, setDirection] = useState("from");
  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <details className="rounded-lg border border-border bg-surface p-4">
          <summary className="cursor-pointer text-sm font-medium text-foreground">Which conversions are supported?</summary>
          <table className="mt-3 w-full text-left text-sm">
            <caption className="sr-only">Conversion support</caption>
            <tbody>
              {SUPPORT.map(([name, level, note]) => (
                <tr key={name} className="border-t border-border align-top">
                  <th scope="row" className="py-2 pr-3 font-medium text-foreground">{name}</th>
                  <td className="py-2 pr-3 whitespace-nowrap"><SupportBadge level={level} /></td>
                  <td className="hidden py-2 text-xs text-muted-foreground sm:table-cell">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">
            Need more control? Use <Link to="/tools/pdf-to-images" className="text-primary hover:underline">PDF to Images</Link> or{" "}
            <Link to="/tools/images-to-pdf" className="text-primary hover:underline">Images to PDF</Link>.
          </p>
        </details>
        <SegmentedControl value={direction} onChange={setDirection} options={[{ value: "from", label: "From PDF" }, { value: "to", label: "To PDF" }]} />
        {direction === "from" ? <FromPdf /> : <ToPdf />}
      </div>
    </ToolLayout>
  );
}
