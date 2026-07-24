// M1 (Plan 01) discovery rendering — pure functions for sitemap and robots.
// Consumed by the thin endpoint wrappers (src/pages/sitemap.xml.ts,
// src/pages/robots.txt.ts) and by Node tests. No astro:* imports; pure.
import { isDiscoverable } from "./publishing.ts";
import { canonicalHref } from "./routes.ts";
import type { Visibility } from "./publishing.ts";
import type { CrawlerPolicy } from "../config/crawlers.ts";

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

// Render robots.txt from the configured origin plus a differentiated crawler
// policy. The wildcard `User-agent: *` block is visibility-independent and
// carries NO Disallow (noindex pages stay crawlable, drafts have no route),
// followed by an absolute slashless Sitemap line. Each policy entry then emits
// one deterministic stanza (array order): a `User-agent:` line, then its
// `Allow:` lines, then its `Disallow:` lines. Pure: site + policy in, string
// out — no env reads, no Date. Search-crawl permission (Allow) and training
// consent (Disallow) live in separate named stanzas and are never conflated.
export const renderRobots = (site: string, policy: CrawlerPolicy[]): string => {
  const origin = site.replace(/\/+$/, "");
  const header = `User-agent: *\n\nSitemap: ${origin}/sitemap.xml\n`;
  const stanzas = policy.map((entry) => {
    const lines = [`User-agent: ${entry.userAgent}`];
    for (const path of entry.allow ?? []) lines.push(`Allow: ${path}`);
    for (const path of entry.disallow ?? []) lines.push(`Disallow: ${path}`);
    return `${lines.join("\n")}\n`;
  });
  return [header, ...stanzas].join("\n");
};
