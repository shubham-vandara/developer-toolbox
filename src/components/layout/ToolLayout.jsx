import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck, Star } from "lucide-react";
import { categories } from "../../data/tools.js";
import { useDocumentHead } from "../../hooks/useDocumentHead.js";
import { useRecentTools } from "../../hooks/useRecentTools.js";
import { useFavoriteTools } from "../../hooks/useFavoriteTools.js";
import { cn } from "../../utils/cn.js";

export function ToolLayout({ tool, children }) {
  const Icon = tool.icon;
  const [, addRecentTool] = useRecentTools();
  const { isFavorite, toggleFavorite } = useFavoriteTools();
  const favorite = isFavorite(tool.id);

  useDocumentHead({
    title: tool.name,
    description: tool.description,
    path: tool.path,
  });

  useEffect(() => {
    addRecentTool(tool.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/tools" className="hover:text-foreground">
          Tools
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="text-foreground">{categories[tool.category]}</span>
      </nav>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{tool.name}</h1>
            <p className="mt-1 text-muted-foreground">{tool.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(tool.id)}
          aria-pressed={favorite}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Star className={cn("h-4 w-4", favorite && "fill-warning text-warning")} aria-hidden="true" />
        </button>
      </div>

      <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        Your data stays in your browser
      </div>

      {children}
    </div>
  );
}
