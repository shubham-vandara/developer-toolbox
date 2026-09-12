import { useEffect, useState } from "react";
import { Download, QrCode } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { Select } from "../../components/common/Select.jsx";
import { getToolById } from "../../data/tools.js";
import { generateQrCodeDataUrl } from "./qrCode.utils.js";

const tool = getToolById("qr-code");
const SIZE_OPTIONS = [128, 256, 512];

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export default function QrCodeGenerator() {
  const [text, setText] = useState("");
  const [size, setSize] = useState(256);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!text.trim()) {
      setResult(null);
      return;
    }
    let cancelled = false;
    generateQrCodeDataUrl(text, { size }).then((r) => {
      if (!cancelled) setResult(r);
    });
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-60 flex-1">
            <label htmlFor="qr-text" className="mb-1.5 block text-sm font-medium text-foreground">
              Text or URL
            </label>
            <input
              id="qr-text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="https://example.com"
              className="h-10 w-full rounded-md border border-input bg-surface px-3.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Select
            id="qr-size"
            label="Size"
            value={String(size)}
            onChange={(v) => setSize(Number(v))}
            options={SIZE_OPTIONS.map((s) => ({ value: String(s), label: `${s}×${s}` }))}
            className="w-32"
          />
        </div>

        {result?.success === false && <ErrorMessage title="Can't generate a QR code" message={result.error} />}

        {result?.success ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6">
            <img
              src={result.dataUrl}
              alt={`QR code encoding: ${text}`}
              width={size}
              height={size}
              className="max-w-full rounded-md border border-border bg-white p-2"
            />
            <Button variant="outline" size="sm" onClick={() => downloadDataUrl(result.dataUrl, "qrcode.png")}>
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download PNG
            </Button>
          </div>
        ) : (
          !result && (
            <EmptyState
              icon={QrCode}
              title="Nothing to encode yet"
              description="Enter some text or a URL to generate a QR code."
            />
          )
        )}
      </div>
    </ToolLayout>
  );
}
