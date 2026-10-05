import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ImagePlus, ShieldCheck, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { getToolById } from "../../data/tools.js";
import { formatBytes } from "../../utils/file.js";
import { describeMime, extensionForMime, getUserMessage, ImageToolError, loadImage } from "../../utils/image.js";
import { parseBase64Image } from "./base64ToImage.utils.js";

const tool = getToolById("base64-to-image");
const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#3b82f6"/><path d="M18 33l9 9 19-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SAMPLE = `data:image/svg+xml;base64,${btoa(SAMPLE_SVG)}`;
const IDLE = { status: "idle" };

export default function Base64ToImage() {
  const [input, setInput] = useState("");
  // Decoding megabytes of Base64 shouldn't block typing or pasting.
  const deferredInput = useDeferredValue(input);
  const parsed = useMemo(() => (deferredInput.trim() ? parseBase64Image(deferredInput) : null), [deferredInput]);
  const [image, setImage] = useState(IDLE);

  useEffect(() => {
    if (!parsed?.success) {
      setImage(IDLE);
      return undefined;
    }
    let cancelled = false;
    let url = null;
    setImage((prev) => ({ ...prev, status: "loading" }));

    (async () => {
      try {
        let blob;
        let removedCount = 0;
        if (parsed.mime === "image/svg+xml") {
          // SVG is untrusted: sanitize it (sanitizer is loaded only when needed).
          const { sanitizeSvg, svgToBlob } = await import("../../utils/svg.js");
          const result = sanitizeSvg(new TextDecoder().decode(parsed.bytes));
          if (!result.success) throw new ImageToolError(result.error);
          blob = svgToBlob(result.svg);
          removedCount = result.removedCount;
        } else {
          blob = new Blob([parsed.bytes], { type: parsed.mime });
        }
        url = URL.createObjectURL(blob);
        const img = await loadImage(url, { verifyDecode: parsed.mime !== "image/svg+xml" });
        if (cancelled) return;
        setImage({ status: "ready", blob, url, width: img.naturalWidth, height: img.naturalHeight, removedCount });
      } catch (error) {
        if (!cancelled) {
          setImage({
            status: "error",
            error: getUserMessage(
              error,
              "The data decoded, but your browser couldn't display it. It may be corrupted or truncated.",
            ),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [parsed]);

  const error = parsed && !parsed.success ? parsed.error : image.status === "error" ? image.error : null;

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <TextPanel
            id="base64-image-input"
            label="Base64 or data URL"
            value={input}
            onChange={setInput}
            placeholder="data:image/png;base64,iVBORw0KGgo… or just the Base64 part"
            rows={14}
            className="[&_textarea]:break-all"
            invalid={Boolean(error)}
            stats={`${input.length.toLocaleString()} characters`}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => setInput("")} variant="outline" size="sm" disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
            {!input && (
              <Button onClick={() => setInput(SAMPLE)} variant="ghost" size="sm">
                Load sample
              </Button>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {error ? (
            <ErrorMessage title="Can't show this image" message={error} />
          ) : image.status === "idle" && !parsed ? (
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Image</p>
              <EmptyState icon={ImagePlus} title="Nothing to decode yet" description="Paste Base64 or a data URL to preview the image." />
            </div>
          ) : image.url ? (
            <>
              <ImagePreview src={image.url} alt="Decoded image" label="Image" />
              {parsed?.warning && (
                <div className="flex gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                  {parsed.warning}
                </div>
              )}
              {image.removedCount > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                  Removed {image.removedCount} unsafe item{image.removedCount === 1 ? "" : "s"} (scripts, event handlers or external links) from this SVG.
                </p>
              )}
              {parsed?.success && (
                <FileInfo
                  items={[
                    { label: "Type", value: `${describeMime(parsed.mime)} (${parsed.mime})` },
                    { label: "Dimensions", value: `${image.width} × ${image.height}` },
                    { label: "Decoded size", value: formatBytes(parsed.bytes.length) },
                    { label: "Base64 length", value: deferredInput.trim().length.toLocaleString() },
                  ]}
                />
              )}
              <div>
                <DownloadButton
                  blob={image.status === "ready" ? image.blob : null}
                  filename={`image.${extensionForMime(parsed?.mime)}`}
                  label="Download image"
                />
              </div>
            </>
          ) : (
            <ProcessingIndicator label="Decoding…" />
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
