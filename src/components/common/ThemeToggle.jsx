import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme.jsx";
import { cn } from "../../utils/cn.js";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const ActiveIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Change theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <ActiveIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[9rem] rounded-md border border-border bg-surface-raised p-1 shadow-md"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setTheme(value)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-muted focus:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {theme === value && <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
