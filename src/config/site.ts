// Backward-compatibility shim (W1·T2). PAGES and NAV_ORDER are now DERIVED from
// the single route registry (src/config/routes.ts) so existing callers
// (SiteHeader, [page].astro) keep working while route truth lives in one place
// (INV-06). This module no longer authors routes; it only projects the
// registry's primary-nav entries into the legacy PageConfig shape. A later W1
// slice removes remaining PAGES callers and this shim.
import { ROUTE_REGISTRY } from "./routes.ts";
import type { NavLabelKey } from "../lib/route-registry.ts";
import type { Visibility } from "../lib/publishing.ts";

export interface PageConfig {
  /** Content collection entry ID (matches src/content/pages/<id>.md). */
  id: string;
  /** HTML route path (trailing slash per the canonical route contract). */
  path: string;
  /** Key into SettingsData.navLabels for this page's nav label. */
  navLabelKey: NavLabelKey;
  /** Registry-derived visibility (draft records never appear here). */
  visibility: Visibility;
}

export const PAGES: PageConfig[] = ROUTE_REGISTRY.navItems().map((route) => ({
  id: route.id,
  path: route.path,
  navLabelKey: route.navLabelKey,
  visibility: route.visibility,
}));

/** Navigation order (by page id), derived from the registry's primary nav. */
export const NAV_ORDER: string[] = ROUTE_REGISTRY.navItems().map((route) => route.id);
