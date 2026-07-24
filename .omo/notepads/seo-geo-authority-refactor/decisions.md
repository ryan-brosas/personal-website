# Decisions — seo-geo-authority-refactor

Architectural choices and rationales discovered during work on this plan.

_Auto-scaffolded by /start-work. Append new entries below - never overwrite._

---

## [2026-07-24T20:32:17Z] Task: T5

Rewrote `docs/sitemap.md` to derive from `src/config/routes.ts` (`ROUTE_REGISTRY`)
rather than acting as the authority. The first-release IA now documents only the
registry routes: `/`, `/services/`, `/case-studies/`, `/case-studies/[slug]/`,
`/about/`, `/contact/`, plus endpoints `/sitemap.xml`, `/robots.txt`,
`/404.html`. Removed routes such as `/projects/`, `/blog/`, `/directories/`,
`/tools/`, and `/resources/` from the launch disposition; they are out of scope
for the first releasable increment.

Updated root `AGENTS.md` so that `src/config/routes.ts` is listed as the
executable authority and `docs/sitemap.md` is the human-readable derivative. Also
updated the Code Map to describe `src/config/site.ts` as a backward-compatibility
shim derived from the registry, and corrected the case-study path rule to
`/case-studies/[slug]/`.

Verification:
- `grep -r "/projects/\|/blog/\|/directories/" docs/sitemap.md` returned no matches.
- `NODE_ENV=test npm test` passed 142/142.
