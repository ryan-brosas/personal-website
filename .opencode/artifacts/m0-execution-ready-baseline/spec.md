# M0 Execution-Ready Baseline

**Bead:** m0-execution-ready-baseline  
**Created:** 2026-07-22  
**Status:** In Progress (t1 complete; t2-t4 + design-track kickoff remain)

## Bead Metadata

```yaml
depends_on: [] # First milestone; no predecessor
parallel: false # Sequential gate tasks
conflicts_with: [] # No other bead active
blocks: ["m1-proven-static-foundation"] # M1 cannot start until this gate closes
# t1 (repository baseline) alone also unblocks P02A (homepage prototype) in parallel
estimated_hours: 2
```

---

## Problem Statement

### What problem are we solving?

The repository is greenfield: no `package.json`, no source code, no dependencies. All
work so far is planning artifacts. Local implementation (M1 — the Astro policy-kernel
tracer) cannot start until four build-gate items are closed: the `.pi -> .opencode`
migration baseline is committed, scaffold is explicitly authorized, the route/origin and
visibility policy is confirmed, and the toolchain is re-pinned against the current
registry. Until then, any scaffolding risks building on an uncommitted, unauthorized, or
version-incompatible foundation.

### Why now?

The roadmap redesign settled an incremental release model and a minimal build gate. The
user switched to build mode and requested the first `/create`. M0 is the gate that
unblocks every later milestone. Committing the migration baseline now prevents the
~600-file uncommitted `.pi` deletion set from tangling with future scaffold commits.

A homepage art-direction track (Signal Path — Editorial Cut, Plans 02A/02B) was
approved during planning. Its prototype slice (P02A) needs only the repository baseline
(t1), so completing t1 also unblocks design work in parallel with M1; P02A does not
require t2/t3/t4.

### Who is affected?

- **Primary:** Ryan (operator/solo builder) — needs a clean, authorized baseline before scaffolding.
- **Secondary:** Future agents — need consistent planning docs and a recorded toolchain decision to avoid re-litigating versions or recreating `.pi/`.

---

## Scope

### In-Scope

- Committing the `.pi -> .opencode` migration baseline with durable gitignore hygiene.
- Recording explicit scaffold authorization for Plan 01 (Astro baseline + publishing contracts).
- Confirming and recording the toolchain matrix: Astro 5.18.2, TypeScript 6.0.3, `@astrojs/check` 0.9.9, `@astrojs/rss` 4.0.19, Node 24.16.0, npm 11.13.0.
- Confirming the route-disposition + content-visibility vocabulary and the origin strategy M1 will use (placeholder origin until the production domain is selected in the release track).
- Recording that the design track (Plans 02A/02B — Signal Path — Editorial Cut) is unblocked by t1 (repository baseline) and runs in parallel with the remaining build-gate items; P02A does not require t2/t3/t4.
- Updating planning docs to reflect the closed gate.

### Out-of-Scope

- Writing `package.json`, `astro.config.mjs`, source code, or any application scaffold (Plan 01 / M1 work).
- Selecting the final production domain, host, CI provider, or scheduler (release track, gates M3).
- Approving CMS infrastructure (VPS, PostgreSQL, Caddy, backups, GitHub App) (Content Desk track, gates M3).
- Approving content evidence, project artifacts, or editorial content (downstream milestones).
- Installing any npm packages.

---

## Proposed Solution

### Overview

Close the four build-gate items through documentation, git operations, and version
verification — no application code. Produce a committed migration baseline, a durable
scaffold-authorization record, a confirmed toolchain matrix with registry evidence, and a
confirmed route/origin strategy. On completion, M1 may start immediately.

### User Flow

Not user-facing. This is an operator/agent gate.

---

## Requirements

### Functional Requirements

#### Migration baseline committed

**Scenarios:**

- **WHEN** the migration is committed **THEN** `.pi/` deletions and `.opencode/` additions land in one atomic commit and `git status` shows no stray `.pi/` or `.opencode/` planning files.
- **WHEN** generated/sensitive artifacts exist in the worktree **THEN** they are gitignored, not committed (`.playwright-mcp/`, `.env`, `node_modules/`, `dist/`, `.opencode/node_modules/`, session summaries).

#### Scaffold authorization recorded

**Scenarios:**

- **WHEN** a future agent reads the planning docs **THEN** scaffold authorization for Plan 01 is unambiguous and dated.

#### Toolchain matrix confirmed

**Scenarios:**

- **WHEN** Plan 01 scaffolds **THEN** it uses Astro 5.18.2 + TypeScript 6.0.3 + `@astrojs/check` 0.9.9 (all latest in their major lines, `@astrojs/check` peers on `typescript: ^5||^6`).
- **WHEN** the blog slice runs (M4) **THEN** `@astrojs/rss` 4.0.19 is the version pinned.

#### Route/origin strategy confirmed

**Scenarios:**

- **WHEN** Plan 01 configures `astro.config.mjs` **THEN** `site` uses a placeholder origin and the docs record that the production origin is injected at release time; the final domain is NOT a build-gate item.
- **WHEN** a route-disposition question arises **THEN** `docs/sitemap.md` is authoritative (route dispositions: `launch | conditional | defer | absent`; content visibility: `draft | public | noindex`).

### Non-Functional Requirements

- **Security:** No credentials, `.env`, or private approval records committed. `.opencode/.env` (referenced by `.env.example`) must be gitignored.
- **Compatibility:** Toolchain matrix must be internally compatible — `@astrojs/check` 0.9.9 must support the pinned TypeScript (verified: peers `^5||^6`).
- **Reversibility:** The migration commit is atomic; no destructive git operations without operator request.

---

## Success Criteria

- [x] Migration baseline committed atomically; `git status` shows no untracked `.pi/` or uncommitted planning files. (DONE: commit `e5956d5`, 2026-07-22.)
  - Verify: `git log --oneline -1` shows the migration commit; `git status --short` shows no `.pi/` or `.opencode/` planning-file changes.
- [ ] Scaffold authorization for Plan 01 recorded in planning docs with a date.
  - Verify: `rg -n "scaffold.*authoriz|M0.*complete|build gate.*closed" .opencode/artifacts/website-build/ .opencode/state.md`
- [ ] Toolchain matrix confirmed with registry evidence; planning docs updated to record the Astro 5 / TS 6 decision and the declined Astro 7 / TS 7 alternative.
  - Verify: `rg -n "astro.*5.18.2|typescript.*6.0.3|declined|Astro 7" .opencode/tech-stack.md .opencode/artifacts/website-build/plan.md`
- [ ] Route/origin strategy and vocabulary confirmed; `docs/sitemap.md` recorded as authoritative for route dispositions.
  - Verify: `rg -n "placeholder origin|authoritative|route disposition" docs/sitemap.md .opencode/artifacts/website-build/plan.md`
- [x] `.gitignore` covers generated/sensitive paths. (DONE: `.opencode/node_modules/`, `node_modules/`, `dist/`, `.astro/`, `.playwright-mcp/`, `.env*` added 2026-07-22.)
  - Verify: `rg -n "playwright-mcp|\.env|node_modules|dist" .gitignore`

---

## Technical Context

### Existing Patterns

- Build gate definition: `.opencode/state.md:41-53` (four gate items, downstream gates separated).
- M0 exit criteria: `.opencode/roadmap.md:52-67`.
- Route-disposition contract: `docs/sitemap.md` (launch | conditional | defer | absent for routes; draft | public | noindex for content).
- Toolchain pins: `.opencode/tech-stack.md:21-26`, `.opencode/artifacts/website-build/plan.md:200`.
- Migration decision: `.opencode/artifacts/MEMORY.md:51-56`, `.opencode/artifacts/website-build/decisions.md` (ADR for migration approved).
- Plan 01 file list (M0 must enable, not create): `.opencode/artifacts/website-build/plan.md:198-218`.

### Key Files

- `.gitignore` — currently only ignores `.fallow/`; must add generated/sensitive paths before the scaffold.
- `.opencode/tech-stack.md` — toolchain pins; records the version decision.
- `.opencode/state.md` — build-gate checklist; records gate closure.
- `.opencode/artifacts/website-build/plan.md` — Plan 00/01 boundary; records the origin strategy and toolchain note.
- `.opencode/artifacts/website-build/todo.md` — build-gate blockers; check off closed items.
- `docs/sitemap.md` — authoritative route contract.
- `.opencode/artifacts/MEMORY.md` — durable record of the toolchain decision and gate closure.

### Affected Files

Files this bead will modify (for conflict detection):

```yaml
files:
  - .gitignore # Add generated/sensitive path ignores
  - .opencode/tech-stack.md # Record confirmed toolchain matrix + declined Astro 7/TS 7
  - .opencode/state.md # Mark build gate closed; set active milestone to M1-ready
  - .opencode/artifacts/website-build/plan.md # Record origin strategy; close Plan 00 build-gate tasks
  - .opencode/artifacts/website-build/todo.md # Check off build-gate items
  - docs/sitemap.md # Confirm authoritative vocabulary (minimal, if needed)
  - .opencode/artifacts/MEMORY.md # Record toolchain decision + gate closure
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Migration commit sweeps in `.opencode/node_modules/` or `.playwright-mcp/` | Med | High | Add gitignore entries before staging; scope commits explicitly, never `git add .` |
| `.opencode/.env` with credentials gets committed | Low | High | Verify `.env` is gitignored; never stage `.env` files |
| Future agent recreates `.pi/` (development-lifecycle skill still references it) | Med | Med | Note the `.pi` removal; flag the skill drift as a NOTICED BUT NOT TOUCHING item (skill edits are out of M0 scope) |
| Plan 01 scaffolds with a final origin and the verify script rejects it | Med | Med | Record placeholder-origin strategy now so Plan 01 uses it |
| Toolchain pins drift from docs after the decision | Low | Low | Record the exact matrix in tech-stack.md and MEMORY with the declined alternative |

---

## Open Questions

| Question | Owner | Due Date | Status |
| --- | --- | --- | --- |
| Should `.opencode/package.json` (nested, gitignored) be force-tracked? | Operator | M0 | Resolved — leave gitignored; root `package.json` is Plan 01 work |
| Does scaffold authorization cover only Plan 01 or broader app work? | Operator | M0 | Resolved — Plan 01 (Astro baseline + publishing contracts + sitemap/robots); broader modules get their own authorization |

---

## Tasks

### Commit migration baseline with gitignore hygiene [baseline]

**Status: COMPLETE (commit `e5956d5`, 2026-07-22).** The `.pi -> .opencode` migration lands in one atomic commit and generated/sensitive paths are gitignored before staging.

**Metadata:**

```yaml
depends_on: []
parallel: false
conflicts_with: []
files:
  - .gitignore
```

**Verification:**

- `git status --short` shows no untracked `.pi/` or uncommitted `.opencode/` planning files after the commit
- `rg -n "playwright-mcp|\.env$|node_modules|dist" .gitignore` confirms ignores are present
- `git log --oneline -1` shows the migration commit message

### Record scaffold authorization [config]

Plan 01 scaffold authorization is recorded durably in planning docs with a date.

**Metadata:**

```yaml
depends_on: ["Commit migration baseline with gitignore hygiene"]
parallel: false
conflicts_with: []
files:
  - .opencode/state.md
  - .opencode/artifacts/website-build/todo.md
```

**Verification:**

- `rg -n "scaffold.*authoriz|Plan 01.*authorized" .opencode/state.md .opencode/artifacts/website-build/todo.md`
- The record names Plan 01 scope (Astro baseline + publishing contracts + sitemap/robots) and a date

### Confirm and record toolchain matrix [config]

The Astro 5.18.2 / TS 6.0.3 / check 0.9.9 / rss 4.0.19 matrix is confirmed as latest-in-major and recorded, with the declined Astro 7 / TS 7 alternative and the `@astrojs/check` peer-compat evidence.

**Metadata:**

```yaml
depends_on: ["Commit migration baseline with gitignore hygiene"]
parallel: true
conflicts_with: ["Confirm route and origin strategy"]
files:
  - .opencode/tech-stack.md
  - .opencode/artifacts/website-build/plan.md
  - .opencode/artifacts/MEMORY.md
```

**Verification:**

- `rg -n "5.18.2|6.0.3|0.9.9|4.0.19" .opencode/tech-stack.md` confirms pins unchanged and current
- `rg -n "Astro 7|TS 7|declined|peer.*5.*6" .opencode/tech-stack.md .opencode/artifacts/website-build/plan.md` confirms the declined alternative and compat evidence are recorded
- `npm view astro@5 version` tail shows 5.18.2 as latest 5.x (already verified this session)

### Confirm route and origin strategy [config]

The route-disposition and content-visibility vocabulary is confirmed with `docs/sitemap.md` as authoritative, and the placeholder-origin strategy for Plan 01 is recorded so M1 need not wait on the final domain.

**Metadata:**

```yaml
depends_on: ["Commit migration baseline with gitignore hygiene"]
parallel: true
conflicts_with: ["Confirm and record toolchain matrix"]
files:
  - docs/sitemap.md
  - .opencode/artifacts/website-build/plan.md
  - .opencode/state.md
```

**Verification:**

- `rg -n "authoritative|placeholder origin|route disposition" docs/sitemap.md .opencode/artifacts/website-build/plan.md`
- `docs/sitemap.md` route vocabulary (launch | conditional | defer | absent) and content vocabulary (draft | public | noindex) are distinct and confirmed
- Plan 01's `site` config strategy references a placeholder origin injected at release

---

## Dependency Legend

| Field | Purpose | Example |
| --- | --- | --- |
| `depends_on` | Must complete before this task starts | `["Commit migration baseline with gitignore hygiene"]` |
| `parallel` | Can run concurrently with other parallel tasks | `true` / `false` |
| `conflicts_with` | Cannot run in parallel (same files) | `["Confirm route and origin strategy"]` |
| `files` | Files this task modifies (for conflict detection) | `[".gitignore"]` |

---

## Notes

- **Toolchain decision (user-approved 2026-07-22):** Stay on Astro 5.18.2 + TypeScript 6.0.3 + `@astrojs/check` 0.9.9. Registry evidence: `@astrojs/check@0.9.9` peerDependencies `typescript: '^5.0.0 || ^6.0.0'` — does NOT support TS 7. Latest 5.x = 5.18.2; latest 6.x = 6.0.3; latest `@astrojs/check` = 0.9.9; latest `@astrojs/rss` = 4.0.19. Astro 7.1.3 / TS 7.0.2 declined because `astro check` would break.
- **Origin strategy:** M1 sets `site` to a placeholder origin in `astro.config.mjs`; the production origin is injected at release time. The final domain is a release-track decision (M3), not a build-gate item.
- **Migration commit hygiene:** `.pi` deletions + `.opencode` additions in one atomic commit. Gitignore `.playwright-mcp/`, `.env`, `node_modules/`, `dist/` before staging. The nested `.opencode/package.json` and `.opencode/node_modules/` stay gitignored (root `package.json` is Plan 01 work).
- **NOTICED BUT NOT TOUCHING:** `.opencode/skill/development-lifecycle/SKILL.md` still references `.pi/artifacts/` as canonical. Skill edits are out of M0 scope; flagged for a later cleanup.
- **Design track (Plans 02A/02B — Signal Path — Editorial Cut):** Approved 2026-07-22 as the homepage art direction. P02A (canonical prototype + no-JS mobile-nav repair + visual acceptance) needs only the repository baseline (t1, now committed), so it runs in parallel with the remaining build-gate items (t2/t3/t4) and with M1. P02B (motion contract + local mirrors/capture + registered `user:brand-design-system` distribution) starts only after P02A acceptance and gates Plan 03 Task 1 visual integration + Plan 04 homepage choreography, not Plan 01 or Plan 03 semantic-shell work. See `.opencode/artifacts/homepage-art-direction/` and `.opencode/artifacts/homepage-art-direction-canonicalization/`.
- **No implementation code.** This bead closes a gate; Plan 01 (M1) writes the scaffold.
