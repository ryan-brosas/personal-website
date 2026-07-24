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

## [2026-07-25] T8 — evidence/freshness/relationship policy kernel

- **DECISION: getRelatedList filters, never relaxes.** Chose a filter over the
  unchanged `resolveRelationship` (drop non-public refs -> empty list) instead of
  adding a "soft" resolve mode. Keeps the public->public invariant single-sourced in
  publishing.ts; the helper is purely additive.
- **DECISION: Result core + one throwing gate for evidence.** Pure resolvers return
  data errors; `assertClaimResolvable` is the only throw (build-time block). Satisfies
  both the "errors as data" standard and the plan's "blocks build on missing/blocked
  refs".
- **DECISION: freshness `now` injected.** No Date.now() in policy logic — keeps the
  kernel pure/testable and deterministic.
- **DECISION: local §12.5 types in evidence.ts, reconcile with T7.** Avoids a merge
  fight over entities.ts; documented the hand-off in the module header.

## [2026-07-25] Task 4 — two sanctioned deviations from "zero literals" (owner-approved)

- **DECISION:** Keep `favicon.svg` as ONE declared literal in the verifier's
  `expectedFileEndpoints`. RATIONALE: it is a `public/` static asset, not a
  ROUTE_REGISTRY route; it cannot be derived. ALTERNATIVE REJECTED: adding favicon
  to the registry (would edit config/routes.ts — forbidden this task, and would
  change the locked route-registry tests).
- **DECISION:** Apply the `gate === "always"` (plus noindex-root) filter in the
  VERIFIER/test, not the registry. RATIONALE: excludes the reserved case-studies
  hub that the registry declares but does not build until T14, without touching the
  guarded route kernel. ALTERNATIVE REJECTED (preferred long-term): make the
  registry gate-aware (`buildableRoutes()`) — deferred to T14 when build + manifest
  converge, at which point this heuristic should be removed.
- **CONSEQUENCE:** verifier and registry momentarily disagree about case-studies
  discoverability (registry says discoverable; verifier says not-yet). This is
  intentional and matches build reality; revisit at T14.
- **DECISION:** New `placeholder-origin` guard is a pure `verifyBuild` option
  (`forbidPlaceholderOrigin`) toggled by the CLI from `SITE_ORIGIN`. RATIONALE:
  keeps env-reading at the boundary, keeps the check unit-testable.
