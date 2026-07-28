// Emits public page and collection routes from the shared publication policy.
// Draft content has no route; noindex content and empty hubs stay out of discovery.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderSitemap } from "../lib/discovery.ts";
import { resolveRoutes, resolveCollectionDiscoveryRoutes } from "../lib/site-routes.ts";
import { CODE_OWNED_DISCOVERY_POLICIES } from "../config/routes.ts";
import type { Visibility } from "../lib/publishing.ts";
import { getCollectionRouteRecords } from "../content/collection-route-records.ts";

export const GET: APIRoute = async ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  const pages = await getCollection("pages");
  const visibilities: Record<string, Visibility> = {};
  for (const page of pages) {
    visibilities[page.id] = page.data.visibility;
  }
  const collectionRecords = await getCollectionRouteRecords();
  const routes = [
    ...CODE_OWNED_DISCOVERY_POLICIES,
    ...resolveRoutes(visibilities),
    ...resolveCollectionDiscoveryRoutes(collectionRecords),
  ];
  return new Response(renderSitemap(routes, siteHref), {
    headers: { "Content-Type": "application/xml" },
  });
};
