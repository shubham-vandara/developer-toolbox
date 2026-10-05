import { memo, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileInfo } from "../../components/common/FileInfo.jsx";
import { ImagePreview } from "../../components/common/ImagePreview.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { RASTER_MIMES, useImageFile } from "../../hooks/useImageFile.js";
import { downloadText, formatBytes, readFileAsDataUrl, replaceExtension } from "../../utils/file.js";
import { describeMime, RASTER_IMAGE_ACCEPT } from "../../utils/image.js";
import { formatOutput, OUTPUT_VIEWS, truncateForDisplay, withMime } from "./imageToBase64.utils.js";

const tool = getToolById("image-to-base64");
const MIMES = [...RASTER_MIMES, "image/svg+xml", "image/x-icon"];
const ACCEPT = `${RASTER_IMAGE_ACCEPT},image/svg+xml,.svg,image/x-icon,.ico`;
const HINT = "PNG, JPEG, WebP, GIF, SVG, ICO and more · up to 50 MB";

// Memoized so typing-free UI updates (e.g. toasts) never re-render huge text.
const OutputPanel = memo(function OutputPanel({ output, viewLabel, filename }) {
  const { showToast } = useToast();
  const display = useMemo(() => truncateForDisplay(output), [output]);

  return (
    <TextPanel
      id="base64-output"
      label={viewLabel}
      value={display.text}
      readOnly
      rows={10}
      className="[&_textarea]:break-all"
      stats={
        display.truncated
          ? `${output.length.toLocaleString()} characters · showing the first ${display.text.length - 1} — Copy and Download include everything`
          : `${output.length.toLocaleString()} characters`
      }
      actions={
        <div className="flex gap-2">
          <CopyButton text={output} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              downloadText(output, filename);
              showToast(`${filename} downloaded`);
            }}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            .txt
          </Button>
        </div>
      }
    />
  );
});

function Base64Workspace({ source }) {
  const [dataUrl, setDataUrl] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("dataUrl");

  useEffect(() => {
    let cancelled = false;
    readFileAsDataUrl(source.file)
      .then((result) => !cancelled && setDataUrl(withMime(result, source.mime)))
      .catch(() => !cancelled && setError("This file couldn't be read. Try selecting it again."));
    return () => {
      cancelled = true;
    };
  }, [source.file, source.mime]);

  const output = useMemo(
    () => (dataUrl ? formatOutput(dataUrl, view, { alt: "", width: source.width, height: source.height }) : ""),
    [dataUrl, view, source.width, source.height],
  );

  const base64Length = dataUrl ? dataUrl.length - dataUrl.indexOf(",") - 1 : 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-4">
        <ImagePreview src={source.url} alt="Uploaded image" label="Preview" imageClassName="max-h-64" />
        <FileInfo
          className="grid-cols-2 sm:grid-cols-2"
          items={[
            { label: "MIME type", value: source.mime },
            { label: "Dimensions", value: `${source.width} × ${source.height}` },
            { label: "File size", value: formatBytes(source.file.size) },
            { label: "Base64 size", value: dataUrl ? formatBytes(base64Length) : "…" },
          ]}
        />
        {source.file.size > 20 * 1024 && (
          <p className="text-xs text-muted-foreground">
            Base64 is about 33% larger than the original file. Inlining works best for small images like icons.
          </p>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <SegmentedControl label="Output" value={view} onChange={setView} options={OUTPUT_VIEWS} size="sm" />
        <p className="text-xs text-muted-foreground">
          {view === "dataUrl" && (
            <>
              Complete data URL, e.g. <code className="font-mono">data:{source.mime};base64,…</code> — use it directly in{" "}
              <code className="font-mono">src</code> or <code className="font-mono">url()</code>.
            </>
          )}
          {view === "base64" && "Only the Base64-encoded bytes, without the data: prefix — for APIs and JSON payloads."}
          {view === "css" && "A ready-to-paste CSS declaration."}
          {view === "html" && "A ready-to-paste <img> tag with the image's dimensions."}
        </p>
        {error ? (
          <ErrorMessage title="Couldn't encode this image" message={error} />
        ) : dataUrl ? (
          <OutputPanel
            output={output}
            viewLabel={OUTPUT_VIEWS.find((v) => v.value === view).label}
            filename={replaceExtension(source.file.name, `${describeMime(source.mime).toLowerCase()}.base64.txt`)}
          />
        ) : (
          <ProcessingIndicator label="Encoding…" />
        )}
      </div>
    </div>
  );
}

export default function ImageToBase64() {
  const source = useImageFile({ mimes: MIMES });

  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <ImageUpload source={source} accept={ACCEPT} hint={HINT} />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} accept={ACCEPT} />
          <Base64Workspace key={source.url} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
