// M1 (Plan 01) route inventory + canonical helpers. Pure module (no astro
// imports, no any) — Node-testable. ROUTES is empty in M1 (no production HTML
// routes until Plan 03); it grows as modules ship.
//
// Route contract (docs/sitemap.md:25):
// - HTML routes use canonical trailing slashes.
// - File endpoints (/rss.xml, /sitemap.xml, /robots.txt, /404.html) do NOT.

export const ROUTES: string[] = [];

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
