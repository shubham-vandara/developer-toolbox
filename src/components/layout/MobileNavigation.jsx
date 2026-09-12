import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import { getActiveCategories, getPopularTools } from "../../data/tools.js";
import { GITHUB_URL } from "../../config.js";
import { GithubIcon } from "../common/icons.jsx";

export function MobileNavigation({ open, onOpenChange, onOpenSearch }) {
  const categories = getActiveCategories();
  const popularTools = getPopularTools();

  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col overflow-y-auto bg-surface-raised shadow-xl md:hidden">
          <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
          <div className="flex items-center justify-between border-b border-border p-4">
            <span className="text-sm font-semibold">Menu</span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-6 p-4">
            <button
              type="button"
              onClick={() => {
                close();
                onOpenSearch();
              }}
              className="flex h-11 items-center gap-2 rounded-md border border-input px-3.5 text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Search tools...
            </button>

            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categories
              </p>
              <div className="flex flex-col">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/tools?category=${category.id}`}
                    onClick={close}
                    className="flex min-h-[44px] items-center justify-between rounded-md px-3 text-sm font-medium hover:bg-muted"
                  >
                    {category.name}
                    <span className="text-xs text-muted-foreground">{category.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Popular Tools
              </p>
              <div className="flex flex-col">
                {popularTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    onClick={close}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-md px-3 text-sm font-medium hover:bg-muted"
                  >
                    <tool.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {tool.shortName}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/tools"
              onClick={close}
              className="flex min-h-[44px] items-center justify-between rounded-md border border-border px-3.5 text-sm font-medium hover:bg-muted"
            >
              View all tools
              <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[44px] items-center gap-2.5 rounded-md px-3 text-sm font-medium hover:bg-muted"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
