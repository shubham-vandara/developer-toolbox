import { useMemo } from "react";
import { FileOutput } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { PageSelector } from "../../components/pdf/PageSelector.jsx";
import { PdfPageGrid } from "../../components/pdf/PdfPageGrid.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { usePageSelection } from "../../hooks/usePageSelection.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { buildFromPages, openForEdit, savePdf } from "../../utils/pdf/engine.js";
import { allPages, formatPageList } from "../../utils/pdf/pageRanges.js";

const tool = getToolById("pdf-page-extractor");

function ExtractorWorkspace({ source }) {
  const pageNumbers = useMemo(() => allPages(source.pageCount), [source.pageCount]);
  const items = useMemo(() => pageNumbers.map((n) => ({ key: n, pageNumber: n })), [pageNumbers]);
  const selection = usePageSelection(pageNumbers);
  const task = useTask();
  const pages = selection.list;

  const setPages = (next) => {
    task.reset();
    selection.set(next);
  };

  const extract = () =>
    task.run(async (report) => {
      report(0, 0, "Extracting pages…");
      const doc = await openForEdit(source.bytes);
      const out = await buildFromPages(doc, pages);
      return { blob: await savePdf(out), pages: [...pages] };
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4">
        <PageSelector id="extract-pages" label="Pages to extract" pageCount={source.pageCount} value={pages} onChange={setPages} />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={extract} disabled={!pages.length || task.isRunning} size="md">
            <FileOutput className="h-4 w-4" aria-hidden="true" />
            Extract {pages.length || ""} page{pages.length === 1 ? "" : "s"}
          </Button>
          {pages.length > 0 && <span className="text-sm text-muted-foreground">Pages selected: {formatPageList(pages)}</span>}
          {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress)} />}
        </div>
      </div>

      {task.status === "error" && <ErrorMessage title="Extraction failed" message={task.error} />}
      {task.status === "done" && (
        <PdfResult
          blob={task.result.blob}
          filename="extracted-pages.pdf"
          items={[
            { label: "Pages", value: String(task.result.pages.length) },
            { label: "From original", value: formatPageList(task.result.pages) },
          ]}
          onReset={task.reset}
          resetLabel="Pick different pages"
        />
      )}

      <section className="flex flex-col gap-3" aria-label="Select pages">
        <p className="text-sm text-muted-foreground">Click pages to select them. Shift+click selects a run of pages.</p>
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
  );
}

export default function PdfPageExtractor() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <ExtractorWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
