// M2 (Plan 03, Child 1) single route-visibility resolver. Pure module —
// Node-testable. Maps page records (injected as an ID->visibility map by the
// Astro-runtime caller) to {path, visibility} tuples filtered by isRoutable.
// Consumed by getStaticPaths(), the sitemap endpoint, and the verifier.
//
// Visibility contract:
//   draft   -> no route (filtered out, no nav link, no sitemap entry)
//   noindex -> route + no sitemap (routable but not discoverable)
//   public  -> route + sitemap (routable and discoverable)
import { isRoutable } from "./publishing.ts";
import { PAGES } from "../config/site.ts";
import type { Visibility } from "./publishing.ts";

export interface ResolvedRoute {
  path: string;
  visibility: Visibility;
}

export type PageVisibilityMap = Record<string, Visibility>;

// Resolve the active route inventory from injected page visibilities. A page
// ID absent from the map means the record does not exist (no route). A present
// record is included iff isRoutable (public or noindex); draft is excluded.
export const resolveRoutes = (pageVisibilities: PageVisibilityMap): ResolvedRoute[] => {
  const routes: ResolvedRoute[] = [];
  for (const page of PAGES) {
    if (!Object.hasOwn(pageVisibilities, page.id)) continue;
    const visibility = pageVisibilities[page.id];
    if (isRoutable(visibility)) {
      routes.push({ path: page.path, visibility });
    }
  }
  return routes;
};
