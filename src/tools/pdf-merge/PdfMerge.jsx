import { useCallback } from "react";
import { ChevronRight, FileText, Merge, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileDropZone } from "../../components/common/FileDropZone.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SortableFileList } from "../../components/common/SortableFileList.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PrivacyNote } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useFileList } from "../../hooks/useFileList.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { formatBytes } from "../../utils/file.js";
import {
  closeRenderDoc,
  getPdfErrorMessage,
  loadPdfLib,
  openForEdit,
  openForRender,
  PDF_ACCEPT,
  readPdfFile,
  savePdf,
  yieldToBrowser,
} from "../../utils/pdf/engine.js";

const tool = getToolById("pdf-merge");

async function analyzePdf(file) {
  const bytes = await readPdfFile(file);
  const doc = await openForRender(bytes);
  const pages = doc.numPages;
  await closeRenderDoc(doc);
  return { pages };
}

function analyzeError(error) {
  const message = getPdfErrorMessage(error, "This PDF couldn't be read.");
  return error?.code === "password" ? `${message} Unlock it first with Protect & Unlock PDF.` : message;
}

export default function PdfMerge() {
  const list = useFileList({ analyze: analyzePdf, getErrorMessage: analyzeError });
  const task = useTask();
  const { items } = list;
  const ready = items.filter((item) => item.status === "ready");
  const hasProblems = items.some((item) => item.status !== "ready");
  const totalPages = ready.reduce((sum, item) => sum + item.meta.pages, 0);

  // Any change to the list makes a previous result stale.
  const add = useCallback((files) => { task.reset(); list.add(files); }, [list, task]);
  const remove = (id) => { task.reset(); list.remove(id); };
  const move = (from, to) => { task.reset(); list.move(from, to); };
  const clear = () => { task.reset(); list.clear(); };

  const merge = () =>
    task.run(async (report) => {
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();
      for (let i = 0; i < items.length; i += 1) {
        report(i, items.length, "Merging file");
        // Re-read each file now rather than keeping every PDF in memory.
        const doc = await openForEdit(await readPdfFile(items[i].file));
        const pages = await out.copyPages(doc, doc.getPageIndices());
        pages.forEach((page) => out.addPage(page));
        await yieldToBrowser();
      }
      report(0, 0, "Saving merged PDF…");
      return { blob: await savePdf(out), pages: out.getPageCount() };
    });

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <FileDropZone
          onFiles={add}
          multiple
          accept={PDF_ACCEPT}
          title={items.length ? "Add more PDFs" : "Drop PDF files here or click to browse"}
          hint="Select two or more PDFs. You can add more at any time."
          className={items.length ? "py-6" : undefined}
        />
        {!items.length && <PrivacyNote />}

        {items.length > 0 && (
          <section className="flex flex-col gap-3" aria-label="Files to merge">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-foreground">
                {items.length} file{items.length === 1 ? "" : "s"} · {totalPages} page{totalPages === 1 ? "" : "s"}
              </h2>
              <Button variant="ghost" size="sm" onClick={clear}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Clear all
              </Button>
            </div>
            <SortableFileList
              items={items}
              onMove={move}
              onRemove={remove}
              label="PDF files in merge order"
              renderItem={(item) => (
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground" title={item.file.name}>
                      {item.file.name}
                    </p>
                    <p className={item.status === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                      {item.status === "loading" && "Reading…"}
                      {item.status === "error" && item.error}
                      {item.status === "ready" && `${item.meta.pages} page${item.meta.pages === 1 ? "" : "s"} · ${formatBytes(item.file.size)}`}
                    </p>
                  </div>
                </div>
              )}
            />

            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Merge order">
              {items.map((item, index) => (
                <li key={item.id} className="flex items-center gap-1">
                  <span className="max-w-40 truncate rounded bg-muted px-2 py-0.5 text-foreground">{index + 1}. {item.file.name}</span>
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </li>
              ))}
              <li className="font-medium text-primary">Merged PDF</li>
            </ol>

            {hasProblems && items.some((item) => item.status === "error") && (
              <ErrorMessage title="Some files can't be merged" message="Remove the files marked in red to continue." />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={merge} disabled={items.length < 2 || hasProblems || task.isRunning} size="md">
                <Merge className="h-4 w-4" aria-hidden="true" />
                Merge {items.length} PDFs
              </Button>
              {items.length === 1 && <span className="text-xs text-muted-foreground">Add at least one more PDF to merge.</span>}
              {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Merging…")} />}
            </div>
          </section>
        )}

        {task.status === "error" && <ErrorMessage title="Merge failed" message={task.error} />}
        {task.status === "done" && (
          <PdfResult
            blob={task.result.blob}
            filename="merged.pdf"
            items={[
              { label: "Pages", value: String(task.result.pages) },
              { label: "Files merged", value: String(items.length) },
            ]}
            onReset={clear}
          />
        )}
      </div>
    </ToolLayout>
  );
}
