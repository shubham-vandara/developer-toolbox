import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn.js";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search developer tools...",
  size = "md",
  className,
  autoFocus = false,
  inputRef,
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground",
          size === "lg" ? "h-5 w-5" : "h-4 w-4",
        )}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search developer tools"
        className={cn(
          "w-full rounded-lg border border-input bg-surface text-foreground placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "[&::-webkit-search-cancel-button]:appearance-none",
          size === "lg" ? "h-14 pl-12 pr-4 text-base shadow-sm" : "h-9 pl-9 pr-8 text-sm",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
