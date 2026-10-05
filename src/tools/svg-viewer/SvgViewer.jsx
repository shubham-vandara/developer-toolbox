import { useMemo, useState } from "react";
import { Maximize, ShieldCheck, SquareCode, ZoomIn, ZoomOut } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { SelectedFile } from "../../components/common/SelectedFile.jsx";
import { SVG_ACCEPT, SVG_SAMPLE, SvgSourceInput } from "../../components/common/SvgSourceInput.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { getToolById } from "../../data/tools.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { useSvgSource } from "../../hooks/useSvgSource.js";
import { cn } from "../../utils/cn.js";
import { formatBytes, replaceExtension } from "../../utils/file.js";
import { nextZoom, ZOOM_STEPS } from "./svgViewer.utils.js";

const tool = getToolById("svg-viewer");
const BACKGROUNDS = {
  grid: "bg-checkerboard",
  light: "bg-white",
  dark: "bg-neutral-900",
};

export default function SvgViewer() {
  const svg = useSvgSource();
  const previewUrl = useObjectUrl(svg.blob);
  const [zoom, setZoom] = useState(null); // null = fit to the preview area
  const [background, setBackground] = useState("grid");
  const { result } = svg;
  const sourceBytes = useMemo(() => new Blob([svg.text]).size, [svg.text]);

  const clear = () => {
    svg.reset();
    setZoom(null);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        {svg.text ? (
          <SelectedFile
            name={svg.fileName ?? "Pasted SVG markup"}
            details={[
              "SVG",
              result?.success && `${result.info.width} × ${result.info.height}`,
              formatBytes(sourceBytes),
            ]}
            accept={SVG_ACCEPT}
            onReplace={svg.loadFile}
            onClear={clear}
          />
        ) : (
          <SvgSourceInput svg={svg} />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="flex min-w-0 flex-col gap-3" aria-label="Preview">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-foreground">Preview</h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(nextZoom(zoom, -1))}
                  disabled={!previewUrl || zoom === ZOOM_STEPS[0]}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" aria-hidden="true" />
                </Button>
                <span className="w-12 text-center text-sm tabular-nums text-muted-foreground" aria-live="polite">
                  {zoom ? `${Math.round(zoom * 100)}%` : "Fit"}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(nextZoom(zoom, 1))}
                  disabled={!previewUrl || zoom === ZOOM_STEPS.at(-1)}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setZoom(null)} disabled={!previewUrl || zoom === null}>
                  <Maximize className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset
                </Button>
              </div>
            </div>

            {svg.text && result && !result.success ? (
              <ErrorMessage title="Invalid SVG" message={result.error} detail={result.detail} />
            ) : previewUrl && result?.success ? (
              <>
                <div
                  className={cn(
                    "flex max-h-128 min-h-64 overflow-auto rounded-lg border border-border p-4",
                    BACKGROUNDS[background],
                  )}
                >
                  {/* Rendering through <img> means the SVG can never run scripts or load resources. */}
                  <img
                    src={previewUrl}
                    alt="SVG preview"
                    className={cn("m-auto", zoom ? "max-w-none" : "max-h-120 max-w-full")}
                    style={zoom ? { width: result.info.width * zoom, height: result.info.height * zoom } : undefined}
                  />
                </div>
                <SegmentedControl
                  label="Background"
                  value={background}
                  onChange={setBackground}
                  options={[
                    { value: "grid", label: "Transparent" },
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                  size="sm"
                />
              </>
            ) : (
              <EmptyState icon={SquareCode} title="No SVG yet" description="Upload an .svg file or paste markup to preview it." />
            )}
          </section>

          <div className="flex min-w-0 flex-col gap-3">
            <TextPanel
              id="svg-source"
              label="Source"
              value={svg.text}
              onChange={svg.setText}
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">…</svg>'
              rows={16}
              invalid={Boolean(result && !result.success)}
              actions={
                svg.text ? (
                  <CopyButton text={svg.text} label="Copy source" />
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => svg.setText(SVG_SAMPLE)}>
                    Load sample
                  </Button>
                )
              }
            />
          </div>
        </div>

        {result?.success && (
          <>
            <FileInfo
              items={[
                { label: "Rendered size", value: `${result.info.width} × ${result.info.height} px` },
                { label: "width / height", value: `${result.info.widthAttr ?? "—"} / ${result.info.heightAttr ?? "—"}` },
                { label: "viewBox", value: result.info.viewBoxAttr ?? "none" },
                { label: "Elements", value: result.info.elementCount.toLocaleString() },
              ]}
            />
            <div className="flex flex-wrap items-center gap-3">
              <DownloadButton
                blob={svg.blob}
                filename={replaceExtension(svg.fileName ?? "image.svg", "svg")}
                label="Download sanitized SVG"
              />
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                {result.removedCount > 0
                  ? `Removed ${result.removedCount} unsafe item${result.removedCount === 1 ? "" : "s"} (scripts, event handlers, external links).`
                  : "No unsafe content found."}
              </p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
