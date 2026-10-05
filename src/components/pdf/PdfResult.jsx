import { CheckCircle2, Package, RotateCcw } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { DownloadButton } from "../common/DownloadButton.jsx";
import { FileInfo } from "../common/FileInfo.jsx";
import { useToast } from "../common/Toast.jsx";
import { downloadBlob, formatBytes } from "../../utils/file.js";
import { createZip } from "../../utils/zip.js";

// Consistent "done" panel for tools that produce one file.
export function PdfResult({ blob, filename, items = [], onReset, resetLabel = "Start over", children }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-success/30 bg-success/5 p-4" aria-live="polite">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
        Your file is ready
      </h2>
      <FileInfo items={[{ label: "File", value: filename }, { label: "Size", value: formatBytes(blob.size) }, ...items]} />
      {children}
      <div className="flex flex-wrap gap-2">
        <DownloadButton blob={blob} filename={filename} label={`Download ${filename}`} size="md" />
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {resetLabel}
          </Button>
        )}
      </div>
    </section>
  );
}

// List of generated files with per-file downloads and a ZIP of everything.
export function ResultFiles({ files, zipName = "files.zip", onReset, renderPreview }) {
  const { showToast } = useToast();
  const total = files.reduce((sum, file) => sum + file.blob.size, 0);

  const downloadAll = async () => {
    const entries = await Promise.all(files.map(async (file) => ({ name: file.name, data: new Uint8Array(await file.blob.arrayBuffer()) })));
    downloadBlob(new Blob([createZip(entries)], { type: "application/zip" }), zipName);
    showToast(`${zipName} downloaded`);
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-success/30 bg-success/5 p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
          {files.length} file{files.length === 1 ? "" : "s"} ready · {formatBytes(total)}
        </h2>
        <div className="flex flex-wrap gap-2">
          {files.length > 1 && (
            <Button onClick={downloadAll}>
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Download all (.zip)
            </Button>
          )}
          {onReset && (
            <Button variant="outline" onClick={onReset}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Start over
            </Button>
          )}
        </div>
      </div>
      <ul className={renderPreview ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "flex flex-col gap-2"}>
        {files.map((file) => (
          <li key={file.name} className="flex min-w-0 flex-col gap-2 rounded-md border border-border bg-surface p-2.5">
            {renderPreview?.(file)}
            <div className="flex min-w-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[file.detail, formatBytes(file.blob.size)].filter(Boolean).join(" · ")}
                </p>
              </div>
              <DownloadButton blob={file.blob} filename={file.name} label="" variant="outline" className="shrink-0 px-2.5" aria-label={`Download ${file.name}`} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
