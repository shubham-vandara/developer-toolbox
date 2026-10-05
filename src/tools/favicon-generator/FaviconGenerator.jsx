import { useState } from "react";
import { Info, Package } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent, CardHeader } from "../../components/common/Card.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { ColorInput } from "../../components/common/ColorInput.jsx";
import { DownloadButton } from "../../components/common/DownloadButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ImageSourceBar, ImageUpload } from "../../components/common/ImageUpload.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { Slider } from "../../components/common/Slider.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { useToast } from "../../components/common/Toast.jsx";
import { getToolById } from "../../data/tools.js";
import { useImageFile } from "../../hooks/useImageFile.js";
import { useImageProcessing } from "../../hooks/useImageProcessing.js";
import { useObjectUrl } from "../../hooks/useObjectUrl.js";
import { downloadBlob, formatBytes } from "../../utils/file.js";
import { canvasToBlob, createCanvas, drawToCanvas, encodeIco, releaseCanvas } from "../../utils/image.js";
import { createZip } from "../../utils/zip.js";
import { buildHtmlTags, buildManifest, FAVICON_FILES, getIconLayout, ICO_SIZES } from "./faviconGenerator.utils.js";

const tool = getToolById("favicon-generator");
const HTML_TAGS = buildHtmlTags();

async function renderIcon(image, size, { mode, padding, background }) {
  const layout = getIconLayout(image.naturalWidth, image.naturalHeight, size, { mode, padding });
  const art = drawToCanvas(image, layout.dw, layout.dh, { crop: layout.crop });
  const { canvas, ctx } = createCanvas(size, size);
  try {
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(art, layout.dx, layout.dy);
    return await canvasToBlob(canvas, "image/png");
  } finally {
    releaseCanvas(art);
    releaseCanvas(canvas);
  }
}

async function generateFavicons(image, options) {
  const background = options.transparent ? undefined : options.background;
  const files = [];
  for (const file of FAVICON_FILES) {
    // iOS shows transparent touch icons on black, so they always get a background.
    const fill = file.opaque ? options.background : background;
    files.push({ ...file, blob: await renderIcon(image, file.size, { ...options, background: fill }) });
  }
  const icoEntries = await Promise.all(
    ICO_SIZES.map(async (size) => ({
      size,
      bytes: new Uint8Array(await files.find((file) => file.size === size).blob.arrayBuffer()),
    })),
  );
  return { files, ico: encodeIco(icoEntries) };
}

function IconTile({ file }) {
  const url = useObjectUrl(file.blob);
  // Tiny icons are shown at 2× (pixelated) so they're inspectable; big ones are capped.
  const display = file.size < 48 ? file.size * 2 : Math.min(file.size, 96);
  return (
    <li className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-3 text-center">
      <div className="bg-checkerboard flex h-28 w-full items-center justify-center rounded-md">
        {url && (
          <img
            src={url}
            alt={`${file.size}×${file.size} icon`}
            width={display}
            height={display}
            className={file.size < 48 ? "[image-rendering:pixelated]" : undefined}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {file.size}×{file.size}
        </p>
        <p className="truncate text-xs text-muted-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {file.purpose} · {formatBytes(file.blob.size)}
        </p>
      </div>
      <DownloadButton blob={file.blob} filename={file.name} label="PNG" variant="outline" />
    </li>
  );
}

function FaviconWorkspace({ source }) {
  const { showToast } = useToast();
  const [mode, setMode] = useState(() => (source.width === source.height ? "fit" : "crop"));
  const [padding, setPadding] = useState(0);
  const [transparent, setTransparent] = useState(true);
  const [background, setBackground] = useState("#ffffff");

  const output = useImageProcessing(
    () => generateFavicons(source.image, { mode, padding: padding / 100, transparent, background }),
    [source.image, mode, padding, transparent, background],
    { delay: 250 },
  );
  const result = output.result;

  const downloadAll = async () => {
    const manifest = buildManifest({ backgroundColor: background, themeColor: background });
    const entries = await Promise.all(
      result.files.map(async (file) => ({ name: file.name, data: new Uint8Array(await file.blob.arrayBuffer()) })),
    );
    const zip = createZip([
      ...entries,
      { name: "favicon.ico", data: new Uint8Array(await result.ico.arrayBuffer()) },
      { name: "site.webmanifest", data: manifest },
      { name: "favicon-tags.html", data: `${HTML_TAGS}\n` },
    ]);
    downloadBlob(new Blob([zip], { type: "application/zip" }), "favicons.zip");
    showToast("favicons.zip downloaded");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Icon settings</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SegmentedControl
              label="Shape"
              value={mode}
              onChange={setMode}
              options={[
                { value: "crop", label: "Crop to square" },
                { value: "fit", label: "Fit whole image" },
              ]}
              size="sm"
            />
            <Slider id="favicon-padding" label="Padding" value={padding} min={0} max={25} onChange={setPadding} valueLabel={`${padding}%`} />
            <div className="flex flex-col gap-3">
              <Checkbox id="favicon-transparent" checked={transparent} onChange={setTransparent} label="Transparent background" />
              <ColorInput
                id="favicon-background"
                label={transparent ? "Background (Apple touch icon only)" : "Background color"}
                value={background}
                onChange={setBackground}
              />
            </div>
            {source.width < 512 && (
              <p className="flex gap-1.5 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Your image is {source.width}×{source.height}. Use at least 512×512 for crisp large icons.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          {output.status === "error" ? (
            <ErrorMessage title="Couldn't generate favicons" message={output.error} />
          ) : result ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {result.files.map((file) => (
                <IconTile key={file.name} file={file} />
              ))}
            </ul>
          ) : (
            <ProcessingIndicator label="Generating icons…" />
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={downloadAll} disabled={output.status !== "done"} size="sm">
              <Package className="h-3.5 w-3.5" aria-hidden="true" />
              Download all (.zip)
            </Button>
            <DownloadButton
              blob={output.status === "done" ? result?.ico : null}
              filename="favicon.ico"
              label={`favicon.ico${result ? ` · ${formatBytes(result.ico.size)}` : ""}`}
              variant="outline"
            />
            {output.status === "processing" && result && <ProcessingIndicator label="Updating…" />}
          </div>
          <p className="text-xs text-muted-foreground">
            The ZIP contains every PNG, a multi-size favicon.ico (16, 32, 48), site.webmanifest and the HTML tags below.
          </p>
        </div>
      </div>

      <TextPanel
        id="favicon-html"
        label="HTML — paste into your <head>"
        value={HTML_TAGS}
        readOnly
        rows={5}
        stats="Place the files at your site root, or adjust the paths."
        actions={<CopyButton text={HTML_TAGS} />}
      />
    </div>
  );
}

export default function FaviconGenerator() {
  const source = useImageFile();

  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <ImageUpload source={source} hint="A square image of 512×512 or larger works best · PNG, JPEG, WebP, GIF, BMP or AVIF" />
      ) : (
        <div className="flex flex-col gap-6">
          <ImageSourceBar source={source} />
          <FaviconWorkspace key={source.url} source={source} />
        </div>
      )}
    </ToolLayout>
  );
}
