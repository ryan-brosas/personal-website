// JSON-LD entity-graph builder.
// Produces a single schema.org `@graph` describing the site + the current page:
// Person (#person) / WebSite (#website) as site identity, plus a WebPage
// (<canonical>#webpage), optional Service / Article, and a BreadcrumbList for the
// page. Stable `@id` anchors are keyed off the EXPLICIT `site` origin passed by
// the caller (never derived from env here) so tests and builds are deterministic
// and the placeholder origin can never leak in. Pure module (no Astro runtime,
// no `any`) — Node-testable.
//
// INV-03 (structured data describes ONLY visible content): a WebPage / Article /
// BreadcrumbList is emitted ONLY for a `public` page. `noindex` and `draft` pages
// keep the global site identity (Person / WebSite) but contribute NO page node.
import { ROUTE_REGISTRY } from "../config/routes.ts";
import { PERSON_ENTITY } from "../config/entities.ts";
import type { Breadcrumb } from "./route-registry.ts";
import { canonicalHref } from "./routes.ts";
import type { Visibility } from "./publishing.ts";

// A JSON-LD node is an open string-keyed object; values are schema.org content.
type JsonLdNode = Record<string, unknown>;

/** The schema.org graph envelope emitted for a page. */
export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

/** Serializes graph data without allowing a value to terminate its script element. */
export const serializeJsonLd = (graph: JsonLdGraph): string =>
  JSON.stringify(graph).replaceAll("<", "\\u003c");

/** Page kind → which extra graph node (if any) accompanies the WebPage. */
export type EntityGraphPageKind = "webpage" | "service" | "article";

/**
 * The page projection the graph builder needs. `routeId` resolves canonical +
 * breadcrumbs through the ONE registry; `visibility` gates the page node
 * (INV-03); `title`/`description` are page copy (the registry stores none).
 */
export interface EntityGraphPage {
  routeId: string;
  title: string;
  description: string;
  visibility: Visibility;
  kind?: EntityGraphPageKind;
  // Dynamic-route params (e.g. { slug }) filling the route's [param] segments,
  // so the canonical + breadcrumb @id anchors resolve for a collection entry.
  // Static routes omit this (canonicalFor/breadcrumbsFor tolerate undefined).
  params?: Record<string, string>;
}

export interface BuildEntityGraphInput {
  /** Absolute site origin, e.g. "https://ryanjosebrosas.dev" (trailing slash tolerated). */
  site: string;
  page: EntityGraphPage;
}

// Normalise the passed origin: strip a trailing slash so `${origin}/#person`
// never doubles the slash before the anchor.
const toOrigin = (site: string): string => site.replace(/\/+$/, "");

// ─── Graph builders ──────────────────────────────────────────────────────────

// Person = the single author entity (site identity). `sameAs` projects the
// owner-verified profiles to their URLs (empty today — D-15 deferred).
const buildPersonNode = (origin: string): JsonLdNode => ({
  "@type": "Person",
  "@id": `${origin}/#person`,
  name: PERSON_ENTITY.name,
  jobTitle: PERSON_ENTITY.role,
  description: PERSON_ENTITY.summary,
  sameAs: PERSON_ENTITY.sameAs.map((profile) => profile.url),
  knowsAbout: [...PERSON_ENTITY.knowsAbout],
});

const buildWebsiteNode = (origin: string): JsonLdNode => ({
  "@type": "WebSite",
  "@id": `${origin}/#website`,
  url: `${origin}/`,
  name: PERSON_ENTITY.name,
  publisher: { "@id": `${origin}/#person` },
});

const buildWebPageNode = (
  origin: string,
  canonical: string,
  page: EntityGraphPage,
  hasBreadcrumb: boolean,
): JsonLdNode => ({
  "@type": "WebPage",
  "@id": `${canonical}#webpage`,
  url: canonical,
  name: page.title,
  description: page.description,
  isPartOf: { "@id": `${origin}/#website` },
  about: { "@id": `${origin}/#person` },
  ...(hasBreadcrumb ? { breadcrumb: { "@id": `${canonical}#breadcrumb` } } : {}),
});

const buildServiceNode = (
  origin: string,
  canonical: string,
  page: EntityGraphPage,
): JsonLdNode => ({
  "@type": "Service",
  "@id": `${canonical}#service`,
  name: page.title,
  description: page.description,
  provider: { "@id": `${origin}/#person` },
});

const buildArticleNode = (
  origin: string,
  canonical: string,
  page: EntityGraphPage,
): JsonLdNode => ({
  "@type": "Article",
  "@id": `${canonical}#article`,
  headline: page.title,
  description: page.description,
  author: { "@id": `${origin}/#person` },
  isPartOf: { "@id": `${origin}/#website` },
});

const buildBreadcrumbListNode = (
  origin: string,
  canonical: string,
  trail: Breadcrumb[],
): JsonLdNode => ({
  "@type": "BreadcrumbList",
  "@id": `${canonical}#breadcrumb`,
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.label,
    // schema.org requires an absolute URL; a relative path is not resolvable.
    item: canonicalHref(crumb.path, origin),
  })),
});

// ─── Main entry ──────────────────────────────────────────────────────────────

/**
 * Build the schema.org entity graph for one page.
 *
 * Person + WebSite are always present (global site identity). The page-specific
 * nodes (WebPage / Service / Article / BreadcrumbList) are emitted ONLY for a
 * `public` page — `noindex`/`draft` pages contribute no page node (INV-03).
 *
 * @param site absolute origin (trailing slash tolerated); all `@id` anchors and
 *   the canonical URL are keyed off it — never off env inside this module.
 * @param page the route id, copy, visibility, and optional kind.
 */
export const buildEntityGraph = ({ site, page }: BuildEntityGraphInput): JsonLdGraph => {
  const origin = toOrigin(site);
  const graph: JsonLdNode[] = [buildPersonNode(origin), buildWebsiteNode(origin)];

  // INV-03: only a public page contributes a page node to the graph.
  if (page.visibility === "public") {
    const canonical = ROUTE_REGISTRY.canonicalFor(page.routeId, page.params, origin);
    // A collection entry's route id is a pattern name, so the leaf takes the
    // page title. Static routes titlecase their id correctly and pass nothing.
    const trail = ROUTE_REGISTRY.breadcrumbsFor(
      page.routeId,
      page.params,
      page.params === undefined ? undefined : page.title,
    );
    const hasBreadcrumb = trail.length > 0;

    graph.push(buildWebPageNode(origin, canonical, page, hasBreadcrumb));

    if (page.kind === "service") {
      graph.push(buildServiceNode(origin, canonical, page));
    } else if (page.kind === "article") {
      graph.push(buildArticleNode(origin, canonical, page));
    }

    if (hasBreadcrumb) {
      graph.push(buildBreadcrumbListNode(origin, canonical, trail));
    }
  }

  return { "@context": "https://schema.org", "@graph": graph };
};
