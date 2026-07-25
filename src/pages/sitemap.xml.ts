// M2 (Plan 03, Child 1) — thin endpoint wrapper for /sitemap.xml.
// Resolves page visibilities from the content collection, classifies via the
// single resolveRoutes pipeline, prepends the code-owned ROOT_ROUTE_POLICY,
// and renders public routes only. Root stays excluded while noindex; Plan 04
// promotes ROOT_ROUTE_POLICY to public and the same pipeline includes it.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { renderSitemap } from "../lib/discovery.ts";
import { resolveRoutes, resolveCollectionRoutes } from "../lib/site-routes.ts";
import { ROOT_ROUTE_POLICY } from "../config/routes.ts";
import type { Visibility } from "../lib/publishing.ts";

export const GET: APIRoute = async ({ site }) => {
  const siteHref = site?.href ?? "https://example.com";
  const pages = await getCollection("pages");
  const visibilities: Record<string, Visibility> = {};
  for (const page of pages) {
    visibilities[page.id] = page.data.visibility;
  }
  // Collection-backed routes (case-studies hub + entries) are discovered from
  // their own collection and gated by the INV-07 min-child rule via the shared
  // resolveCollectionRoutes helper — the SAME derivation the verifier uses, so
  // the sitemap and the verifier's expected route set can never drift.
  const caseStudies = await getCollection("case-studies");
  const caseStudyRecords = caseStudies.map((entry) => ({
    slug: entry.data.slug,
    visibility: entry.data.visibility,
  }));
  const routes = [
    ROOT_ROUTE_POLICY,
    ...resolveRoutes(visibilities),
    ...resolveCollectionRoutes({ "case-studies": caseStudyRecords }),
  ];
  return new Response(renderSitemap(routes, siteHref), {
    headers: { "Content-Type": "application/xml" },
  });
};
