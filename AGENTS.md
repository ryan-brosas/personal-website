# Personal Website — Agent Guide

Personal website focused on credible work, SEO, AI-search accessibility,
flexible publishing, and static delivery. Astro scaffold is committed (M1 complete);
M2 (accessible core shell) is in progress.

## Planning Sources

- Read `src/config/routes.ts` (`ROUTE_REGISTRY`) before changing routes or content
  architecture; it is the executable, authoritative source of truth for every
  route path, canonical URL, navigation entry, and parent link.
- Read `docs/sitemap.md` for a human-readable summary of the route disposition;
  it is derived from `ROUTE_REGISTRY`, not the authority.
- Read `.opencode/artifacts/website-build/plan.md` for the master plan, status, open blockers, and dependency graph.
- Read `.opencode/tech-stack.md` for planned technologies and boundaries.

## Planned Stack

- Astro 5.18.2, static output, strict TypeScript (pinned M1)
- Semantic HTML and plain CSS; no UI framework
- Markdown-first Astro Content Collections in `src/content.config.ts`
- Custom metadata-aware sitemap and `@astrojs/rss`
- Self-hosted Pages CMS (2.1.8) on the operator VPS behind Caddy as a Git-backed editing layer; isolated PostgreSQL holds CMS application state only, and no CMS runtime ships with the public site
- npm 11.13.0; static hosting provider uninitialized (release track)

## Current Structure

`AGENTS.md` — this guide<br>
`src/config/routes.ts` — authoritative route registry (`ROUTE_REGISTRY`)<br>
`docs/sitemap.md` — human-readable route-disposition summary (derived from `ROUTE_REGISTRY`)<br>
`.opencode/tech-stack.md` — planned technologies and boundaries<br>
`.opencode/artifacts/website-build/plan.md` — master plan, status, and open blockers<br>
`.opencode/artifacts/website-build/todo.md` — slice checklist<br>
`.opencode/artifacts/website-build/decisions.md` — accepted architecture decisions

## Code Map

- `src/lib/` — pure, Node-testable **policy kernel** (visibility, routes, canonical, discovery, markdown safety). Import policy from here; never re-derive it. Details: `src/AGENTS.md`.
- `src/pages/` — route + endpoint entries; `src/components/`, `src/layouts/`, `src/styles/` — presentation shell.
- `src/config/routes.ts` — single route registry (`ROUTE_REGISTRY`). The source of truth for all route paths, canonical URLs, nav entries, and parent links.
- `src/config/site.ts` — backward-compatibility shim; `PAGES` and `NAV_ORDER` are derived from `ROUTE_REGISTRY`.
- `src/content/` — Markdown pages + settings singleton; schema/editorial contract in `src/content/AGENTS.md`.

## Commands

Scaffold is committed. Validate before documenting:
`npm run dev` (local server), `npm run check` (types), `npm test` (Node runner),
`npm run build` (static output), `npm run preview` (built output), `npm run verify`
(read-only output contract).

Default verification gate: `npm run check && npm test && npm run build && npm run verify`.
No lint/format script and no CI workflows exist — the gate above is the contract.

## Architecture Rules

- Use canonical trailing slashes on HTML routes, not file endpoints.
- Reuse hub, entry, and taxonomy patterns; avoid duplicate canonical content.
- Keep case studies in `case-studies`; promotion must not change `/case-studies/[slug]/`.
- Centralize site identity, canonical URLs, visibility, relationships, and SEO output.
- Use one visibility policy for routes, sitemap, RSS, tags, related content, and AI files.
- Keep tools static-first; add SSR only for a demonstrated live-data requirement.
- Use controlled tags cross-content; categories/facets belong to directories.
- Do not generate thin tag, facet, project, tool, or directory-entry pages.

## SEO, AI, and Editorial Boundaries

- Ordinary SEO fundamentals come first; do not promise indexing, ranking, rich results, or AI citation.
- Structured data must match visible content; `llms.txt` is optional/experimental.
- Separate search/retrieval crawler policy from model-training policy and revalidate bots before launch.
- Drafts generate no routes. Rendered `noindex` pages stay crawlable but are excluded from discovery outputs.
- Sitemap exclusion is explicit; Astro includes generated routes by default.
- Claims, metrics, testimonials, logos, dates, and freshness require evidence and permission.
- Never commit raw analytics, contracts, customer data, credentials, or private approval records.
- Complete content, navigation, and core discovery must work without JavaScript.

## Workflow

- Planning and `/init` may edit planning documents only; never scaffold implicitly.
- Resolve open blockers in `.opencode/artifacts/website-build/plan.md` before writing brand or case-study claims.
- Keep changes scoped; update `docs/sitemap.md` when route architecture changes.
- Verify generated HTML/XML/text, accessibility, redirects, and host behavior before launch claims.
