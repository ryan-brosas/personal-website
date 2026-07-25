// W1·T2 (SEO/GEO authority refactor) — the ONE route registry (INV-06). This is
// the executable sitemap for the first-release IA. Every route path, canonical,
// nav entry, and parent link derives from here via src/lib/route-registry.ts;
// no module hard-codes a route path or canonical string outside the registry
// helpers (pathFor/canonicalFor).
//
// First-release IA only. Insights/research/service-detail/privacy/rss/llms
// routes from the full design doc are intentionally NOT registered yet; they
// land with their content collections and gates in later slices.
import { defineRoutes } from "../lib/route-registry.ts";
import type { RouteDefinition } from "../lib/route-registry.ts";
import type { Visibility } from "../lib/publishing.ts";

// Nav order preserves the shipped visual order (about, services, contact); the
// numeric gaps leave room for future primary entries (e.g. case-studies at T14)
// without renumbering.
const ROUTE_DEFINITIONS: RouteDefinition[] = [
  // Code-owned root. noindex in first release (excluded from discovery, stays
  // crawlable); promoted to public when the evidence homepage lands (T16).
  {
    id: "home",
    kind: "singleton",
    path: "/",
    visibility: "noindex",
    gate: "home-proof",
    navPlacement: "none",
  },
  {
    id: "services",
    kind: "singleton",
    path: "/services/",
    visibility: "public",
    gate: "always",
    navPlacement: "primary",
    navLabelKey: "services",
    navOrder: 20,
  },
  // Case-studies hub (T14). Primary-nav, slotted between services (20) and
  // contact (30). Discovery still honours the INV-07 min-child gate: the hub is
  // only advertised in the sitemap/nav/verifier when ≥1 public entry exists —
  // that gate is applied by resolveCollectionRoutes over the collection records,
  // not by this static registry entry.
  {
    id: "case-studies",
    kind: "hub",
    path: "/case-studies/",
    visibility: "public",
    gate: "case-studies-hub",
    navPlacement: "primary",
    navLabelKey: "caseStudies",
    navOrder: 25,
  },
  {
    id: "case-studies-slug",
    kind: "collection",
    path: "/case-studies/[slug]/",
    visibility: "public",
    gate: "case-studies-hub",
    navPlacement: "none",
    collection: "case-studies",
    parent: "case-studies",
    isDynamic: true,
  },
  {
    id: "about",
    kind: "singleton",
    path: "/about/",
    visibility: "public",
    gate: "always",
    navPlacement: "primary",
    navLabelKey: "about",
    navOrder: 10,
  },
  {
    id: "contact",
    kind: "singleton",
    path: "/contact/",
    visibility: "public",
    gate: "always",
    navPlacement: "primary",
    navLabelKey: "contact",
    navOrder: 30,
    navEmphasis: true,
  },
  {
    id: "sitemap",
    kind: "file",
    path: "/sitemap.xml",
    visibility: "public",
    gate: "always",
    navPlacement: "none",
    isEndpoint: true,
  },
  {
    id: "robots",
    kind: "file",
    path: "/robots.txt",
    visibility: "public",
    gate: "always",
    navPlacement: "none",
    isEndpoint: true,
  },
  {
    id: "404",
    kind: "utility",
    path: "/404.html",
    visibility: "public",
    gate: "always",
    navPlacement: "none",
    isEndpoint: true,
  },
];

export const ROUTE_REGISTRY = defineRoutes(ROUTE_DEFINITIONS);

// Code-owned root disposition, migrated from src/lib/routes.ts into the registry
// (INV-06). Consumers (index.astro, sitemap.xml.ts) read root path + visibility
// from here; flipping the "home" entry to public in T16 promotes the homepage
// through the same single pipeline.
export const ROOT_ROUTE_POLICY: { path: string; visibility: Visibility } = (() => {
  const home = ROUTE_REGISTRY.byId("home");
  if (!home) throw new Error("ROUTE_REGISTRY is missing the required 'home' route");
  return { path: home.path, visibility: home.visibility };
})();
