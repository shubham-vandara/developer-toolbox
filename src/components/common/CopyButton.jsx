import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard.js";
import { cn } from "../../utils/cn.js";
import { Button } from "./Button.jsx";

export function CopyButton({ text, label = "Copy", className, size = "sm", variant = "outline", onCopy }) {
  const [copied, copy] = useCopyToClipboard();

  const handleClick = async () => {
    const success = await copy(text);
    if (success) onCopy?.();
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!text}
      className={cn("min-w-[5.5rem]", className)}
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {label}
        </>
      )}
    </Button>
  );
}
