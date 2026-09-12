import { useEffect } from "react";

const SITE_NAME = "Developer Toolbox";
const SITE_URL = "https://developer-toolbox.example.com";

function setMetaTag(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function setLinkTag(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  return el;
}

/**
 * Imperatively sets per-page title/meta tags. Kept dependency-free since a
 * single-page app only ever needs to update a handful of head tags on route
 * change — no need for a helmet-style library.
 */
export function useDocumentHead({ title, description, path = "" }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Small tools. Big productivity.`;
    const url = `${SITE_URL}${path}`;

    document.title = fullTitle;

    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("name", "twitter:description", description);
    }

    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:url", url);
    setMetaTag("property", "og:type", "website");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", fullTitle);

    setLinkTag("canonical", url);
  }, [title, description, path]);
}
