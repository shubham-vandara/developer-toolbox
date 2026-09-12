import { Globe } from "lucide-react";
import { developerProfile } from "../../config.js";
import { cn } from "../../utils/cn.js";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "./icons.jsx";

const SOCIAL_LINKS = [
  { key: "github", label: "GitHub", icon: GithubIcon, href: developerProfile.github },
  { key: "linkedin", label: "LinkedIn", icon: LinkedinIcon, href: developerProfile.linkedin },
  { key: "portfolio", label: "Portfolio", icon: Globe, href: developerProfile.portfolio },
  { key: "instagram", label: "Instagram", icon: InstagramIcon, href: developerProfile.instagram },
];

export function SocialLinks({ className }) {
  const links = SOCIAL_LINKS.filter((link) => link.href);
  if (links.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {links.map(({ key, label, icon: Icon, href }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
