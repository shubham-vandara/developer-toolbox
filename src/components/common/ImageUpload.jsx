import { describeMime, RASTER_IMAGE_ACCEPT } from "../../utils/image.js";
import { formatBytes } from "../../utils/file.js";
import { ErrorMessage } from "./ErrorMessage.jsx";
import { FileDropZone } from "./FileDropZone.jsx";
import { ProcessingIndicator } from "./ProcessingIndicator.jsx";
import { SelectedFile } from "./SelectedFile.jsx";

const DEFAULT_HINT = "PNG, JPEG, WebP, GIF, BMP or AVIF · up to 50 MB";

// Upload step for image tools, driven by the state returned from useImageFile().
export function ImageUpload({ source, accept = RASTER_IMAGE_ACCEPT, title = "Drop an image here or click to browse", hint = DEFAULT_HINT }) {
  return (
    <div className="flex flex-col gap-4">
      <FileDropZone onFile={source.load} accept={accept} title={title} hint={hint} disabled={source.status === "loading"} />
      {source.status === "loading" && <ProcessingIndicator label="Opening image…" />}
      {source.status === "error" && <ErrorMessage title="Couldn't open this file" message={source.error} />}
    </div>
  );
}

// The loaded image's summary bar (name, format, size) with Replace and Clear.
export function ImageSourceBar({ source, accept = RASTER_IMAGE_ACCEPT, onClear }) {
  return (
    <SelectedFile
      name={source.file.name}
      thumbnailUrl={source.url}
      details={[
        describeMime(source.mime),
        `${source.width.toLocaleString()} × ${source.height.toLocaleString()} px`,
        formatBytes(source.file.size),
      ]}
      accept={accept}
      onReplace={source.load}
      onClear={onClear ?? source.reset}
    />
  );
}
