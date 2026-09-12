import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { categories } from "../../data/tools.js";
import { cn } from "../../utils/cn.js";

export function ToolCard({ tool, isFavorite, onToggleFavorite }) {
  const Icon = tool.icon;

  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={() => onToggleFavorite(tool.id)}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
            className="relative z-10 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Star
              className={cn("h-4 w-4", isFavorite && "fill-warning text-warning")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className="flex-1">
        <span className="mb-1 inline-block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {categories[tool.category]}
        </span>
        <h3 className="font-semibold text-foreground">{tool.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
      </div>

      <Link
        to={tool.path}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Open Tool
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>

      <Link to={tool.path} className="absolute inset-0" aria-hidden="true" tabIndex={-1} />
    </div>
  );
}
