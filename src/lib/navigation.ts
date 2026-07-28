// One navigation resolver for every chrome region. The header and the footer
// both render from this, so a registry entry, a visibility flip, or a settings
// label change lands in both places at once instead of drifting apart.
import { getEntry, getCollection } from "astro:content";
import { ROOT_ROUTE } from "./routes.ts";
import { getCollectionRouteRecords } from "../content/collection-route-records.ts";
import { resolveRoutes, resolveCollectionDiscoveryRoutes } from "./site-routes.ts";
import { PAGES, NAV_ORDER } from "../config/site.ts";
import type { Visibility } from "./publishing.ts";

export interface NavLink {
  href: string;
  label: string;
  /** Marks the single conversion destination; the header styles it as a CTA. */
  emphasis: boolean;
}

export interface SiteNavigation {
  siteTitle: string;
  primary: NavLink[];
}

export async function resolveSiteNavigation(): Promise<SiteNavigation> {
  const settings = await getEntry("settings", "site");
  if (!settings) {
    throw new Error('settings entry "site" is missing; cannot render navigation');
  }

  const pages = await getCollection("pages");
  const visibilities: Record<string, Visibility> = {};
  for (const page of pages) {
    visibilities[page.id] = page.data.visibility;
  }

  const resolvedByPath = new Map(resolveRoutes(visibilities).map((route) => [route.path, route]));
  // Collection hubs join navigation only when their collection has a public child.
  const collectionRecords = await getCollectionRouteRecords();
  for (const route of resolveCollectionDiscoveryRoutes(collectionRecords)) {
    resolvedByPath.set(route.path, route);
  }

  // The root is not a content page, so it never survives the visibility pass.
  // It leads the nav in both header and footer from this one place.
  const primary: NavLink[] = [
    { href: ROOT_ROUTE, label: settings.data.navLabels.home, emphasis: false },
  ];
  for (const id of NAV_ORDER) {
    const pageConfig = PAGES.find((page) => page.id === id);
    if (!pageConfig) continue;
    if (!resolvedByPath.has(pageConfig.path)) continue;
    primary.push({
      href: pageConfig.path,
      label: settings.data.navLabels[pageConfig.navLabelKey],
      emphasis: pageConfig.id === "contact",
    });
  }

  return { siteTitle: settings.data.siteTitle, primary };
}
