---
purpose: Current project position, active decisions, blockers, and session handoff
updated: 2026-07-24
---

# State

This file is the "you are here" marker for the project. It records position,
decisions, blockers, and handoff context — it is not a second task tracker.
Node-level execution state lives in each slug's `plan.md` `## Task Graph`;
cross-slug lifecycle state lives in `project-status.md`.

## Current Position

**Active slug:** `m2-accessible-core-shell-closeout` — M2 aggregate close (doc-only ledger sync)
**Roadmap phase:** P3 — Accessible Core Shell
**Lifecycle:** verified
**Started:** 2026-07-22

## Recent Completed Work

| Slug | Roadmap phase | Completed | Summary |
|---|---|---|---|
| `m2-accessible-core-shell-closeout` | P3 | 2026-07-24 | M2 aggregate close: ledger reconciliation and hash lineage recorded in `.state/`, tracking artifacts updated; screen-reader smoke carried forward as P4 pre-release gate |
| `m2-accessibility-acceptance` | P3 | 2026-07-22 | Real browser accessibility evidence for all 5 routes; 122/122 tests; screen-reader smoke BLOCKED on no reader installed (`3ccbf1f`) |
| `m2-contact-page` | P3 | 2026-07-22 | `/contact/` shipped; settings-driven scheduler/email links; 122/122 tests (`c6dfdf7`) |
| `m2-brand-shell` | P3 | 2026-07-22 | Favicon + brand tokens + progressive mobile nav; 119/119 tests (`1f305f4`) |
| `m2-core-pages` | P3 | 2026-07-22 | First public content routes `/about/` + `/services/` shipped; markdown body safety guard landed; 106/106 tests (`333c074`) |
| `m2-semantic-shell` | P3 | 2026-07-22 | First HTML routes `/` (noindex) + `/404.html` shipped; 88/88 tests (`1d3e65a`) |
| `m2-content-route-contracts` | P3 | 2026-07-22 | Content route contracts; 82/82 tests (`8cf77ab`) |
| M1 (Proven Static Foundation) | P2 | 2026-07-22 | Pinned Astro 5.18.2 / TS 6.0.3 / `@astrojs/check` 0.9.9; policy kernel; publishing contracts; discovery output; read-only verifier; 57/57 tests (`9fd70ce`) |

## Active Decisions

| Date | Decision | Rationale | Impact |
|---|---|---|---|
| 2026-07-22 | Incremental public releases; credible core (M3/P4) first | Blog/Directory/LLM Watcher/Resources promote independently | Roadmap P4 is the first public release; P5–P8 are independent |
| 2026-07-22 | Self-hosted Pages CMS 2.1.8 on operator VPS behind Caddy | Isolated PG 16 for CMS state only; website content stays in Git | Required before P4 public release; does not gate P1–P3 local work |
| 2026-07-22 | Fail-closed visibility enum `draft \| public \| noindex` | One policy drives all discovery surfaces | Routes, sitemap, robots, RSS, curation, AI outputs |
| 2026-07-22 | Custom metadata-aware `/sitemap.xml`; `@astrojs/sitemap` not installed | Centralized route/visibility inventory | One visibility policy drives all discovery outputs |
| 2026-07-22 | Static Astro, strict TS, semantic HTML, plain CSS, no UI framework | No-JS accessibility + SEO fundamentals | No MDX, no SSR, no runtime CMS on public site |
| 2026-07-22 | Authenticated desktop/390px mobile tracer gates broad CMS rollout | Prove the editing surface before relying on it | Gates P4; Git editing remains the fallback |
| 2026-07-22 | Signal Path — Editorial Cut is the approved homepage art direction | One finite System Conductor trace + editorial choreography on `/` only | P02A accepted; P02B locally complete; remote sync deferred by operator |
| 2026-07-22 | Toolchain pins: Astro 5.18.2 / TS 6.0.3 / `@astrojs/check` 0.9.9 | `@astrojs/check` 0.9.9 peers `typescript: ^5.0.0 \|\| ^6.0.0` — TS 7 unsupported | Astro 7 / TS 7 declined; revalidate at scaffold time |
| 2026-07-24 | OMP-native `.state/` initialized from legacy `.pi`/`.opencode` artifacts | Consolidate planning context into canonical OMP state | `tech-stack.md`, `project.md`, `roadmap.md`, `state.md`, `user.md`, `project-status.md`, `project-memory.md` created |

## Blockers

| Slug | Blocker | Since | Owner |
|---|---|---|---|
| `m2-accessible-core-shell-closeout` | Screen-reader smoke BLOCKED on no reader installed (pre-release gate, not M2 code gate) | 2026-07-22 | Operator (install a reader to re-open) |
| `m3-launch-inputs` | `[GATE]` Authenticated Pages CMS editor must pass desktop + 390px mobile tracer before broad CMS rollout and before P4 public release | 2026-07-22 | Operator |
| `m3-launch-inputs` | `[GATE]` CMS infrastructure approvals (VPS host, isolated PG 16, Caddy config, S3 backup, GitHub App scope/revocation) | 2026-07-22 | Operator |
| `m3-launch-inputs` | `[GATE]` Final domain + host/CI provider gate the release track (P4) | 2026-07-22 | Operator |
| `m3-launch-inputs` | `[GATE]` One approved redacted real-work project artifact | 2026-07-22 | Operator |

## Open Questions

| Question | Context | Blocking | Priority |
|---|---|---|---|
| When to flip `ROOT_ROUTE_POLICY` from `noindex` to `public`? | Root stays out of sitemap until homepage is ready (P4) | P4 | Med |
| Remote brand-package sync (P02B) — still deferred? | Local repo is authoritative; remote sync deferred by operator 2026-07-22 | No | Low |

## Context Notes

### Technical

- Policy kernel pattern: `publishing.ts` → `content-schemas.ts` → `content.config.ts` → `site-routes.ts` → `discovery.ts`/`routes.ts`; markdown safety guard in rehype pipeline.
- Build-time vs runtime: all data loading, route generation, schema validation, discovery output happen at build. Ships: static HTML + CSS + one inline nav-enhancement script.
- All gates green as of 2026-07-24: `npm run check` (0 errors), `npm test` (122 pass), `npm run build` (5 pages), `npm run verify` (ok), `npm run dev` (loopback 200).

### Product

- Homepage evidence/curation is owned by P4 (M3), not P3 (M2). P3 may ship a minimal `/` shell.
- Releases are incremental; P4 is the first public release.

### Process

- `.state/` is the canonical OMP-native state; `.pi/` and `.opencode/` are legacy and not modified by this init.
- Build incrementally, slice by slice, with verification at each boundary.

## Session Handoff
**Last session:** 2026-07-24 (OMP `/xinit --all` + `/xcreate P3` + `/xplan` + `/xship` closeout)
**Next session priority:** Start `m3-launch-inputs` (P4) once operator inputs are available, or clear `.state/.active` to idle. User has not yet decided the `.active` pointer (open question).
**Known issues:** Screen-reader smoke requires a reader install to re-open (P4 pre-release gate). M2/P3 is complete; `.opencode/` parent ledger is stale but read-only legacy — `.state/` is authoritative.
**Context links:** `roadmap.md`, `project.md`, `tech-stack.md`, `user.md`, `.state/m2-accessible-core-shell-closeout/progress.md`

---

_Update this file at the end of each significant session or when state changes._
