---
purpose: Durable repo-local project memory — architectural decisions and trade-offs
updated: 2026-07-24
---

# Project Memory

## Decisions

### 2026-07-24 Project initialized — Astro 5.18.2 / TypeScript 6.0.3 static site

Core setup completed via OMP `/xinit --all`: `.state/tech-stack.md`, `.state/project.md`,
`.state/roadmap.md`, `.state/state.md`, `.state/user.md`, `.state/project-status.md`, and
`.state/project-memory.md` created for the personal-website Astro static site. Stack
detected and validated (check/test/build/verify/dev all green, 122 tests pass). Roadmap
seeded from legacy `.pi/ROADMAP.md` and `.opencode/roadmap.md` (milestone track M0–M8
mapped to phase IDs P1–P9); state and user profile seeded from `.opencode/state.md` and
`.pi/user.md`. No product code, tests, templates, `.pi/`, or `.opencode/` files were
modified.

### 2026-07-22 Toolchain pinned: Astro 5.18.2 / TS 6.0.3 / @astrojs/check 0.9.9

Astro 7.1.3 / TypeScript 7.0.2 declined because `@astrojs/check` 0.9.9 peerDependencies
declare `typescript: ^5.0.0 || ^6.0.0` and do not support TypeScript 7. Revalidate these
pins at scaffold time; if `@astrojs/check` releases TS 7 support, revisit the upgrade as
a separate decision. (Source: `.opencode/tech-stack.md`)

### 2026-07-22 Self-hosted Pages CMS 2.1.8 (ADR-002, supersedes ADR-001)

Pages CMS 2.1.8 on the operator VPS behind Caddy at `cms.ryanjosebrosas.dev`; isolated
PostgreSQL 16 container for CMS state only; website content stays in Git. Required before
the first public release (M3/P4), not before local M0–M2 (P1–P3) work. The public Astro
site has no dependency on Pages CMS availability; an outage leaves the existing static
site and direct Git editing intact. (Source: `.opencode/artifacts/website-build/decisions.md`
ADR-002)

### 2026-07-22 Signal Path — Editorial Cut approved as homepage art direction

One finite System Conductor signal trace plus editorial type/mask/rule choreography on
`/` only; internal routes remain functionally restrained. P02A owns prototype acceptance
(accepted `214f66e8ef16...`); P02B owns contract/local mirrors/capture and
registered-package verification (locally complete; remote sync deferred by operator —
local repo is the brand source of truth). (Source: `.opencode/state.md`)
