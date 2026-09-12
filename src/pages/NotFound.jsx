import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { useDocumentHead } from "../hooks/useDocumentHead.js";

export function NotFound() {
  useDocumentHead({ title: "Page Not Found", description: "This page doesn't exist." });

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
      >
        <Home className="h-4 w-4" aria-hidden="true" />
        Back to home
      </Link>
    </div>
  );
}
