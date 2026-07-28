# src/ — Code Layer Guide

How the code works. Route/visibility/SEO policy lives in `lib/`; everything else consumes it.
Content contract (schema, frontmatter, editorial) → see `src/content/AGENTS.md`.

## Code Map

| Area | Files | Role |
|------|-------|------|
| `lib/` | 13 | Pure, Node-testable **policy kernel** (no Astro imports). Import policy from here; never re-derive it. |
| `pages/` | 9 | Route + endpoint entries. No barrel/index module. |
| `components/` | 10 | `SeoHead`, `SiteHeader`, `SiteFooter`, `Breadcrumbs`, `JsonLd`, `Byline`, `EvidenceNote`, `FreshnessNotice`, `RelatedContent` + the `authority.ts` decision seam. |
| `content/` | 1 TS helper + validated content | Runtime collection route projections plus Markdown/JSON records. |
| `layouts/` | 3 | `BaseLayout.astro` (document shell; imports `styles/global.css`), `CommercialLayout.astro`, `CaseStudyLayout.astro`. |
| `config/routes.ts` | 1 | `ROUTE_REGISTRY` — the ONE route source (first-release IA) + registry-derived `ROOT_ROUTE_POLICY`. |
| `config/site.ts` | 1 | Backward-compat shim: `PAGES` + `NAV_ORDER` DERIVED from `ROUTE_REGISTRY.navItems()`. No Home record. |
| `styles/global.css` | 1 | Self-contained semantic token source + structural shell CSS; owns no-JS nav disclosure CSS. |

## lib/ — Policy Kernel (highest signal)

- `publishing.ts` — visibility semantics: `draft` = no route · `noindex` = route, excluded from discovery · `public` = route + discovery.
- `route-registry.ts` — `defineRoutes()` + derived helpers (`pathFor`/`canonicalFor`/`navItems`/`parentFor`/`breadcrumbsFor`/`discoverableRoutes`/`expectedBuildManifest`) + `validateRegistry()` (fail-fast invariants). Route truth lives here (INV-06).
- `routes.ts` — low-level trailing-slash + canonical-path primitives (`canonicalHref`/`isHtmlRoute`/`isFileEndpoint`, `ROOT_ROUTE` token). Root disposition now owned by the registry's `home` entry, not here.
- `site-routes.ts` — resolves `public|noindex` → routes; filters `draft`. `resolveCollectionDiscoveryRoutes` (discovery, public-only) and `resolveCollectionEntryRoutes` (routable, public|noindex) split collection routing from discovery.
- `discovery.ts` — pure sitemap/robots renderers (public routes only; robots has no `Disallow`, absolute `Sitemap:`).
- `content-schemas.ts` — shared Zod schemas + defaults (see content guide).
- `markdown-safety.ts` — THROWS on raw HTML, `on*` handlers, `javascript:`/`data:` URLs.
- `evidence.ts` — claim→source resolution kernel (INV-09).
- `home-proof.ts` — homepage promotion proof gate + rendered claim projection.
- `freshness.ts` — substantive-change freshness policy (INV-13).
- `relationships.ts` — public→public-only related-content helper (INV-11).
- `structured-data.ts` — JSON-LD entity-graph builder (INV-03).
- `metadata.ts` — single page-metadata builder (canonical + robots from the registry).
- `site-origin.ts` — production origin guard (INV-12).

## Conventions (this tree)

- HTML routes carry trailing slashes; file endpoints (`404.html`, `robots.txt`, `sitemap.xml`) do NOT.
- `[page].astro` renders only IDs configured in `config/site.ts` — not arbitrary content files.
- Root `/` (`index.astro`) is a proof-gated homepage: `public` only when the self-project case study is public with verified, resolvable evidence and every homepage claim resolves (`src/lib/home-proof.ts`); otherwise `noindex`.
- Primary nav MUST work without JS; `SiteHeader` enhancement fails closed if it cannot init. Exactly one inline enhancement script (enforced by `tests/shell.test.mjs`).
- Every page routes through `BaseLayout` → `SeoHead` + skip link + single `<main id="main">`.

## Anti-Patterns

- Re-deriving visibility/canonical logic in components or pages — always call `lib/`.
- Leaking `draft`/`noindex` into sitemap/robots.
- JS-dependent navigation; JS/HTML assets under `_astro/` (verifier rejects — CSS/SVG/image/font only).
- `allowDangerousHtml: false` (strips instead of failing — keep safety plugin throwing).
