import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Menu, Search, Terminal } from "lucide-react";
import { getActiveCategories } from "../../data/tools.js";
import { GITHUB_URL, SITE_NAME } from "../../config.js";
import { ThemeToggle } from "../common/ThemeToggle.jsx";
import { GithubIcon } from "../common/icons.jsx";
import { cn } from "../../utils/cn.js";
import { MobileNavigation } from "./MobileNavigation.jsx";

const navLinkClass = ({ isActive }) =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
  );

export function Header({ onOpenSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const categories = getActiveCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Terminal className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{SITE_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Categories
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={8}
                className="z-50 min-w-[12rem] rounded-md border border-border bg-surface-raised p-1 shadow-md"
              >
                {categories.map((category) => (
                  <DropdownMenu.Item key={category.id} asChild>
                    <Link
                      to={`/tools?category=${category.id}`}
                      className="flex items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-muted focus:bg-muted"
                    >
                      {category.name}
                      <span className="text-xs text-muted-foreground">{category.count}</span>
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <NavLink to="/tools" className={navLinkClass}>
            All Tools
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden items-center gap-2 rounded-md border border-input bg-surface px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Search tools...</span>
            <kbd className="ml-4 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              Ctrl K
            </kbd>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search tools"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <MobileNavigation open={mobileOpen} onOpenChange={setMobileOpen} onOpenSearch={onOpenSearch} />
    </header>
  );
}
