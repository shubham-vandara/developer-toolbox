import { useMemo, useState } from "react";
import { Scissors } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { NumberField } from "../../components/common/NumberField.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { PdfPageGrid } from "../../components/pdf/PdfPageGrid.jsx";
import { ResultFiles } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { buildFromPages, openForEdit, savePdf, yieldToBrowser } from "../../utils/pdf/engine.js";
import { allPages, pagesInRange, rangeLabel } from "../../utils/pdf/pageRanges.js";
import { getSplitPlan } from "./pdfSplitter.utils.js";

const tool = getToolById("pdf-splitter");
const MAX_OUTPUT_FILES = 500;

function SplitterWorkspace({ source }) {
  const task = useTask();
  const [mode, setMode] = useState("ranges");
  const [rangesText, setRangesText] = useState(() => (source.pageCount > 1 ? `1-${Math.ceil(source.pageCount / 2)}, ${Math.ceil(source.pageCount / 2) + 1}-${source.pageCount}` : "1"));
  const [everyN, setEveryN] = useState(Math.min(2, source.pageCount));
  const plan = useMemo(
    () => getSplitPlan({ mode, rangesText, everyN, pageCount: source.pageCount }),
    [mode, rangesText, everyN, source.pageCount],
  );
  const included = useMemo(() => new Set(plan.success ? plan.ranges.flatMap(pagesInRange) : []), [plan]);
  const items = useMemo(() => allPages(source.pageCount).map((n) => ({ key: n, pageNumber: n })), [source.pageCount]);
  const tooMany = plan.success && plan.ranges.length > MAX_OUTPUT_FILES;

  const change = (setter) => (value) => {
    task.reset();
    setter(value);
  };

  const split = () =>
    task.run(async (report) => {
      const doc = await openForEdit(source.bytes);
      const files = [];
      for (let i = 0; i < plan.ranges.length; i += 1) {
        report(i, plan.ranges.length, "Creating file");
        const range = plan.ranges[i];
        const part = await buildFromPages(doc, pagesInRange(range));
        const count = range[1] - range[0] + 1;
        files.push({
          name: range[0] === range[1] ? `page-${range[0]}.pdf` : `pages-${rangeLabel(range)}.pdf`,
          blob: await savePdf(part),
          detail: `${count} page${count === 1 ? "" : "s"}`,
        });
        await yieldToBrowser();
      }
      return files;
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader>
            <h2 className="font-semibold text-foreground">How to split</h2>
            <p className="text-sm text-muted-foreground">Each part becomes its own PDF file.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SegmentedControl
              label="Split by"
              value={mode}
              onChange={change(setMode)}
              options={[
                { value: "ranges", label: "Page ranges" },
                { value: "every", label: "Every N pages" },
                { value: "each", label: "Every page" },
              ]}
              size="sm"
            />
            {mode === "ranges" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="split-ranges" className="text-sm font-medium text-foreground">
                  Ranges (one file per range)
                </label>
                <input
                  id="split-ranges"
                  value={rangesText}
                  onChange={(event) => change(setRangesText)(event.target.value)}
                  placeholder="1-3, 5, 8-10"
                  spellCheck={false}
                  aria-invalid={!plan.success || undefined}
                  className="h-9 rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">Separate files with commas, e.g. “1-3, 5, 8-10” makes three PDFs.</p>
              </div>
            )}
            {mode === "every" && (
              <NumberField id="split-every" label="Pages per file" value={everyN} onChange={change(setEveryN)} min={1} max={source.pageCount} />
            )}

            {plan.success ? (
              <div className="flex flex-col gap-1.5 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">
                  {plan.ranges.length} file{plan.ranges.length === 1 ? "" : "s"} will be created
                </p>
                <p className="line-clamp-3 font-mono">{plan.ranges.slice(0, 40).map(rangeLabel).join(" · ")}{plan.ranges.length > 40 ? " · …" : ""}</p>
              </div>
            ) : (
              <p className="text-xs text-destructive" role="alert">{plan.error}</p>
            )}
            {tooMany && <p className="text-xs text-destructive">That would create more than {MAX_OUTPUT_FILES} files. Use larger parts.</p>}

            <Button onClick={split} disabled={!plan.success || tooMany || task.isRunning} size="md">
              <Scissors className="h-4 w-4" aria-hidden="true" />
              Split PDF
            </Button>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Splitting…")} />}
          </CardContent>
        </Card>

        <section className="flex min-w-0 flex-col gap-3" aria-label="Page preview">
          <h2 className="text-sm font-medium text-foreground">Pages {plan.success && included.size < source.pageCount && <span className="font-normal text-muted-foreground">· dimmed pages aren't in any part</span>}</h2>
          <PdfPageGrid doc={source.doc} items={items} getTone={(item) => (plan.success && !included.has(item.pageNumber) ? "muted" : undefined)} />
        </section>
      </div>

      {task.status === "error" && <ErrorMessage title="Split failed" message={task.error} />}
      {task.status === "done" && <ResultFiles files={task.result} zipName={`${source.file.name.replace(/\.pdf$/i, "")}-split.zip`} onReset={task.reset} />}
    </div>
  );
}

export default function PdfSplitter() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <SplitterWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}

