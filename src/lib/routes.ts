// M1 (Plan 01) route inventory + canonical helpers. Pure module (no astro
// runtime imports, no any) — Node-testable. ROUTES is empty in M1 (no production HTML
// routes until Plan 03); it grows as modules ship.
//
// Route contract (docs/sitemap.md:25):
// - HTML routes use canonical trailing slashes.
// - File endpoints (/rss.xml, /sitemap.xml, /robots.txt, /404.html) do NOT.
import type { Visibility } from "./publishing.ts";

export const ROUTES: string[] = [];

// Code-owned root route. Activated as noindex in Child 2 (m2-semantic-shell);
// promoted to public by Plan 04. Kept here so the route contract is centralized.
export const ROOT_ROUTE = "/" as const;

// Code-owned root route policy. Centralizes the root's visibility so the page
// metadata, sitemap discovery, and (later) Plan 04 promotion all read one
// source. noindex in M2 (excluded from discovery, stays crawlable); Plan 04
// flips visibility to "public" to activate the evidence homepage. The `import
// type` is erased at runtime, so this module stays Node-testable and pure.
export const ROOT_ROUTE_POLICY: { path: string; visibility: Visibility } = {
  path: ROOT_ROUTE,
  visibility: "noindex",
};

// File endpoints carry a file extension: /sitemap.xml, /robots.txt, /404.html,
// /rss.xml. /404.html is slashless even though it is HTML.
export const isFileEndpoint = (path: string): boolean => {
  const clean = path.split("?")[0].split("#")[0];
  const last = clean.split("/").pop() ?? "";
  return last.includes(".");
};

export const isHtmlRoute = (path: string): boolean => !isFileEndpoint(path);

// Build an absolute canonical URL from the configured site origin + a route
// path. HTML routes get a trailing slash; file endpoints stay slashless. The
// origin's trailing slash is normalized so the join never produces "//".
export const canonicalHref = (path: string, site: string): string => {
  const origin = site.replace(/\/+$/, "");
  let p = path.startsWith("/") ? path : `/${path}`;
  if (isHtmlRoute(p)) {
    if (!p.endsWith("/")) p = `${p}/`;
  } else {
    p = p.replace(/\/+$/, "");
  }
  return `${origin}${p}`;
};
