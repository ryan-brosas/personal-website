# Website Build - Slice Checklist

<!-- Plan-scoped task list for the website-build plan. Companion to plan.md.
     Update status as slices progress. Do not delete completed entries.
     Milestones (M0-M8) live in .opencode/roadmap.md; live blockers live in
     .opencode/state.md. -->

## Architecture decisions

- [x] Approve self-hosted Pages CMS (2.1.8) on the operator VPS as the conditional Git-backed Content Desk
- [x] Keep website content in Git; isolated PostgreSQL container holds CMS application state only
- [x] Require a one-collection authenticated desktop/390px mobile tracer before broad CMS rollout
- [x] Keep routes, templates, schemas, private evidence, and deployment code outside the Content Desk
- [x] Defer the OpenCode operations skill until manual deploy/backup/restore is proven working
- [x] Adopt incremental public releases (credible core first); modules promote independently
- [x] Require self-hosted Pages CMS before the first public release (M3); it does not block local M0-M2 work
- [x] Approve Signal Path — Editorial Cut as the homepage-only expressive motion direction; keep internal routes functionally restrained

## Build gate (gates local implementation — Plan 01)

- [x] Resolve `.pi` -> `.opencode` migration decision and confirm planning root
- [x] Update stale `.pi` references in `AGENTS.md` (or restore `.pi`)
- [x] Publish `docs/sitemap.md` route-disposition contract (every route marked once)
- [x] Confirm `git status --short` contains only operator-approved planning changes (clean after `e5956d5`)
- [ ] Record explicit scaffold authorization
- [ ] Re-pin toolchain against current registry (plan pins Astro 5.18.2/TS 6.0.3; latest Astro 7.1.3/TS 7.0.2)

## Content Desk track (gates Plan 02, Plan 08, and M3 — not local work)

- [ ] Approve operator VPS as the Pages CMS host and confirm coexistence with existing services (openviking, omniroute, native PG 18.4 on 5433)
- [ ] Choose isolated PostgreSQL container (16) over the native PG 18.4 cluster; confirm private Compose network and no published PG host port
- [ ] Approve Caddy reverse-proxy config for `cms.ryanjosebrosas.dev` (currently HTTP 525)
- [ ] Approve S3-compatible backup provider, bucket, credentials, retention, and restore-drill cadence
- [ ] Approve self-hosted Pages CMS GitHub App scope (broad: Administration, Actions, Contents r/w) and revocation procedure; confirm branch/ruleset protections
- [ ] Pass authenticated desktop/390px mobile tracer on one representative collection (Plan 02)

## Release/content track (gates only their downstream milestones)

- [ ] Record final production domain (release track)
- [ ] Record static host and CI provider (release track)
- [ ] Record approved GitHub repository/default branch + Pages CMS owner (release + Content Desk)
- [ ] Record scheduler URL and public email fallback; decide on `/privacy/` (Contact + M3)
- [ ] Create `docs/content-source-manifest.md` (public-safe paths, permissions, approvals)
- [ ] Create `docs/launch-contract.md` (domain, host, scheduler, email fallback)
- [ ] Record mixed-source asset/claim public-use permissions (content tracks M4-M6)
- [ ] Operator approval recorded; one redacted real-work artifact cleared for homepage (M3)

## Slices

- [ ] P01 - Policy-kernel tracer (Astro baseline + publishing contracts + discovery output) — M1
- [ ] P02 - Pages CMS mobile tracer (one directory-entry form + validation action + authenticated responsive acceptance) — Content Desk track
- [ ] P02A - Signal Path prototype and visual acceptance (canonical proof + no-JS mobile-nav repair + durable responsive/accessibility/performance decision) — gates P02B
- [ ] P02B - Signal Path canonicalization and distribution (motion contract + local mirrors/capture + verified published `user:brand-design-system`) — gates P03 Task 1 visual integration and P04 choreography
- [ ] P03 - Brand shell and core pages (asset boundary + semantic shell + editable fixed-ID pages + About/Services/Contact/404 + minimal `/` shell) — M2
- [ ] P04 - Project proof and homepage (one project + evidence primitives + evidence/curation homepage) — M3
- [ ] P05 - Blog, relationships, and RSS (hub/entry + related links + excerpt-only RSS) — M4
- [ ] P06 - Agent Workflow Tools directory (methodology + records + hubs + freshness) — M5
- [ ] P07 - Static LLM Watcher (snapshot data + tool page + stale-state behavior) — M6
- [ ] P08 - Content Desk expansion (per-module; all public content + safe media) — does not block releases
- [ ] P09 - Resources integration and quality gate (gateway + output verifier + e2e tests) — M7
- [ ] P10 - Deployment and launch (reusable release track; first use = credible core) — release track
- [ ] P11 - Optional `llms.txt` experiment (post-launch, only after a named usage hypothesis) — M8

## Parallelization note

Plan 02A may run after the Plan 00 repository baseline, in parallel with Plans 01/02;
Plan 02B waits for accepted P02A. Plan 03 may start semantic shell work after Plan 01,
but its Task 1 shared visual integration and M2 completion wait for P02B. Plan 04 waits
for P02B; Plans 04-07 may otherwise run in parallel after Plan 03. Plan 08 expands per
module and does not block independent releases of Plans 04-07 or Plan 09. Stop and
coordinate if any slice needs to alter shared schemas
(`src/content.config.ts`), Content Desk configuration (`.pages.yml`), route policy
(`src/lib/publishing.ts`, `src/lib/routes.ts`), the accepted motion contract, or the
output verifier. Plan 08 owns broad `.pages.yml` expansion.

## Verify gate (default for every code plan)

```bash
npm ci
npm run check
npm test
npm run build
npm run verify
```
