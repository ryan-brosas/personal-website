// Route-visibility resolver. Pure module —
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

/** Resolves dynamic collection entries that produce HTML routes. */
export const resolveCollectionEntryRoutes = (
  recordsByCollection: Record<string, CollectionRecord[]>,
): ResolvedRoute[] => {
  const routes: ResolvedRoute[] = [];
  for (const definition of ROUTE_REGISTRY.all()) {
    if (definition.isDynamic !== true || definition.collection === undefined) continue;
    const records = recordsByCollection[definition.collection] ?? [];
    for (const record of [...records]
      .filter((candidate) => isRoutable(candidate.visibility))
      .sort((a, b) => a.slug.localeCompare(b.slug))) {
      routes.push({
        path: ROUTE_REGISTRY.pathFor(definition.id, { slug: record.slug }),
        visibility: record.visibility,
      });
    }
  }
  return routes;
};

/** Resolves public collection entries and their gated hub for discovery. */
export const resolveCollectionDiscoveryRoutes = (
  recordsByCollection: Record<string, CollectionRecord[]>,
): ResolvedRoute[] => {
  const routes: ResolvedRoute[] = [];
  const addRoute = (route: ResolvedRoute): void => {
    if (!routes.some((existing) => existing.path === route.path)) routes.push(route);
  };
  for (const def of ROUTE_REGISTRY.all()) {
    if (def.isDynamic !== true || def.collection === undefined) continue;
    const records = recordsByCollection[def.collection] ?? [];
    const publicRecords = records.filter((record) => isDiscoverable(record.visibility));
    if (publicRecords.length === 0) continue;
    const ancestors = [];
    let ancestor = def.parent === undefined ? undefined : ROUTE_REGISTRY.byId(def.parent);
    while (ancestor !== undefined) {
      ancestors.unshift(ancestor);
      ancestor = ancestor.parent === undefined ? undefined : ROUTE_REGISTRY.byId(ancestor.parent);
    }
    for (const hub of ancestors) addRoute({ path: hub.path, visibility: hub.visibility });
    for (const record of [...publicRecords].sort((a, b) => a.slug.localeCompare(b.slug))) {
      addRoute({
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
