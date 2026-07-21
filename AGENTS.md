# Personal Website — Agent Guide

Greenfield personal website focused on credible work, SEO, AI-search accessibility,
flexible publishing, and static delivery. No application code or dependencies exist yet.

## Planning Sources

- Read `docs/sitemap.md` before changing routes or content architecture.
- Read `.pi/artifacts/website-concrete-plan/plan.md` for the master plan, evidence, and open decisions.
- Read `.pi/state.md` for current status; `.pi/roadmap.md` for milestone order.

## Planned Stack

- Astro 5.x, static output, strict TypeScript
- Semantic HTML and plain CSS; no UI framework
- Markdown-first Astro Content Collections in `src/content.config.ts`
- `@astrojs/sitemap` and `@astrojs/rss`
- npm and static hosting; exact versions/provider remain uninitialized

## Current Structure

`AGENTS.md` — this guide  
`docs/sitemap.md` — URL map and architecture  
`.pi/tech-stack.md` — planned technologies and boundaries  
`.pi/roadmap.md` / `.pi/state.md` — planning context  
`.pi/artifacts/website-concrete-plan/plan.md` — concrete master plan

## Commands

No build, test, lint, or dev commands exist. After explicit scaffold approval,
validate before documenting: `npm run dev`, `npm run check`, `npm run build`,
and `npm run preview`.

## Architecture Rules

- Use canonical trailing slashes on HTML routes, not file endpoints.
- Reuse hub, entry, and taxonomy patterns; avoid duplicate canonical content.
- Keep case studies in `projects`; promotion must not change `/projects/[slug]/`.
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
- Resolve operator decisions in `.pi/state.md` before writing brand or case-study claims.
- Keep changes scoped; update `docs/sitemap.md` when route architecture changes.
- Verify generated HTML/XML/text, accessibility, redirects, and host behavior before launch claims.
