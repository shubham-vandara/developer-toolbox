import { createServer } from "vite";
import fs from "node:fs";
import path from "node:path";

const SITE = "https://devhelpers.netlify.app";
const SUFFIX = " | DevHelpers"; // must match what your React code appends to the title
const dist = path.resolve("dist");
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

// Load tools.js through Vite. The lazy(() => import(...)) tool components are never executed.
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
const { tools } = await vite.ssrLoadModule("/src/data/tools.js");
await vite.close();

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

function withMeta(html, { title, description, url }) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/,
      `<meta name="description" content="${esc(description)}" />`,
    )
    .replace(
      /<link\s+rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${url}" />`,
    )
    .replace(
      /<meta\s+property="og:title"[^>]*>/,
      `<meta property="og:title" content="${esc(title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"[^>]*>/,
      `<meta property="og:description" content="${esc(description)}" />`,
    )
    .replace(
      /<meta\s+property="og:url"[^>]*>/,
      `<meta property="og:url" content="${url}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${esc(title)}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${esc(description)}" />`,
    );
}

for (const tool of tools) {
  const route = tool.path.startsWith("/") ? tool.path : `/${tool.path}`;
  const html = withMeta(template, {
    title: `${tool.pageTitle}${SUFFIX}`,
    description: tool.metaDescription ?? tool.description,
    url: `${SITE}${route}`,
  });
  const outDir = path.join(dist, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log("prerendered", route);
}

const extraPages = [
  {
    route: "/tools",
    title: `All Free Online Developer Tools${SUFFIX}`,
    description:
      "Browse all free online developer tools: JSON, PDF, image, text and more.", // use your real description
  },
];

for (const p of extraPages) {
  const html = withMeta(template, {
    title: p.title,
    description: p.description,
    url: `${SITE}${p.route}`,
  });
  const outDir = path.join(dist, p.route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log("prerendered", p.route);
}
