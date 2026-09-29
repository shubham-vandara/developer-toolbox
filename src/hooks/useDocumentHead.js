import { useEffect } from "react";

const SITE_NAME = "DevHelpers";
const SITE_URL = "https://devhelpers.netlify.app/";
const DEFAULT_TITLE = "Free Online Developer Tools & Utilities";
const DEFAULT_ROBOTS =
  "follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large";

export const DEFAULT_DESCRIPTION = (count) =>
  `DevHelpers offers ${count} free developer tools: JSON formatter, regex tester, Base64, JWT decoder and more. Fast, private and browser-based. Start now.`;

function upsert(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(create);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

const meta = (attr, key, content) =>
  upsert(`meta[${attr}="${key}"]`, "meta", { [attr]: key, content });

export function useDocumentHead({
  title, // omit on the home page
  description,
  path = "",
  image, // optional absolute URL
  noindex = false,
}) {
  useEffect(() => {
    const pageTitle = title ?? DEFAULT_TITLE;
    const fullTitle = `${pageTitle} | ${SITE_NAME}`;
    const url = new URL(path, `${SITE_URL}/`).href;
    const robots = noindex ? "noindex, nofollow" : DEFAULT_ROBOTS;

    document.title = fullTitle;

    if (description) {
      meta("name", "description", description);
      meta("property", "og:description", description);
      meta("name", "twitter:description", description);
    }

    meta("name", "robots", robots);
    meta("property", "og:locale", "en_US");
    meta("property", "og:type", "website");
    meta("property", "og:site_name", SITE_NAME);
    meta("property", "og:title", fullTitle);
    meta("property", "og:url", url);
    meta("name", "twitter:title", fullTitle);
    meta("name", "twitter:card", image ? "summary_large_image" : "summary");

    if (image) {
      meta("property", "og:image", image);
      meta("name", "twitter:image", image);
    }

    upsert('link[rel="canonical"]', "link", { rel: "canonical", href: url });
  }, [title, description, path, image, noindex]);
}
