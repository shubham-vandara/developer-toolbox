import { useRef } from "react";
import { FileIcon, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "./Button.jsx";

// Summary bar for the file a tool is currently working on, with Replace/Clear.
export function SelectedFile({ name, details = [], thumbnailUrl, accept, onReplace, onClear }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="bg-checkerboard flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <FileIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground" title={name}>
            {name}
          </p>
          <p className="text-xs text-muted-foreground">{details.filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {onReplace && (
          <>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Replace
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onReplace(file);
              }}
            />
          </>
        )}
        <Button variant="outline" size="sm" onClick={onClear}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Clear
        </Button>
      </div>
    </div>
  );
}
