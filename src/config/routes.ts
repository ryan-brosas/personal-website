// The route registry is the executable route source of truth (INV-06). This is
// the executable sitemap for the first-release IA. Every route path, canonical,
// nav entry, and parent link derives from here via src/lib/route-registry.ts;
// no module hard-codes a route path or canonical string outside the registry
// helpers (pathFor/canonicalFor).
//
// First-release IA only. Insights/research/service-detail/privacy/rss/llms
// routes remain unregistered until their content collections and publication
// gates exist.
import { defineRoutes } from "../lib/route-registry.ts";
import type { RouteDefinition } from "../lib/route-registry.ts";
import type { Visibility } from "../lib/publishing.ts";
import { resolveHomeVisibility } from "../lib/home-proof.ts";

// Numeric order leaves room to add gated sections without renumbering existing
// primary navigation.
const ROUTE_DEFINITIONS: RouteDefinition[] = [
  // The code-owned root derives visibility from resolveHomeVisibility. The gate
  // promotes "/" only when the featured résumé-bot case study is public
  // with verified, fresh, resolvable evidence and every registered homepage proof claim
  // carries a fresh evidence ref; otherwise it stays noindex (fail-closed — crawlable but
  // excluded from discovery). Flipping the featured case study to draft keeps "/" noindex.
  {
    id: "home",
    kind: "singleton",
    path: "/",
    visibility: resolveHomeVisibility(),
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
  // Collection hubs are public-capable registry entries. Runtime discovery
  // advertises each hub only when its collection has a public child.
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
    id: "resources",
    kind: "hub",
    path: "/resources/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "primary",
    navLabelKey: "resources",
    navOrder: 27,
  },
  {
    id: "directory",
    kind: "singleton",
    path: "/resources/directory/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "none",
    parent: "resources",
  },
  {
    id: "resources-slug",
    kind: "collection",
    path: "/resources/[slug]/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "none",
    collection: "resources",
    parent: "resources",
    isDynamic: true,
  },
  {
    id: "tools",
    kind: "hub",
    path: "/resources/tools/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "none",
    parent: "resources",
  },
  {
    id: "tools-slug",
    kind: "collection",
    path: "/resources/tools/[slug]/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "none",
    collection: "tools",
    parent: "tools",
    isDynamic: true,
  },
  {
    id: "wiki",
    kind: "hub",
    path: "/resources/wiki/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "none",
    parent: "resources",
  },
  {
    id: "wiki-slug",
    kind: "collection",
    path: "/resources/wiki/[slug]/",
    visibility: "public",
    gate: "resources-hub",
    navPlacement: "none",
    collection: "wiki",
    parent: "wiki",
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

// Code-owned root disposition (INV-06). Consumers read root path and visibility
// from this registry, so proof-gated promotion uses the same route pipeline.
export const ROOT_ROUTE_POLICY: { path: string; visibility: Visibility } = (() => {
  const home = ROUTE_REGISTRY.byId("home");
  if (!home) throw new Error("ROUTE_REGISTRY is missing the required 'home' route");
  return { path: home.path, visibility: home.visibility };
})();

export const CODE_OWNED_DISCOVERY_POLICIES: ReadonlyArray<{ path: string; visibility: Visibility }> =
  ["home", "directory"].map((id) => {
    const route = ROUTE_REGISTRY.byId(id);
    if (!route) throw new Error(`ROUTE_REGISTRY is missing the required '${id}' route`);
    return { path: route.path, visibility: route.visibility };
  });
