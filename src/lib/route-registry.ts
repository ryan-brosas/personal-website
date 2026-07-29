// Route-registry kernel: the single
// executable source of route truth. Pure module (no astro runtime imports, no
// `any`), Node-testable. `defineRoutes` validates a route inventory at
// construction time (fail-fast) and returns derived helpers; every other module
// reads route truth from here instead of re-deriving paths, canonicals, nav, or
// parent links.
//
// Route contract (docs/sitemap.md + design doc §13, §15 invariants):
//   INV-01 one trailing-slash canonical per HTML route
//   INV-02 file endpoints carry NO trailing slash
//   INV-06 ALL route truth from ONE registry
//   INV-07 a hub declares a min-child gate
import { canonicalHref, isHtmlRoute, isFileEndpoint, labelFromRouteId } from "./routes.ts";
import { isRoutable } from "./publishing.ts";
import type { Visibility } from "./publishing.ts";

// Minimal ambient declaration so TypeScript accepts `process.env` without
// requiring @types/node. Astro/Vite and the Node test runner both provide
// `process` at runtime; this declaration is type-only and has no runtime cost.
declare const process: { env: Record<string, string | undefined> };

export type RouteKind = "singleton" | "hub" | "collection" | "file" | "utility";
export type NavPlacement = "primary" | "footer" | "secondary" | "none";

// Nav label keys are the settings-backed labels (SettingsData.navLabels). Only
// routes whose label lives in settings may carry one; new nav entries land
// together with their settings key.
export type NavLabelKey = "about" | "services" | "contact" | "caseStudies" | "resources";

export type RouteGateId =
  | "always"
  | "home-proof"
  | "case-studies-hub"
  | "resources-hub"
  | "insights-hub"
  | "research-hub"
  | "privacy-required"
  | "llms-experiment";

// One route record. `path` is the canonical pattern; dynamic collection routes
// use a `[param]` segment (e.g. /case-studies/[slug]/). Visibility reuses the
// publishing kernel literals so the registry, sitemap, and nav share one policy.
export interface RouteDefinition {
  id: string;
  kind: RouteKind;
  path: string;
  visibility: Visibility;
  gate: RouteGateId;
  navPlacement: NavPlacement;
  navLabelKey?: NavLabelKey;
  navOrder?: number;
  navEmphasis?: boolean;
  collection?: string;
  parent?: string;
  isDynamic?: boolean;
  isEndpoint?: boolean;
}

// A nav-ready projection of a primary-nav route. navLabelKey is required here
// (validation guarantees primary routes carry one) so callers can index
// SettingsData.navLabels without a widening cast.
export interface NavItem {
  id: string;
  path: string;
  navLabelKey: NavLabelKey;
  visibility: Visibility;
  emphasis: boolean;
}

export interface Breadcrumb {
  id: string;
  path: string;
  /** Display copy. Derived from the route id, or the leaf override for a
   * collection entry whose id is a pattern name ("case-studies-slug"). */
  label: string;
}

export interface RouteRegistry {
  all(): RouteDefinition[];
  byId(id: string): RouteDefinition | undefined;
  navItems(): NavItem[];
  pathFor(id: string, params?: Record<string, string>): string;
  canonicalFor(id: string, params: Record<string, string> | undefined, origin?: string): string;
  parentFor(id: string): RouteDefinition | undefined;
  breadcrumbsFor(
    id: string,
    params?: Record<string, string>,
    leafLabel?: string,
  ): Breadcrumb[];
  discoverableRoutes(): RouteDefinition[];
  expectedBuildManifest(): string[];
}

// The gates actually WIRED in the first release. A route may only reference a
// gate whose promotion logic exists; declaring a not-yet-implemented gate (e.g.
// insights-hub / research-hub / privacy-required / llms-experiment — reserved in
// RouteGateId for later slices) is a build-time error, not a silent no-op (INV-15
// keeps experimental surfaces out until their gate ships).
const IMPLEMENTED_GATES: ReadonlySet<RouteGateId> = new Set([
  "always",
  "home-proof",
  "case-studies-hub",
  "resources-hub",
]);

const DYNAMIC_SEGMENT = /\[([^\]]+)\]/g;

// Substitute [param] segments from `params`. Static paths pass through
// unchanged. Throws on a missing param so a broken link fails at call time,
// never silently renders a literal "[slug]".
const substituteParams = (path: string, params?: Record<string, string>): string =>
  path.replace(DYNAMIC_SEGMENT, (_match, key: string) => {
    const value = params?.[key];
    if (value === undefined || value === "") {
      throw new Error(`pathFor: missing route param "${key}" for pattern "${path}"`);
    }
    return value;
  });

// Import/test-time invariants. Throws on the first violation with a message
// naming the offending route so the registry cannot ship malformed truth.
export const validateRegistry = (defs: readonly RouteDefinition[]): void => {
  const seenIds = new Set<string>();
  const seenPaths = new Set<string>();
  const ids = new Set(defs.map((d) => d.id));

  for (const def of defs) {
    if (seenIds.has(def.id)) {
      throw new Error(`validateRegistry: duplicate route id "${def.id}"`);
    }
    seenIds.add(def.id);

    if (seenPaths.has(def.path)) {
      throw new Error(`validateRegistry: duplicate route path "${def.path}"`);
    }
    seenPaths.add(def.path);

    if (def.isDynamic && !def.path.includes("[")) {
      throw new Error(
        `validateRegistry: dynamic route "${def.id}" has malformed pattern "${def.path}" (no [param] segment)`,
      );
    }

    // Endpoint intent comes from the declared flag OR a file extension in the
    // path; a trailing slash on an endpoint hides the extension from path
    // sniffing, so the flag is authoritative for the slash check (INV-02).
    const isEndpoint = def.isEndpoint === true || isFileEndpoint(def.path);
    if (isEndpoint) {
      if (def.path.endsWith("/")) {
        throw new Error(
          `validateRegistry: file endpoint "${def.id}" (${def.path}) must not have a trailing slash`,
        );
      }
    } else if (!def.path.endsWith("/")) {
      throw new Error(
        `validateRegistry: HTML route "${def.id}" (${def.path}) must have a trailing slash`,
      );
    }

    if (def.parent !== undefined && !ids.has(def.parent)) {
      throw new Error(
        `validateRegistry: route "${def.id}" references missing parent "${def.parent}"`,
      );
    }

    if (def.navPlacement === "primary" && def.navLabelKey === undefined) {
      throw new Error(`validateRegistry: primary-nav route "${def.id}" must declare a navLabelKey`);
    }

    // A primary-nav entry advertises a route in the public surface; it must point
    // at a public-capable (routable: public|noindex) route, never a `draft` one
    // that emits no route at all (nav-without-public — a dangling nav link).
    if (def.navPlacement === "primary" && !isRoutable(def.visibility)) {
      throw new Error(
        `validateRegistry: primary-nav route "${def.id}" must target a public-capable route (visibility "${def.visibility}" emits no route)`,
      );
    }

    // A route may only reference a gate whose promotion logic is implemented; a
    // reserved-but-unbuilt gate would silently never promote (gate-without-impl).
    if (!IMPLEMENTED_GATES.has(def.gate)) {
      throw new Error(
        `validateRegistry: route "${def.id}" references non-implemented gate "${def.gate}"`,
      );
    }
  }
};

// Build a validated registry with derived helpers. Validation runs first, so an
// invalid inventory throws before any helper can read it.
export const defineRoutes = (defs: readonly RouteDefinition[]): RouteRegistry => {
  validateRegistry(defs);
  const list: RouteDefinition[] = [...defs];
  const byIdMap = new Map(list.map((d) => [d.id, d]));

  const byId = (id: string): RouteDefinition | undefined => byIdMap.get(id);

  const require = (id: string): RouteDefinition => {
    const def = byIdMap.get(id);
    if (!def) throw new Error(`route "${id}" is not registered`);
    return def;
  };

  const pathFor = (id: string, params?: Record<string, string>): string =>
    substituteParams(require(id).path, params);

  const navItems = (): NavItem[] => {
    const items: NavItem[] = [];
    for (const def of list) {
      if (def.navPlacement !== "primary") continue;
      if (def.navLabelKey === undefined) continue;
      items.push({
        id: def.id,
        path: def.path,
        navLabelKey: def.navLabelKey,
        visibility: def.visibility,
        emphasis: def.navEmphasis === true,
      });
    }
    return items.sort((a, b) => {
      const orderA = require(a.id).navOrder ?? 0;
      const orderB = require(b.id).navOrder ?? 0;
      return orderA - orderB;
    });
  };

  const parentFor = (id: string): RouteDefinition | undefined => {
    const def = byIdMap.get(id);
    if (!def || def.parent === undefined) return undefined;
    return byIdMap.get(def.parent);
  };

  // Ancestor→self trail for breadcrumb UIs. The code-owned root ("home") is
  // suppressed (it owns the brand link, not a breadcrumb crumb).
  const breadcrumbsFor = (
    id: string,
    params?: Record<string, string>,
    leafLabel?: string,
  ): Breadcrumb[] => {
    const trail: Breadcrumb[] = [];
    let current: RouteDefinition | undefined = require(id);
    let cursorParams: Record<string, string> | undefined = params;
    while (current) {
      if (current.id !== "home") {
        trail.unshift({
          id: current.id,
          path: substituteParams(current.path, cursorParams),
          // Only the leaf may be overridden; ancestors are static hubs whose id
          // already titlecases correctly.
          label: (current.id === id ? leafLabel : undefined) ?? labelFromRouteId(current.id),
        });
      }
      // Ancestors are static hubs/singletons; their patterns take no params.
      cursorParams = undefined;
      current = current.parent === undefined ? undefined : byIdMap.get(current.parent);
    }
    return trail;
  };

  return {
    all: () => [...list],
    byId,
    navItems,
    pathFor,
    // Read SITE_ORIGIN at call-time so JSON-LD @id values reflect the real
    // origin in production builds. Explicit `origin` arg (used by tests) takes
    // precedence; env var is the production path; placeholder is the dev/test
    // fallback. `process` is declared above (ambient) — no @types/node needed.
    canonicalFor: (id, params, origin) =>
      canonicalHref(
        pathFor(id, params),
        origin ?? process.env["SITE_ORIGIN"] ?? "https://example.com",
      ),
    parentFor,
    breadcrumbsFor,
    // Static HTML routes eligible for discovery outputs (sitemap/nav): public
    // visibility, not dynamic, HTML (not a file endpoint). noindex (home) and
    // endpoints are excluded here; per-record collection discovery is layered
    // on by discovery.ts once collection content exists.
    discoverableRoutes: () =>
      list.filter((d) => d.visibility === "public" && d.isDynamic !== true && isHtmlRoute(d.path)),
    // Declared static build targets (every non-dynamic route path). Collection
    // routes expand per-record at build time and are intentionally excluded.
    expectedBuildManifest: () => list.filter((d) => d.isDynamic !== true).map((d) => d.path),
  };
};
