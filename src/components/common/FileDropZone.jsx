import { useEffect, useId, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "../../utils/cn.js";

// Accessible drag-and-drop + click/keyboard file picker. Optionally accepts
// files pasted from the clipboard. Files are only handed to `onFile` (or to
// `onFiles` as an array when `multiple`); nothing is uploaded anywhere.
export function FileDropZone({
  onFile,
  onFiles,
  multiple = false,
  accept,
  title = "Drop a file here or click to browse",
  hint,
  allowPaste = true,
  disabled = false,
  className,
}) {
  const inputRef = useRef(null);
  const hintId = useId();
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const deliver = (files) => {
    if (!files.length) return;
    if (multiple && onFiles) onFiles(files);
    else onFile(files[0]);
  };
  const deliverRef = useRef(deliver);
  useEffect(() => {
    deliverRef.current = deliver;
  });

  useEffect(() => {
    if (!allowPaste || disabled) return undefined;
    const handlePaste = (event) => {
      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length) {
        event.preventDefault();
        deliverRef.current(files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [allowPaste, disabled]);

  const openPicker = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (!disabled) deliver(Array.from(event.dataTransfer.files ?? []));
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      aria-describedby={hint ? hintId : undefined}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDragging(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        dragging ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/50 hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Upload className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium text-foreground">{dragging ? "Drop to open" : title}</p>
        {hint && (
          <p id={hintId} className="mt-1 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
        {allowPaste && <p className="mt-1 text-xs text-muted-foreground">You can also paste from the clipboard.</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          // Reset so choosing the same file again still fires onChange.
          event.target.value = "";
          deliver(files);
        }}
      />
    </div>
  );
}
