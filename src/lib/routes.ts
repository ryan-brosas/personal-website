// M1 canonical-path helpers. Pure module (no astro runtime imports, no any) —
// Node-testable. Route TRUTH (inventory, visibility, nav, parents) now lives in
// the single route registry (src/config/routes.ts via src/lib/route-registry.ts,
// INV-06); this module keeps only the low-level canonical-path primitives that
// the registry and discovery layer build on.
//
// Route contract (docs/sitemap.md:25):
// - HTML routes use canonical trailing slashes.
// - File endpoints (/rss.xml, /sitemap.xml, /robots.txt, /404.html) do NOT.

// Canonical root path token, reused by the shell brand/home links. The root's
// disposition (visibility/promotion) is owned by the registry's "home" entry,
// not here — this is just the "/" string.
export const ROOT_ROUTE = "/" as const;

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
