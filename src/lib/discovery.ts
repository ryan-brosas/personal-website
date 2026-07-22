// M1 (Plan 01) discovery rendering — pure functions for sitemap and robots.
// Consumed by the thin endpoint wrappers (src/pages/sitemap.xml.ts,
// src/pages/robots.txt.ts) and by Node tests. No astro:* imports; pure.
import { isDiscoverable } from "./publishing.ts";
import { canonicalHref } from "./routes.ts";
import type { Visibility } from "./publishing.ts";

export interface SitemapRoute {
  path: string;
  visibility: Visibility;
}

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// Render a sitemap from the route inventory. Only public (discoverable) routes
// are included; draft and noindex are excluded. Output is deterministic (sorted
// by path). An empty inventory emits a well-formed <urlset> placeholder (local
// only — NOT release-valid per the sitemap XSD which requires >=1 url).
export const renderSitemap = (routes: SitemapRoute[], site: string): string => {
  const publicRoutes = routes
    .filter((r) => isDiscoverable(r.visibility))
    .sort((a, b) => a.path.localeCompare(b.path));
  if (publicRoutes.length === 0) {
    return `<urlset xmlns="${SITEMAP_NS}"></urlset>`;
  }
  const urls = publicRoutes
    .map((r) => `  <url><loc>${escapeXml(canonicalHref(r.path, site))}</loc></url>`)
    .join("\n");
  return `<urlset xmlns="${SITEMAP_NS}">\n${urls}\n</urlset>`;
};

// Render robots.txt from the configured origin. Visibility-independent: no
// Disallow for any route (noindex pages stay crawlable, drafts have no route).
// Emits User-agent: * and an absolute slashless Sitemap line.
export const renderRobots = (site: string): string => {
  const origin = site.replace(/\/+$/, "");
  return `User-agent: *\n\nSitemap: ${origin}/sitemap.xml\n`;
};
