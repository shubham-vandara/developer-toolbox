import { Download } from "lucide-react";
import { downloadBlob } from "../../utils/file.js";
import { Button } from "./Button.jsx";
import { useToast } from "./Toast.jsx";

export function DownloadButton({ blob, filename, label = "Download", variant = "primary", size = "sm", className }) {
  const { showToast } = useToast();
  return (
    <Button
      variant={variant}
      size={size}
      disabled={!blob}
      className={className}
      onClick={() => {
        downloadBlob(blob, filename);
        showToast(`${filename} downloaded`);
      }}
    >
      <Download className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Button>
  );
}
