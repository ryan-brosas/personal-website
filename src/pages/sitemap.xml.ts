// M1 (Plan 01) — thin endpoint wrapper for /sitemap.xml.
// Renders the public-route inventory via the pure renderSitemap function.
import type { APIRoute } from "astro";
import { renderSitemap } from "../lib/discovery.ts";
import { ROUTES } from "../lib/routes.ts";

export const GET: APIRoute = ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  const routes = ROUTES.map((path) => ({ path, visibility: "public" as const }));
  return new Response(renderSitemap(routes, siteHref), {
    headers: { "Content-Type": "application/xml" },
  });
};
