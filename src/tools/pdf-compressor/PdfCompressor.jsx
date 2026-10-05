import { useState } from "react";
import { ArrowRight, FileArchive, Info } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";
import { progressLabel, useTask } from "../../hooks/useTask.js";
import { appendToFilename, formatBytes } from "../../utils/file.js";
import { compressPdf } from "./compressPdf.js";
import { COMPRESSION_LEVELS, summarizeResult } from "./pdfCompressor.utils.js";

const tool = getToolById("pdf-compressor");

function CompressorWorkspace({ source }) {
  const [levelId, setLevelId] = useState("balanced");
  const level = COMPRESSION_LEVELS[levelId];
  const task = useTask();
  const summary = task.status === "done" ? summarizeResult(source.file.size, task.result.blob.size) : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-foreground">Compression level</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SegmentedControl
            value={levelId}
            onChange={(value) => {
              task.reset();
              setLevelId(value);
            }}
            options={Object.entries(COMPRESSION_LEVELS).map(([value, l]) => ({ value, label: `${l.label} · ${l.title}` }))}
            size="sm"
          />
          <p className="text-sm text-muted-foreground">{level.description}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => task.run((report) => compressPdf(source.bytes, level, report))} disabled={task.isRunning} size="md">
              <FileArchive className="h-4 w-4" aria-hidden="true" />
              Compress PDF
            </Button>
            {task.isRunning && <ProcessingIndicator label={progressLabel(task.progress, "Analyzing PDF…")} />}
          </div>
          <details className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
            <summary className="flex cursor-pointer items-center gap-1.5 font-medium text-foreground">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              What this can and can’t compress
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Compresses internal streams that were stored uncompressed and packs the file structure more tightly (all levels, lossless).</li>
              <li>Medium/High re-encode embedded JPEG photos (RGB or grayscale). Scanned documents and photo-heavy PDFs benefit most.</li>
              <li>Text stays selectable — pages are never turned into images.</li>
              <li>Fonts, vector graphics, CMYK images and non-JPEG images are kept as they are, so text-only PDFs usually shrink very little.</li>
            </ul>
          </details>
        </CardContent>
      </Card>

      {task.status === "error" && <ErrorMessage title="Compression failed" message={task.error} />}
      {summary && !summary.improved && (
        <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-foreground" role="status">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <div>
            <p className="font-medium">{summary.message}</p>
            <p className="mt-1 text-muted-foreground">
              {task.result.stats.jpegs === 0
                ? "It has no JPEG photos to recompress, and its structure is already compact. Your original file is the smallest version."
                : levelId === "lossless"
                  ? "Try Medium or High to recompress its photos."
                  : "Its photos are already compressed about as much as these settings allow. Your original file is the smallest version."}
            </p>
          </div>
        </div>
      )}
      {summary?.improved && (
        <PdfResult
          blob={task.result.blob}
          filename={appendToFilename(source.file.name, "-compressed", "pdf")}
          items={[
            {
              label: "Reduction",
              value: (
                <span className="inline-flex items-center gap-1">
                  {formatBytes(source.file.size)} <ArrowRight className="h-3 w-3" aria-hidden="true" /> −{summary.percent.toFixed(1)}%
                </span>
              ),
              tone: "success",
            },
            {
              label: "Changes",
              value: `${task.result.stats.recompressed} photo${task.result.stats.recompressed === 1 ? "" : "s"}, ${task.result.stats.streamsDeflated} stream${task.result.stats.streamsDeflated === 1 ? "" : "s"}`,
            },
          ]}
          onReset={task.reset}
          resetLabel="Try another level"
        />
      )}
    </div>
  );
}

export default function PdfCompressor() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <CompressorWorkspace key={source.id} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
