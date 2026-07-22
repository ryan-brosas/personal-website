// M2 (Plan 03, Child 1) — thin endpoint wrapper for /sitemap.xml.
// Resolves page visibilities from the content collection, classifies via the
// single resolveRoutes pipeline, and renders public routes only.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderSitemap } from "../lib/discovery.ts";
import { resolveRoutes } from "../lib/site-routes.ts";
import type { Visibility } from "../lib/publishing.ts";

export const GET: APIRoute = async ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  const pages = await getCollection("pages");
  const visibilities: Record<string, Visibility> = {};
  for (const page of pages) {
    visibilities[page.id] = page.data.visibility;
  }
  const routes = resolveRoutes(visibilities);
  return new Response(renderSitemap(routes, siteHref), {
    headers: { "Content-Type": "application/xml" },
  });
};
