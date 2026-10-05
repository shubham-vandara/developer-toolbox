import { useState } from "react";
import { ListOrdered } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ColorInput } from "../../components/common/ColorInput.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { NumberField } from "../../components/common/NumberField.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { Select } from "../../components/common/Select.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { PageScope } from "../../components/pdf/PageScope.jsx";
import { PageNavigator, PdfPageView } from "../../components/pdf/PdfPageView.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { usePageScope } from "../../hooks/usePageScope.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { appendToFilename } from "../../utils/file.js";
import { loadPdfLib, openForEdit, savePdf } from "../../utils/pdf/engine.js";
import { formatPageNumber, PAGE_NUMBER_FORMATS } from "../../utils/pdf/geometry.js";
import { assertEncodable, drawTextAt, hexToRgb01, pageGeometry } from "../../utils/pdf/stamp.js";
import { NUMBER_POSITIONS, numberCenter, planPageNumbers } from "./pdfPageNumberer.utils.js";

const tool = getToolById("pdf-page-numberer");
const MARGIN = 28;

function NumbererWorkspace({ source }) {
  const [position, setPosition] = useState("bottom-center");
  const [format, setFormat] = useState("Page {n} of {total}");
  const [startPage, setStartPage] = useState(1);
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [color, setColor] = useState("#333333");
  const [previewPage, setPreviewPage] = useState(1);
  const [viewer, setViewer] = useState(null);
  const scope = usePageScope(source.pageCount);
  const task = useTask();
  const validStart = Number.isInteger(startPage) && startPage >= 1 && startPage <= source.pageCount && Number.isInteger(startNumber) && startNumber >= 0;
  const { plan, total } = planPageNumbers({ pages: scope.pages, startPage: validStart ? startPage : 1, startNumber: validStart ? startNumber : 1 });
  const previewEntry = plan.find((entry) => entry.page === previewPage);
  const changed = (setter) => (value) => {
    task.reset();
    setter(value);
  };

  const apply = () =>
    task.run(async (report) => {
      const lib = await loadPdfLib();
      const doc = await openForEdit(source.bytes);
      const font = await doc.embedFont(lib.StandardFonts.Helvetica);
      assertEncodable(font, formatPageNumber(format, 0, 0));
      const pages = doc.getPages();
      const rgb = hexToRgb01(color);
      plan.forEach((entry, i) => {
        if (i % 50 === 0) report(i, plan.length, "Numbering page");
        const page = pages[entry.page - 1];
        const label = formatPageNumber(format, entry.number, total);
        const { viewer: pageViewer } = pageGeometry(page);
        const center = numberCenter(position, pageViewer, font.widthOfTextAtSize(label, fontSize), fontSize, MARGIN);
        drawTextAt(page, label, { center, font, size: fontSize, color: rgb }, lib);
      });
      report(0, 0, "Saving PDF…");
      return { blob: await savePdf(doc), count: plan.length };
    });

  const previewLabel = previewEntry ? formatPageNumber(format, previewEntry.number, total) : null;
  const previewCenter = previewLabel && viewer ? numberCenter(position, viewer, previewLabel.length * fontSize * 0.5, fontSize, MARGIN) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader>
            <h2 className="font-semibold text-foreground">Page numbers</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Select id="pn-position" label="Position" value={position} onChange={changed(setPosition)} options={NUMBER_POSITIONS} />
            <Select id="pn-format" label="Format" value={format} onChange={changed(setFormat)} options={PAGE_NUMBER_FORMATS} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField id="pn-start-page" label="Start on page" value={startPage} onChange={changed(setStartPage)} min={1} max={source.pageCount} />
              <NumberField id="pn-start-number" label="First number" value={startNumber} onChange={changed(setStartNumber)} min={0} />
            </div>
            {!validStart && <p className="text-xs text-destructive">Start page must be 1–{source.pageCount}, and the first number 0 or more.</p>}
            <Slider id="pn-size" label="Font size" value={fontSize} min={6} max={36} onChange={changed(setFontSize)} valueLabel={`${fontSize} pt`} />
            <ColorInput id="pn-color" label="Color" value={color} onChange={changed(setColor)} />
            <PageScope scope={scope} id="pn-pages" label="Pages that get numbers" onChange={task.reset} />
            <p className="text-xs text-muted-foreground">
              {plan.length
                ? `${plan.length} page${plan.length === 1 ? "" : "s"} numbered ${plan[0].number}–${total}.`
                : "No pages will be numbered with these settings."}
            </p>
            <Button onClick={apply} disabled={!plan.length || !validStart || task.isRunning} size="md">
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
              Add page numbers
            </Button>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress)} />}
          </CardContent>
        </Card>

        <section className="flex min-w-0 flex-col items-center gap-3" aria-label="Preview">
          <PageNavigator pageNumber={previewPage} pageCount={source.pageCount} onChange={setPreviewPage} />
          <PdfPageView doc={source.doc} pageNumber={previewPage} maxHeight={620} onPageInfo={(info) => setViewer(info.viewer)}>
            {previewCenter && (
              <svg viewBox={`0 0 ${viewer.width} ${viewer.height}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <text x={previewCenter.x} y={viewer.height - previewCenter.y + fontSize * 0.35} textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontSize={fontSize} fill={color}>
                  {previewLabel}
                </text>
              </svg>
            )}
          </PdfPageView>
          <p className="text-xs text-muted-foreground">{previewLabel ? `This page will show “${previewLabel}”.` : "This page won’t get a number."}</p>
        </section>
      </div>

      {task.status === "error" && <ErrorMessage title="Couldn't add page numbers" message={task.error} />}
      {task.status === "done" && (
        <PdfResult blob={task.result.blob} filename={appendToFilename(source.file.name, "-numbered", "pdf")}
          items={[{ label: "Pages numbered", value: String(task.result.count) }]} onReset={task.reset} resetLabel="Change settings" />
      )}
    </div>
  );
}

export default function PdfPageNumberer() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <NumbererWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
