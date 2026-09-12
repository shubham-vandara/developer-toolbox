import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { CornerDownLeft, Laptop, Moon, Search, Sun } from "lucide-react";
import { searchTools } from "../../data/tools.js";
import { useTheme } from "../../hooks/useTheme.jsx";
import { cn } from "../../utils/cn.js";

export function CommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const inputRef = useRef(null);

  const toolResults = useMemo(() => searchTools(query).slice(0, 6), [query]);

  const themeActions = useMemo(
    () => [
      { id: "theme-light", label: "Switch to light theme", icon: Sun, run: () => setTheme("light") },
      { id: "theme-dark", label: "Switch to dark theme", icon: Moon, run: () => setTheme("dark") },
      { id: "theme-system", label: "Use system theme", icon: Laptop, run: () => setTheme("system") },
    ],
    [setTheme],
  );

  const matchingActions = useMemo(() => {
    if (!query.trim()) return themeActions;
    const q = query.trim().toLowerCase();
    return themeActions.filter((action) => action.label.toLowerCase().includes(q));
  }, [query, themeActions]);

  const items = useMemo(
    () => [
      ...toolResults.map((tool) => ({ type: "tool", tool })),
      ...matchingActions.map((action) => ({ type: "action", action })),
    ],
    [toolResults, matchingActions],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const runItem = (item) => {
    if (!item) return;
    if (item.type === "tool") {
      navigate(item.tool.path);
    } else {
      item.action.run();
    }
    onOpenChange(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      runItem(items[activeIndex]);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-24 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-surface-raised shadow-xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search for tools or run quick actions
          </Dialog.Description>

          <div className="flex items-center gap-2 border-b border-border px-4 transition-colors focus-within:border-primary/50">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tools or type a command..."
              aria-label="Command palette search"
              className="h-14 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              Esc
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2" role="listbox">
            {items.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches found.</p>
            )}

            {toolResults.length > 0 && (
              <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Tools
              </p>
            )}
            {toolResults.map((tool) => {
              const index = items.findIndex((item) => item.type === "tool" && item.tool.id === tool.id);
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runItem(items[index])}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm",
                    index === activeIndex ? "bg-primary/10 text-foreground" : "text-foreground/90",
                  )}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">{tool.name}</span>
                  {index === activeIndex && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            {matchingActions.length > 0 && (
              <p className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Actions
              </p>
            )}
            {matchingActions.map((action) => {
              const index = items.findIndex((item) => item.type === "action" && item.action.id === action.id);
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runItem(items[index])}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm",
                    index === activeIndex ? "bg-primary/10 text-foreground" : "text-foreground/90",
                  )}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">{action.label}</span>
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
