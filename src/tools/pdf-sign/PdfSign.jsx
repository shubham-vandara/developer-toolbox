import { useEffect, useMemo, useRef, useState } from "react";
import { Info, PenLine, Plus, Signature, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { OverlayBox } from "../../components/pdf/OverlayBox.jsx";
import { PageNavigator, PdfPageView } from "../../components/pdf/PdfPageView.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useHistory } from "../../hooks/useHistory.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { appendToFilename } from "../../utils/file.js";
import { exportWithElements } from "../../utils/pdf/annotations.js";
import { SignatureCreator } from "./SignatureCreator.jsx";

const tool = getToolById("pdf-sign");
let nextId = 0;

function SignWorkspace({ source }) {
  const [signature, setSignature] = useState(null);
  const [pageNumber, setPageNumber] = useState(source.pageCount);
  const [viewer, setViewer] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const placements = useHistory({});
  const task = useTask();
  const signatureUrl = useMemo(() => (signature ? URL.createObjectURL(new Blob([signature.bytes], { type: "image/png" })) : null), [signature]);
  useEffect(() => () => signatureUrl && URL.revokeObjectURL(signatureUrl), [signatureUrl]);
  // Placements own their image URLs (they must outlive signature changes and undo/redo).
  const placementUrls = useRef([]);
  useEffect(() => () => placementUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const onPage = placements.present[pageNumber] ?? [];
  const total = Object.values(placements.present).reduce((sum, list) => sum + list.length, 0);

  const edit = (fn, method = "apply") => {
    task.reset();
    placements[method]((all) => ({ ...all, [pageNumber]: fn(all[pageNumber] ?? []) }));
  };

  const place = () => {
    if (!signature || !viewer) return;
    const w = 0.3;
    const h = Math.min(0.3, (w * viewer.width * signature.ratio) / viewer.height);
    const id = `s${++nextId}`;
    const url = URL.createObjectURL(new Blob([signature.bytes], { type: "image/png" }));
    placementUrls.current.push(url);
    // Each placement keeps its own copy of the signature, so later changes don't affect it.
    edit((list) => [...list, { id, type: "image", x: 0.6, y: 0.78 - h / 2, w: (h * viewer.height) / signature.ratio / viewer.width, h, bytes: signature.bytes, url }]);
    setSelectedId(id);
  };

  const remove = (id) => {
    edit((list) => list.filter((p) => p.id !== id));
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-muted-foreground" role="note">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          This adds a <span className="font-medium text-foreground">visual electronic signature</span> (an image of your signature) to the PDF.
          It is not a certificate-based digital signature and doesn’t cryptographically prove identity or detect later changes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 lg:self-start">
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <PenLine className="h-4 w-4 text-primary" aria-hidden="true" />
                1. Create your signature
              </h2>
            </CardHeader>
            <CardContent>
              <SignatureCreator onReady={setSignature} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">2. Place it</h2>
              <p className="text-sm text-muted-foreground">Add it to the page shown, then drag to move and use the corner handle to resize.</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {signatureUrl && (
                <div className="flex h-20 items-center justify-center rounded-md border border-border bg-white p-2">
                  <img src={signatureUrl} alt="Your signature" className="max-h-full max-w-full" />
                </div>
              )}
              <Button onClick={place} disabled={!signature || !viewer} variant="secondary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add signature to page {pageNumber}
              </Button>
              {selectedId && (
                <Button variant="outline" onClick={() => remove(selectedId)}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete selected signature
                </Button>
              )}
              {total > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { task.reset(); placements.apply({}); setSelectedId(null); }}>
                  Clear all placements ({total})
                </Button>
              )}
              <Button onClick={() => task.run((report) => exportWithElements(source.bytes, placements.present, report))} disabled={!total || task.isRunning} size="md">
                <Signature className="h-4 w-4" aria-hidden="true" />
                Sign PDF
              </Button>
              {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Signing…")} />}
            </CardContent>
          </Card>
        </div>

        <section className="flex min-w-0 flex-col items-center gap-3" aria-label="Page preview">
          <PageNavigator pageNumber={pageNumber} pageCount={source.pageCount} onChange={(n) => { setPageNumber(n); setSelectedId(null); }} />
          <PdfPageView doc={source.doc} pageNumber={pageNumber} maxHeight={720} onPageInfo={(info) => setViewer(info.viewer)}
            overlayProps={{ "data-overlay-root": true, className: "absolute inset-0", onPointerDown: (e) => e.target === e.currentTarget && setSelectedId(null) }}>
            {onPage.map((p, index) => (
              <OverlayBox
                key={p.id}
                rect={p}
                label={`Signature ${index + 1} on page ${pageNumber}. Arrow keys move it, Alt+Shift+arrows resize, Delete removes it.`}
                selected={p.id === selectedId}
                onSelect={() => setSelectedId(p.id)}
                keepAspect
                onStart={placements.begin}
                onEnd={placements.commit}
                onChange={(next) => edit((list) => list.map((item) => (item.id === p.id ? { ...item, ...next } : item)), "preview")}
                onKeyDown={(event) => {
                  if (event.key === "Delete" || event.key === "Backspace") {
                    event.preventDefault();
                    remove(p.id);
                  }
                }}
              >
                <img src={p.url} alt="" draggable={false} className="pointer-events-none h-full w-full" />
              </OverlayBox>
            ))}
          </PdfPageView>
          <p className="text-xs text-muted-foreground">
            {total ? `${total} signature${total === 1 ? "" : "s"} placed.` : "No signatures placed yet."} The original file isn’t changed.
          </p>
        </section>
      </div>

      {task.status === "error" && <ErrorMessage title="Couldn't sign the PDF" message={task.error} />}
      {task.status === "done" && (
        <PdfResult blob={task.result} filename={appendToFilename(source.file.name, "-signed", "pdf")} items={[{ label: "Signatures", value: String(total) }]} onReset={task.reset} resetLabel="Keep editing" />
      )}
    </div>
  );
}

export default function PdfSign() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <SignWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
