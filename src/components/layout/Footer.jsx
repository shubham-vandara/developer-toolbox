import { Link } from "react-router-dom";
import { ShieldCheck, Terminal } from "lucide-react";
import { developerProfile, GITHUB_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "../../config.js";
import { GithubIcon } from "../common/icons.jsx";
import { SocialLinks } from "../common/SocialLinks.jsx";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Terminal className="h-4 w-4" aria-hidden="true" />
              </span>
              {SITE_NAME}
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">{SITE_TAGLINE}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{SITE_DESCRIPTION}</p>

            {developerProfile.name && (
              <p className="mt-4 text-sm text-foreground">
                Built by <span className="font-medium">{developerProfile.name}</span>
              </p>
            )}
            <SocialLinks className="mt-3" />
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Product</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/tools" className="hover:text-foreground">
                  Tools
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-foreground">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Resources</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
                  <GithubIcon className="h-3.5 w-3.5" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {developerProfile.name || SITE_NAME}. All tools run entirely in your browser.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Your data stays in your browser. We don't send your tool input to a server.
          </p>
        </div>
      </div>
    </footer>
  );
}
