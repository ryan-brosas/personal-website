// M1 (Plan 01) discovery rendering — pure functions for sitemap and robots.
// Consumed by the thin endpoint wrappers (src/pages/sitemap.xml.ts,
// src/pages/robots.txt.ts) and by Node tests. No astro:* imports; pure.
import type { Visibility } from "./publishing.ts";

export interface SitemapRoute {
  path: string;
  visibility: Visibility;
}

// STUB (RED) — intentionally wrong; returns empty string so tests fail on
// assertions, not on module-not-found.
export const renderSitemap = (_routes: SitemapRoute[], _site: string): string => "";
export const renderRobots = (_site: string): string => "";
