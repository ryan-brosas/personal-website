# PRD: M2 Accessible Core Shell — Aggregate Close

**Slug:** m2-accessible-core-shell-closeout
**Created:** 2026-07-24
**Status:** Draft

## Metadata

```yaml
depends_on:
  - m2-content-route-contracts       # complete (8cf77ab)
  - m2-semantic-shell                # complete (1d3e65a)
  - m2-core-pages                    # complete (333c074)
  - m2-brand-shell                   # complete (1f305f4)
  - m2-contact-page                  # complete (c6dfdf7)
  - m2-accessibility-acceptance      # complete (3ccbf1f / ad15146)
files:
  - .state/m2-accessible-core-shell-closeout/progress.md
  - .state/state.md
  - .state/project-status.md
  - .state/roadmap.md
verify:
  - npm run check && npm test && npm run build && npm run verify
  - test -f .state/m2-accessible-core-shell-closeout/progress.md
```

---

## Problem Statement

### What problem are we solving?

All six M2 (P3 — Accessible Core Shell) child plans are complete and their individual
ledgers show `complete`, but the M2 milestone has not been closed in the OMP-native
`.state/` tracking. The legacy `.opencode/` parent aggregate
(`m2-accessible-core-shell/prd.json`) still records `m2-contact-page` and
`m2-accessibility-acceptance` as `pending` and the parent as `in-progress`, but
`.opencode/` is read-only legacy — the authoritative closeout lives in `.state/`. The
accessibility acceptance record (`acceptance.md:271-273`) contains a self-referential hash
wording issue: it states the acceptance commit's own SHA must equal HEAD, which is
impossible by construction and was deferred to this aggregate close.

These stale records obscure the transition from the completed core shell to credible-core
(P4) work. The milestone is functionally done — all routes ship, all tests pass (122/122),
all gates are green — but the OMP-native tracking has not been reconciled to reflect M2/P3
as complete.

### Why now?

RM-004 (`.pi/ROADMAP.md`) names this exact outcome: "Reconcile the completed M2 child
records into one accurate aggregate close, without changing public-site behavior, while
retaining the real screen-reader smoke as an explicit pre-release gate." All six children
are complete (verified 2026-07-24). The cost of inaction is context loss: future sessions
see a stale "in-progress" M2 and cannot tell the closeout is a documentation-only decision
away from being complete, which blocks the mental transition to P4.

### Who is affected?

- **Primary users:** Ryan (operator) — needs accurate milestone state to decide what to
  build next (P4 launch inputs vs. M2 closeout).
- **Secondary users:** future AI sessions — consume `.state/state.md` and
  `project-status.md` for context; stale tracking produces wrong project-position reads.

---

## Scope

### In-Scope

- Verify all six M2 child `prd.json` ledgers (read-only) show `complete` (already
  confirmed: all six read `complete`).
- Run the full code gate (`npm run check && npm test && npm run build && npm run verify`)
  and record the results durably in `.state/<slug>/progress.md`.
- Record the ledger reconciliation note in `.state/<slug>/progress.md`: the legacy
  `.opencode/` parent `prd.json` is stale (2 children `pending`, parent `in-progress`)
  but is left untouched as read-only legacy; the children's own ledgers are authoritative
  and all show `complete`.
- Record the acceptance-hash lineage reconciliation in `.state/<slug>/progress.md`:
  `3ded07b` → `3ccbf1f` → `ad15146`, no `src/` production-code drift, satisfying the
  close-2 requirement in the audited-commit sense. The legacy `acceptance.md` file is left
  untouched.
- Update OMP `.state/` artifacts:
  - `.state/roadmap.md` — P3 status from `In Progress` to `Complete`, work item
    `m2-accessible-core-shell-closeout` from `open` to `complete`, success criterion
    checked.
  - `.state/state.md` — add recent-completed-work row, lifecycle to `shipped`.
  - `.state/project-status.md` — closeout row lifecycle to `shipped`.

### Out-of-Scope

- No production code changes under `src/` — this is a documentation-only closeout.
- No new tests, no test modifications (tests already pass at 122/122).
- No screen-reader installation or re-run — the screen-reader smoke remains BLOCKED and
  is carried forward as a pre-release gate for P4/M3, not resolved here.
- No P4 (credible core) work — that is a separate slug (`m3-launch-inputs`).
- No edits to `.opencode/` or `.pi/` artifacts — these are read-only legacy reference.
  The stale parent `prd.json` and the self-referential `acceptance.md` wording are noted
  in `.state/` progress.md but not edited.
- No `.state/.active` pointer change — the closeout slug stays active until the user
  decides the next step (open question, not silently resolved).

---

## Proposed Solution

### Overview

A documentation-only aggregate close that records the gate evidence, ledger
reconciliation, and acceptance-hash lineage in `.state/<slug>/progress.md`, then updates
the OMP-native `.state/` tracking artifacts to reflect M2/P3 as complete — all without
touching production code or legacy `.opencode/` files. The screen-reader smoke is carried
forward as an explicit pre-release gate for P4, not silently dropped or deferred without
trace.

### User Flow

N/A — this is a documentation-only milestone close, not a user-facing feature.

---

## Requirements

### Functional Requirements

#### Gate verification

**Scenarios:**

- **WHEN** `.state/<slug>/progress.md` is read **THEN** it records the gate results
  (check/test/build/verify), the child-ledger verification (all 6 `complete`), the
  acceptance-hash lineage reconciliation, and the close decision date.
- **WHEN** the gate is run during closeout **THEN** `npm run check` exits 0 with 0 errors,
  `npm test` exits 0 with 122 pass, `npm run build` exits 0, `npm run verify` exits 0.
- **WHEN** `git diff --name-only HEAD -- src/ tests/ scripts/` is run **THEN** the output
  is empty (no production code touched).

#### Ledger reconciliation (recorded, not edited)

**Scenarios:**

- **WHEN** `.state/<slug>/progress.md` is read **THEN** it documents that the legacy
  `.opencode/` parent `prd.json` is stale (2 children `pending`, parent `in-progress`)
  and superseded by the children's own ledgers (all 6 `complete`).
- **WHEN** a future session reads the legacy parent `prd.json` **THEN** it should consult
  `.state/` artifacts for the authoritative milestone state.

#### Acceptance hash lineage (recorded, not edited)

**Scenarios:**

- **WHEN** `.state/<slug>/progress.md` is read **THEN** it documents the audited-commit
  lineage: `3ded07b` → `3ccbf1f` → `ad15146`, no `src/` production-code drift, satisfying
  the close-2 requirement in the audited-commit sense.
- **WHEN** the acceptance findings are referenced **THEN** the screen-reader BLOCKED status
  and all other findings (50/50 captures, contrast, keyboard, reflow, etc.) are unchanged.

### Non-Functional Requirements

- **Performance:** N/A (documentation-only).
- **Security:** No credentials, private approvals, or analytics are introduced.
- **Accessibility:** The screen-reader smoke is carried forward as a pre-release gate; its
  BLOCKED status is preserved, not erased.
- **Compatibility:** No production code changes; the site's runtime behavior is unchanged.

---

## Success Criteria

- [x] All six M2 child `prd.json` ledgers read `complete` (verified 2026-07-24).
  - Verify: `for slug in m2-content-route-contracts m2-semantic-shell m2-core-pages m2-brand-shell m2-contact-page m2-accessibility-acceptance; do node -e "const d=require('./.opencode/artifacts/$slug/prd.json'); if(d.status!=='complete') process.exit(1)" || echo "FAIL: $slug"; done && echo "all complete"`
- [x] Full code gate passes with no production code changes.
  - Verify: `npm run check && npm test && npm run build && npm run verify` — all exit 0.
  - Verify: `git diff --name-only HEAD -- src/ tests/ scripts/ astro.config.mjs tsconfig.json package.json` produces no output.
- [x] `.state/<slug>/progress.md` records gate results + ledger reconciliation + hash
  lineage + close decision.
  - Verify: `test -f .state/m2-accessible-core-shell-closeout/progress.md && grep -q "gate" .state/m2-accessible-core-shell-closeout/progress.md && grep -q "hash" .state/m2-accessible-core-shell-closeout/progress.md`
- [ ] `.state/roadmap.md` P3 status is `Complete` and work item is `complete`.
  - Verify: `grep -E "P3.*Complete" .state/roadmap.md`
- [ ] `.state/state.md` has a recent-completed-work row for the closeout and lifecycle is
  `shipped`.
  - Verify: `grep -q "m2-accessible-core-shell-closeout" .state/state.md && grep -q "shipped" .state/state.md`
- [ ] `.state/project-status.md` closeout row lifecycle is `shipped`.
  - Verify: `grep -q "shipped" .state/project-status.md`

---

## Technical Context

### Existing Patterns

- Aggregate parent pattern: `m2-accessible-core-shell` is a non-executable aggregate;
  children execute via `/ship` and report to their own `prd.json` child ledger. The
  parent `prd.json` in `.opencode/` is legacy and stale; the children's own ledgers are
  authoritative. See `.opencode/artifacts/m2-accessible-core-shell/plan.md:8-10` (read-only
  reference).
- Verification gate pattern: every code plan ends with
  `npm run check && npm test && npm run build && npm run verify`. See
  `.opencode/artifacts/website-build/todo.md:82-86` (read-only reference).
- Acceptance evidence pattern: `acceptance.md` records the audited commit, environment,
  route/viewport matrix, results, and evidence paths with SHA-256 binding. See
  `.opencode/artifacts/m2-accessibility-acceptance/acceptance.md:1-12` (read-only
  reference).

### Key Files (read-only legacy reference)

- `.opencode/artifacts/m2-accessible-core-shell/prd.json` — stale parent ledger (2 children
  `pending`, parent `in-progress`); superseded by `.state/` tracking.
- `.opencode/artifacts/m2-accessibility-acceptance/acceptance.md:271-273` —
  self-referential hash wording; reconciled in `.state/` progress.md, not edited in place.
- `.opencode/artifacts/m2-*/prd.json` — six child ledgers, all `complete` (authoritative
  for child status).

### Affected Files

Files this work modifies (all under `.state/`):

```yaml
files:
  - .state/m2-accessible-core-shell-closeout/progress.md  # created: gate evidence + ledger reconciliation + hash lineage + close decision
  - .state/roadmap.md                                      # P3 status -> Complete, work item -> complete, success criterion checked
  - .state/state.md                                         # recent-completed-work row, lifecycle -> shipped
  - .state/project-status.md                                # closeout row lifecycle -> shipped
```

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Production code accidentally changed during closeout | Low | High | Verify `git diff --name-only HEAD -- src/ tests/ scripts/` is empty after all edits; no edits touch `src/`. |
| Screen-reader BLOCKED status erased or downgraded | Low | High | Preserve the exact BLOCKED wording in progress.md; the acceptance.md findings are not edited. |
| Future session trusts stale `.opencode/` parent ledger | Med | Low | progress.md documents the stale legacy ledger and points to `.state/` as authoritative. |
| `.state/.active` pointer left stale after closeout | Low | Low | Open question surfaced to user; pointer stays at closeout slug until user decides. |

---

## Open Questions

| Question | Owner | Due Date | Status |
|---|---|---|---|
| Should `.state/.active` be cleared or pointed to `m3-launch-inputs` after closeout? | Ryan | closeout | Open — surfaced to user, not silently resolved |

---

## Context Source

This spec was derived from:

- [x] Session conversation (2026-07-24 `/xinit --all` + `/xcreate P3`)
- [x] `P3: Accessible Core Shell` (command argument — title/focus)
- [x] Long-term memory recall (unavailable this session; session context was sufficient)

### Master Plan

Source: `.opencode/artifacts/website-build/plan.md` §Plan 03 — Brand Shell and Core Pages
(lines 309-334) — read-only reference
Slop check: PASS (6/6 applicable signals verified; 1 N/A — no migration steps in this
section)

The aggregate-close scope comes from RM-004 in `.pi/ROADMAP.md` and the parent plan's
Tasks close-1/close-2 in `.opencode/artifacts/m2-accessible-core-shell/plan.md:46-75`
(read-only reference).

---

## Tasks

### T1 — Verify child ledgers and run full gate [verification]

All six M2 child `prd.json` ledgers read `complete` and the full code gate exits 0 with no
production code changes.

**Metadata:**

```yaml
depends_on: []
files:
  - .state/m2-accessible-core-shell-closeout/progress.md
verify:
  - "for slug in m2-content-route-contracts m2-semantic-shell m2-core-pages m2-brand-shell m2-contact-page m2-accessibility-acceptance; do node -e \"const d=require('./.opencode/artifacts/$slug/prd.json'); if(d.status!=='complete') process.exit(1)\" || echo \"FAIL: $slug\"; done && echo \"all complete\""
  - "npm run check && npm test && npm run build && npm run verify"
  - "git diff --name-only HEAD -- src/ tests/ scripts/ astro.config.mjs tsconfig.json package.json"
```

**Verification:**

- Child-ledger check: all six print "complete" (read-only, no `.opencode/` edits).
- Full gate: check (0 errors), test (122 pass), build (5 pages), verify (ok) — all exit 0.
- Production-code diff: empty output (no `src/`/`tests/`/`scripts/` touched).

### T2 — Record ledger reconciliation and hash lineage [implementation]

`.state/<slug>/progress.md` is created with gate results, child-ledger verification,
legacy-ledger reconciliation note, and acceptance-hash lineage reconciliation.

**Metadata:**

```yaml
depends_on: ["T1"]
files:
  - .state/m2-accessible-core-shell-closeout/progress.md
verify:
  - "test -f .state/m2-accessible-core-shell-closeout/progress.md && grep -q 'gate' .state/m2-accessible-core-shell-closeout/progress.md && grep -q 'hash' .state/m2-accessible-core-shell-closeout/progress.md"
  - "grep -q 'BLOCKED' .state/m2-accessible-core-shell-closeout/progress.md"
```

**Verification:**

- `progress.md` exists and contains "gate" and "hash" keywords.
- `progress.md` preserves the screen-reader BLOCKED status.

### T3 — Update OMP tracking artifacts [implementation]

`.state/roadmap.md` P3 status is `Complete`, `.state/state.md` has a recent-completed-work
row and lifecycle `shipped`, `.state/project-status.md` closeout row lifecycle is
`shipped`.

**Metadata:**

```yaml
depends_on: ["T2"]
files:
  - .state/roadmap.md
  - .state/state.md
  - .state/project-status.md
verify:
  - "grep -E 'P3.*Complete' .state/roadmap.md"
  - "grep -q 'm2-accessible-core-shell-closeout' .state/state.md && grep -q 'shipped' .state/state.md"
  - "grep -q 'shipped' .state/project-status.md"
```

**Verification:**

- `roadmap.md` P3 row shows `Complete`.
- `state.md` has the closeout in recent-completed-work and lifecycle `shipped`.
- `project-status.md` closeout row lifecycle is `shipped`.

---

## Field Legend

| Field | Purpose | Example |
|---|---|---|
| `depends_on` | Node IDs that must be verified first | `["T1", "T2"]` |
| `files` | Files this node may modify | `["src/db/schema.ts"]` |
| `verify` | Observable commands that prove the node | `["npm test -- db"]` |

---

## Notes

- This is a **documentation-only** closeout. No production code under `src/`, `tests/`, or
  `scripts/` is touched.
- `.opencode/` and `.pi/` are **read-only legacy reference**. The stale parent
  `prd.json` and the self-referential `acceptance.md` wording are documented in
  `.state/<slug>/progress.md` but not edited.
- The screen-reader smoke (BLOCKED — no reader installed) is **carried forward as a
  pre-release gate for P4/M3**, not resolved or downgraded here.
- After closeout, the next work item is `m3-launch-inputs` (P4) — resolving the credible-core
  launch inputs (approved project artifact, origin/host/CI, CMS infrastructure).
