# State

On-demand reference, not injected. Read this before starting work to recover context.
Companion to `.opencode/roadmap.md` (milestones) and
`.opencode/artifacts/website-build/plan.md` (implementation tasks).

## Current Status

Planning complete and approved. Releases are incremental public releases, not one
coordinated launch. The credible core (M3) ships first; Blog, Directory, LLM Watcher,
and Resources promote independently.

No application code, dependencies, or Astro scaffold exists yet. The repository
baseline is committed (`e5956d5`: `.pi/` -> `.opencode/` migration recorded as
high-similarity renames, `.gitignore` expanded to exclude `.opencode/node_modules/`,
`node_modules/`, `dist/`, `.astro/`, `.playwright-mcp/`, and `.env*`, `docs/sitemap.md`
republished); `git status` is clean.

Completed init artifacts: `AGENTS.md`, `.opencode/tech-stack.md`,
`.opencode/roadmap.md`, `.opencode/user.md`, `.fallowrc.json`,
`.opencode/artifacts/website-build/{plan,todo,decisions}.md`,
`.opencode/artifacts/MEMORY.md`, `docs/sitemap.md`.

**Active milestone:** M0 — Execution-Ready Baseline.

## Active Decisions

- **Incremental public releases.** Credible core (M3) first; Blog/Directory/LLM
  Watcher/Resources promote independently. See `.opencode/roadmap.md`.
- **Self-hosted Pages CMS 2.1.8** on the operator VPS behind Caddy at
  `cms.ryanjosebrosas.dev`; isolated PostgreSQL 16 container for CMS state only;
  website content stays in Git. Required before the first public release (M3), not
  before local M0–M2 work. See `decisions.md` ADR-002 (supersedes ADR-001).
- **Fail-closed visibility** enum `draft | public | noindex` drives routes, sitemap,
  RSS, curation, related content, and AI outputs.
- **Custom metadata-aware `/sitemap.xml`** from the public-route inventory;
  `@astrojs/sitemap` not installed.
- **Static Astro, strict TypeScript, semantic HTML, plain CSS, no UI framework**, no
  MDX, no SSR, no runtime CMS on the public site.
- **Authenticated desktop/390px mobile tracer** gates broad Pages CMS rollout.
- **Operations skill deferred** until manual deploy/backup/restore is proven working.
- **Signal Path — Editorial Cut** is the approved homepage art direction: one finite
  System Conductor signal trace plus editorial type/mask/rule choreography on `/` only;
  internal routes remain functionally restrained. P02A owns prototype acceptance; P02B
  owns contract/local mirrors/capture and registered-package verification. Both are pending.

## Build Gate (what blocks starting local implementation)

Only the minimal baseline gates local work — not domain, scheduler, CMS
infrastructure, or final content:

- [x] **Repository baseline approved and committed** (`.pi` -> `.opencode` migration; commit `e5956d5`).
- [x] **Explicit scaffold authorization recorded** (2026-07-22; Plan 01 scope: Astro baseline + publishing contracts + sitemap/robots; broader modules get separate authorization).
- [x] **Route/origin strategy and visibility policy agreed** (2026-07-22; `docs/sitemap.md` authoritative for route dispositions `launch | conditional | defer | absent` and content visibility `draft | public | noindex`; Plan 01 uses a placeholder origin injected at release).
- [x] **Toolchain re-pinned** against current registry (2026-07-22; matrix confirmed: Astro 5.18.2 / TS 6.0.3 / `@astrojs/check` 0.9.9 / `@astrojs/rss` 4.0.19; Astro 7.1.3 / TS 7.0.2 declined — `@astrojs/check` 0.9.9 peers `typescript: ^5.0.0 || ^6.0.0`; actual `package.json` pin is Plan 01 Task 1).

Once these are clear, M1 (Astro policy-kernel tracer) may start.

## Downstream Gates (block only the milestones that consume them)

These do not block M0/M1. Task-level and milestone-exit effects are named explicitly:

- **M2 (core shell):** brand token/asset allowlist and Contact inputs (scheduler URL +
  email fallback + privacy-route decision). Plan 03 semantic-shell work may start after
  M1; its Task 1 visual integration and M2 completion additionally require P02B.
- **M3 (first public release):** one approved/redacted real-work project artifact; the
  self-hosted Pages CMS core workflow (VPS deployment, isolated PostgreSQL, Caddy,
  GitHub App, backup) verified; release operations (domain, host, CI provider).
- **M4 (blog):** approved editorial content.
- **M5 (directory):** approved directory inventory.
- **M6 (LLM Watcher):** approved source data.
- **M7 (Resources):** at least one resource module is public.
- **M8 (experiments):** a production baseline (M3 shipped) plus a named hypothesis.

## Next Priorities

1. M0 build gate closed (all four items checked 2026-07-22). Start M1 (Astro baseline +
   publishing contracts + sitemap/robots) via Plan 01.
2. Run P02A (Signal Path prototype + no-JavaScript mobile-nav repair + visual acceptance)
   and stop for the durable visual decision. Run P02B only after acceptance to
   synchronize/verify local and registered package surfaces. Use the standalone plans'
   scoped build-agent handoffs; do not switch `.active` or use `/ship` for these
   pre-scaffold static-package slices.
3. In parallel, work the Content Desk and release tracks toward M3 readiness.

## Blockers (not started)

- `[GATE]` Authenticated Pages CMS editor must pass desktop + 390px mobile tracer
  before broad CMS rollout and before M3 public release.
- `[GATE]` CMS infrastructure approvals (VPS host, isolated PG 16, Caddy config, S3
  backup, GitHub App scope/revocation) gate the Content Desk track, not local work.
- `[GATE]` Final domain + host/CI provider gate the release track (M3), not local work.
- `[GATE]` P02A must pass responsive, no-JavaScript, reduced-motion, accessibility,
  performance, and explicit visual acceptance with a durable accepted hash.
- `[GATE]` P02B must pass local mirror/capture checks and verify the existing published
  `user:brand-design-system` record before Plan 03 Task 1 visual integration and Plan 04
  homepage choreography; neither gate blocks Plan 01 or Plan 03 semantic-shell work.
