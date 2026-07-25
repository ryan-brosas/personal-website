// M2 (Plan 03, Child 1) single route-visibility resolver. Pure module —
// Node-testable. Maps page records (injected as an ID->visibility map by the
// Astro-runtime caller) to {path, visibility} tuples filtered by isRoutable.
// Consumed by getStaticPaths(), the sitemap endpoint, and the verifier.
//
// Visibility contract:
//   draft   -> no route (filtered out, no nav link, no sitemap entry)
//   noindex -> route + no sitemap (routable but not discoverable)
//   public  -> route + sitemap (routable and discoverable)
import { isRoutable, isDiscoverable } from "./publishing.ts";
import { ROUTE_REGISTRY } from "../config/routes.ts";
import type { Visibility } from "./publishing.ts";

export interface ResolvedRoute {
  path: string;
  visibility: Visibility;
}

export type PageVisibilityMap = Record<string, Visibility>;

// A content record for a dynamic collection route: its slug (fills the [slug]
// segment) and its publication visibility. Injected by the Astro-runtime caller
// (getCollection) or by the Node build tooling (frontmatter reader) — this pure
// module never touches astro:content or the filesystem.
export interface CollectionRecord {
  slug: string;
  visibility: Visibility;
}

// Resolve the discoverable route inventory for content-backed collection routes.
// For EVERY dynamic collection route in the registry, take the injected records
// for that route's collection and apply the hub min-child gate (INV-07): when at
// least one PUBLIC record exists, emit the parent hub route plus one child route
// per public record; when zero public records exist, emit nothing (the hub is
// not discoverable). Children are slug-sorted for deterministic output. This is
// the ONE source of the collection route set — the sitemap endpoint, the [slug]
// page, the build verifier, and the shell manifest all route through it so the
// public canonical set, the sitemap, and the verifier's expected routes stay in
// lockstep. Fully registry-derived: no hub/slug/path literals are baked in.
export const resolveCollectionRoutes = (
  recordsByCollection: Record<string, CollectionRecord[]>,
): ResolvedRoute[] => {
  const routes: ResolvedRoute[] = [];
  for (const def of ROUTE_REGISTRY.all()) {
    if (def.isDynamic !== true || def.collection === undefined) continue;
    const records = recordsByCollection[def.collection] ?? [];
    const publicRecords = records.filter((record) => isDiscoverable(record.visibility));
    if (publicRecords.length === 0) continue;
    const hub = def.parent === undefined ? undefined : ROUTE_REGISTRY.byId(def.parent);
    if (hub !== undefined) {
      routes.push({ path: hub.path, visibility: hub.visibility });
    }
    for (const record of [...publicRecords].sort((a, b) => a.slug.localeCompare(b.slug))) {
      routes.push({
        path: ROUTE_REGISTRY.pathFor(def.id, { slug: record.slug }),
        visibility: "public",
      });
    }
  }
  return routes;
};

// Resolve the active route inventory from injected page visibilities. A page
// ID absent from the map means the record does not exist (no route). A present
// record is included iff isRoutable (public or noindex); draft is excluded.
export const resolveRoutes = (pageVisibilities: PageVisibilityMap): ResolvedRoute[] => {
  const routes: ResolvedRoute[] = [];
  for (const page of ROUTE_REGISTRY.navItems()) {
    if (!Object.hasOwn(pageVisibilities, page.id)) continue;
    const visibility = pageVisibilities[page.id];
    if (isRoutable(visibility)) {
      routes.push({ path: page.path, visibility });
    }
  }
  return routes;
};
