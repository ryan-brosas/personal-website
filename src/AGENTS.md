# src/ — Code Layer Guide

How the code works. Route/visibility/SEO policy lives in `lib/`; everything else consumes it.
Content contract (schema, frontmatter, editorial) → see `src/content/AGENTS.md`.

## Code Map

| Area | Files | Role |
|------|-------|------|
| `lib/` | 6 | Pure, Node-testable **policy kernel** (no Astro imports). Import policy from here; never re-derive it. |
| `pages/` | 5 | Route + endpoint entries. No barrel/index module. |
| `components/` | 3 | `SeoHead`, `SiteHeader`, `SiteFooter` — presentation shells. |
| `layouts/` | 1 | `BaseLayout.astro` — document shell; imports `styles/global.css`. |
| `config/routes.ts` | 1 | `ROUTE_REGISTRY` — the ONE route source (first-release IA) + registry-derived `ROOT_ROUTE_POLICY`. |
| `config/site.ts` | 1 | Backward-compat shim: `PAGES` + `NAV_ORDER` DERIVED from `ROUTE_REGISTRY.navItems()`. No Home record. |
| `styles/global.css` | 1 | Imports brand tokens from `docs/.../tokens.css`; owns no-JS nav disclosure CSS. |

## lib/ — Policy Kernel (highest signal)

- `publishing.ts` — visibility semantics: `draft` = no route · `noindex` = route, excluded from discovery · `public` = route + discovery.
- `route-registry.ts` — `defineRoutes()` + derived helpers (`pathFor`/`canonicalFor`/`navItems`/`parentFor`/`breadcrumbsFor`/`discoverableRoutes`/`expectedBuildManifest`) + `validateRegistry()` (fail-fast invariants). Route truth lives here (INV-06).
- `routes.ts` — low-level trailing-slash + canonical-path primitives (`canonicalHref`/`isHtmlRoute`/`isFileEndpoint`, `ROOT_ROUTE` token). Root disposition now owned by the registry's `home` entry, not here.
- `site-routes.ts` — resolves `public|noindex` → routes; filters `draft`.
- `discovery.ts` — pure sitemap/robots renderers (public routes only; robots has no `Disallow`, absolute `Sitemap:`).
- `content-schemas.ts` — shared Zod schemas + defaults (see content guide).
- `markdown-safety.ts` — THROWS on raw HTML, `on*` handlers, `javascript:`/`data:` URLs.

## Conventions (this tree)

- HTML routes carry trailing slashes; file endpoints (`404.html`, `robots.txt`, `sitemap.xml`) do NOT.
- `[page].astro` renders only IDs configured in `config/site.ts` — not arbitrary content files.
- Root `/` (`index.astro`) is a code-owned `noindex` shell in M2.
- Primary nav MUST work without JS; `SiteHeader` enhancement fails closed if it cannot init. Exactly one inline enhancement script (enforced by `tests/shell.test.mjs`).
- Every page routes through `BaseLayout` → `SeoHead` + skip link + single `<main id="main">`.

## Anti-Patterns

- Re-deriving visibility/canonical logic in components or pages — always call `lib/`.
- Leaking `draft`/`noindex` into sitemap/robots.
- JS-dependent navigation; JS/HTML assets under `_astro/` (verifier rejects — CSS/SVG/image/font only).
- `allowDangerousHtml: false` (strips instead of failing — keep safety plugin throwing).
