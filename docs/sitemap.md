# Sitemap — Human-readable route summary

This file is a human-readable summary of the first-release information
architecture. The authoritative source of truth for every route path, canonical
URL, navigation entry, and parent link is `src/config/routes.ts`
(`ROUTE_REGISTRY`). Update `src/config/routes.ts` when route architecture
changes, then keep this document in sync.

## Disposition legend

| Mark | Meaning |
|---|---|
| `active` | Built and present in `ROUTE_REGISTRY` for the first-release IA. |
| `conditional` | Built, but rendered only when its gate is satisfied. |
| `endpoint` | File output (`sitemap.xml`, `robots.txt`, `404.html`); no trailing slash. |

Content visibility (per record, fail-closed): `draft` (no route output), `public`
(included in routes, sitemap, and discovery outputs), `noindex` (crawlable but
excluded from discovery outputs). See `src/lib/publishing.ts` and
`.opencode/artifacts/website-build/plan.md`.

## Route rules

- HTML routes use canonical **trailing slashes**. File endpoints do not.
- One custom metadata-aware `/sitemap.xml` is generated from the public-route
  inventory. The `@astrojs/sitemap` integration is not installed.
- Do not generate thin tag, facet, case-study-subtype, tool, or directory-entry
  pages.
- **Origin strategy:** Plan 01 sets `site` in `astro.config.mjs` to a placeholder
  origin. The production origin is injected at release time. The final domain is
  NOT a build-gate item.

## HTML routes

| Route | Status | Visibility | Gate | Notes |
|---|---|---|---|---|
| `/` | active | `noindex` | `home-proof` | Minimal shell in first release; crawlable but excluded from discovery. Promoted to `public` when the evidence homepage lands (T16). |
| `/services/` | active | `public` | `always` | Labeled **Work With Me** in primary navigation. |
| `/case-studies/` | conditional | `public` | `case-studies-hub` | Hub page built only when at least one public case-study entry exists. Not in primary navigation yet (T14). |
| `/case-studies/[slug]/` | conditional | `public` | `case-studies-hub` | Dynamic entry page; builds only when the case-studies hub gate is satisfied. |
| `/about/` | active | `public` | `always` | Fixed-id singleton. |
| `/contact/` | active | `public` | `always` | External scheduler link + email fallback; no form. |

## File endpoints

| Endpoint | Status | Visibility | Gate | Notes |
|---|---|---|---|---|
| `/sitemap.xml` | endpoint | `public` | `always` | Generated from the public-route inventory. Excludes `draft` and `noindex` routes. |
| `/robots.txt` | endpoint | `public` | `always` | Generated from final origin. Crawlable; not a privacy/authorization boundary. |
| `/404.html` | endpoint | `public` | `always` | Real 404 status on the host. |

## Deferred routes (out of scope for first release)

Additional routes from the full design document are intentionally not registered
in the first-release IA. They land with their content collections and gates in
later slices. See `.opencode/artifacts/website-build/plan.md` for ordering.

## Absent routes (explicitly NOT created)

| Route | Reason |
|---|---|
| `/tags/`, `/tags/[tag]/` | No thin tag pages. Tags are controlled metadata, not routes. |
| AI/design capability routes | AI and website-design work are case-study metadata, not separate route families. |
| Nested gateway paths | Gateway routes group navigation only; no nested canonical copies. |
| Directory-entry detail pages below threshold | Only substantive editorial entries get detail routes. |
| Form endpoints | No form backend; contact uses external scheduler + email. |
| Search/filter routes | No dynamic filtering/search state. |
| Generated OG image routes | No generated OG images. |
| Theme switcher routes | No theme toggle. |

## Plan → route map

| Plan | Builds | Milestone |
|---|---|---|
| 01 | `/sitemap.xml`, `/robots.txt` | M1 |
| 03 | `/services/`, `/about/`, `/contact/`, `/404.html`, minimal `/` shell | M2 |
| 04 | `/case-studies/`, `/case-studies/[slug]/` (first case study), evidence/curation homepage | M3 |

## Self-hosted Pages CMS (not a public route)

Pages CMS 2.1.8 is planned to run on the operator VPS at
`https://cms.ryanjosebrosas.dev` behind host Caddy. It is an editing layer only
— it writes approved content to this Git repository; it is not shipped with,
queried by, or routed through the public static site. It is required before the
first public release (M3) but does not gate local implementation. See
`.opencode/artifacts/website-build/decisions.md` ADR-002. This entry records the
boundary; `cms.ryanjosebrosas.dev` is not part of the public sitemap.
