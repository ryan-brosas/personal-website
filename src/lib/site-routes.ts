// M2 (Plan 03, Child 1) single route-visibility resolver. Pure module —
// Node-testable. Maps page records (injected as an ID->visibility map by the
// Astro-runtime caller) to {path, visibility} tuples filtered by isRoutable.
// Consumed by getStaticPaths(), the sitemap endpoint, and the verifier.
//
// RED STUB — resolver ignores the injected visibility map and returns all
// configured pages as public. Route-visibility tests must fail before the
// GREEN implementation filters by isRoutable.
import { PAGES } from "../config/site.ts";
import type { Visibility } from "./publishing.ts";

export interface ResolvedRoute {
  path: string;
  visibility: Visibility;
}

export type PageVisibilityMap = Record<string, Visibility>;

export const resolveRoutes = (_pageVisibilities: PageVisibilityMap): ResolvedRoute[] => {
  // BUG: ignores visibility, returns all configured pages as public.
  return PAGES.map((p) => ({ path: p.path, visibility: "public" as const }));
};
