import { useState } from "react";
import { Button } from "../common/Button.jsx";
import { allPages, formatPageList, parsePageRanges } from "../../utils/pdf/pageRanges.js";

/**
 * Text page selection ("1-3, 5, 8-") with Select all / Clear, kept in sync
 * with a selection made elsewhere (e.g. by clicking thumbnails).
 * value: sorted array of 1-based pages.
 */
export function PageSelector({ id, label = "Pages", pageCount, value, onChange, allowEmpty = true }) {
  const formatted = formatPageList(value, "-");
  const [text, setText] = useState(formatted);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(formatted);

  // Adopt selections made outside this input (thumbnail clicks, buttons).
  if (formatted !== lastSynced) {
    setLastSynced(formatted);
    setText(formatted);
    setError(null);
  }

  const handleChange = (next) => {
    setText(next);
    if (!next.trim()) {
      setError(null);
      if (allowEmpty) {
        setLastSynced("");
        onChange([]);
      }
      return;
    }
    const result = parsePageRanges(next, pageCount);
    if (result.success) {
      setError(null);
      setLastSynced(formatPageList(result.pages, "-"));
      onChange(result.pages);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={`e.g. 1-3, 5, 8-${pageCount}`}
          spellCheck={false}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={`${id}-hint`}
          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive/60"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={() => onChange(allPages(pageCount))}>
            Select all
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => onChange([])} disabled={!value.length}>
            Clear
          </Button>
        </div>
      </div>
      <p id={`${id}-hint`} className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"} role={error ? "alert" : undefined}>
        {error ?? `${value.length} of ${pageCount} page${pageCount === 1 ? "" : "s"} selected. Use commas and ranges; "8-" means page 8 to the end.`}
      </p>
    </div>
  );
}
