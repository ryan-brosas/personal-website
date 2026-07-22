// M2 (Plan 03, Child 1) — thin endpoint wrapper for /sitemap.xml.
// Resolves page visibilities from the content collection, classifies via the
// single resolveRoutes pipeline, prepends the code-owned ROOT_ROUTE_POLICY,
// and renders public routes only. Root stays excluded while noindex; Plan 04
// promotes ROOT_ROUTE_POLICY to public and the same pipeline includes it.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderSitemap } from "../lib/discovery.ts";
import { resolveRoutes } from "../lib/site-routes.ts";
import { ROOT_ROUTE_POLICY } from "../lib/routes.ts";
import type { Visibility } from "../lib/publishing.ts";

export const GET: APIRoute = async ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  const pages = await getCollection("pages");
  const visibilities: Record<string, Visibility> = {};
  for (const page of pages) {
    visibilities[page.id] = page.data.visibility;
  }
  const routes = [ROOT_ROUTE_POLICY, ...resolveRoutes(visibilities)];
  return new Response(renderSitemap(routes, siteHref), {
    headers: { "Content-Type": "application/xml" },
  });
};
