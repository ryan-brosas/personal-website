// W3·T9 (SEO/GEO authority refactor) — the single page-metadata builder. Every
// route's SEO head flows through buildPageMetadata: it looks the route up in the
// ONE registry (INV-06), derives the canonical URL via ROUTE_REGISTRY.canonicalFor
// (never a free-form string — INV-01), derives noindex from the route's registry
// visibility, and lets an explicit caller override win (content-driven noindex,
// per-page title/description). SeoHead.astro consumes the returned PageMetadata
// as its ONLY prop, so canonical and robots policy can never drift from the
// registry. Pure module (no astro runtime imports, no `any`) — Node-testable.
import { ROUTE_REGISTRY } from "../config/routes.ts";
import { PERSON_ENTITY } from "../config/entities.ts";
import { canonicalHref } from "./routes.ts";

// The shared social card. A static asset in public/ — no per-page generation,
// so it stays inside the static contract. scripts/verify-build.mjs allow-lists
// public assets by name, so renaming this file must be a two-file change.
const DEFAULT_OG_IMAGE_PATH = "/og-default.png";

// Open Graph projection. title/description default to the page's own
// title/description; image always resolves so no route ships an unpreviewable
// link. `type` distinguishes editorial records from ordinary pages.
export interface PageOgMetadata {
  title: string;
  description: string;
  image: string;
  type: "website" | "article";
  siteName: string;
}

// The complete, pre-resolved SEO head contract. canonical is an absolute URL
// already routed through the registry — SeoHead emits it verbatim.
export interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  noindex: boolean;
  og: PageOgMetadata;
}

// Caller overrides. title/description come from the page (registry stores no
// copy). noindex overrides the registry-derived default (e.g. the 404 endpoint
// is registry-public but must render noindex, and a content record may flip a
// public route to noindex). og* / image refine the OG block when needed.
export interface PageMetadataOverrides {
  title?: string;
  description?: string;
  noindex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  // Dynamic-route params (e.g. { slug }) filling the route's [param] segments.
  // Static routes omit this; canonicalFor tolerates undefined. Required for a
  // collection route (case-studies-slug) whose canonical needs the slug.
  params?: Record<string, string>;
}

// Build the SEO head for a registered route. Throws on an unknown id so a broken
// link fails fast at build time rather than emitting a blank/incorrect head.
export const buildPageMetadata = (
  routeId: string,
  overrides: PageMetadataOverrides = {},
): PageMetadata => {
  const route = ROUTE_REGISTRY.byId(routeId);
  if (!route) {
    throw new Error(`buildPageMetadata: unknown route id "${routeId}"`);
  }

  // Canonical is derived from the registry (origin resolved from SITE_ORIGIN at
  // call-time inside canonicalFor). Dynamic routes pass their [param] values
  // through overrides.params; static routes omit them (undefined).
  const canonical = ROUTE_REGISTRY.canonicalFor(routeId, overrides.params);

  // noindex defaults to the registry visibility; an explicit override wins.
  const noindex = overrides.noindex ?? route.visibility === "noindex";

  const title = overrides.title ?? "";
  const description = overrides.description ?? "";

  return {
    title,
    description,
    canonical,
    noindex,
    og: {
      title: overrides.ogTitle ?? title,
      description: overrides.ogDescription ?? description,
      // The canonical already carries the resolved origin, so the card URL
      // cannot drift from it or re-read the environment.
      image: overrides.ogImage ?? canonicalHref(DEFAULT_OG_IMAGE_PATH, new URL(canonical).origin),
      type: overrides.ogType ?? "website",
      siteName: PERSON_ENTITY.name,
    },
  };
};
