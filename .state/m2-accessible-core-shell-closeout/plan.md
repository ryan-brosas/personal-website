# M2 Accessible Core Shell — Aggregate Close Implementation Plan

**Goal:** Reconcile the completed M2 (P3) child records into one accurate aggregate close
without changing public-site behavior, while retaining the real screen-reader smoke as an
explicit pre-release gate.
**Roadmap phase:** P3 — Accessible Core Shell
**Discovery Level:** 0 — Pure internal work (markdown documentation, gate verification).
No new libraries, external APIs, or architectural decisions.
**Research state:** not-needed
**Context Budget:** ~15% (3 small documentation tasks, no code execution beyond gate runs)

---

## Must-Haves

### Observable Truths

1. All six M2 child `prd.json` ledgers read `complete` (read-only check, no `.opencode/`
   edits).
2. The full code gate passes: `npm run check && npm test && npm run build && npm run verify`
   all exit 0.
3. No production code was touched: `src/`, `tests/`, `scripts/` unchanged from HEAD.
4. `.state/<slug>/progress.md` records the gate evidence, ledger reconciliation note
   (legacy `.opencode/` parent is stale but not edited), and acceptance-hash lineage
   reconciliation.
5. The screen-reader BLOCKED status is preserved in `progress.md` — not erased or
   downgraded.
6. `.state/roadmap.md` P3 status is `Complete`.
7. `.state/state.md` and `.state/project-status.md` have the closeout row recorded.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Closeout progress.md | Gate results, ledger reconciliation, hash lineage, close decision | `.state/m2-accessible-core-shell-closeout/progress.md` |
| Updated roadmap.md | P3 status `Complete`, work item `complete` | `.state/roadmap.md` |
| Updated state.md | Recent-completed-work row for closeout | `.state/state.md` |
| Updated project-status.md | Closeout row present | `.state/project-status.md` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| progress.md | Legacy `.opencode/` parent ledger | Reconciliation note | Future session trusts stale legacy ledger instead of `.state/` |
| progress.md | `acceptance.md` hash lineage | Audited-commit lineage record | Hash lineage stays undocumented — acceptance record untrustworthy |
| roadmap.md P3 | state.md / project-status.md | Cross-reference | Inconsistent tracking surfaces — `/xstatus` returns wrong state |

---

## Task Graph

### T1 — Verify child ledgers and run full gate [verification]

All six M2 child `prd.json` ledgers read `complete` and the full code gate exits 0 with no
production code changes.

```yaml
id: T1
kind: verification
status: verified
depends_on: []
creates:
  - gate verification evidence (check/test/build/verify results)
  - child-ledger verification evidence
  - .state/m2-accessible-core-shell-closeout/progress.md
files:
  - .state/m2-accessible-core-shell-closeout/progress.md
verify:
  - "for slug in m2-content-route-contracts m2-semantic-shell m2-core-pages m2-brand-shell m2-contact-page m2-accessibility-acceptance; do node -e \"const d=require('./.opencode/artifacts/$slug/prd.json'); if(d.status!=='complete') process.exit(1)\" || echo \"FAIL: $slug\"; done && echo \"all complete\""
  - "npm run check && npm test && npm run build && npm run verify"
  - "git diff --name-only HEAD -- src/ tests/ scripts/ astro.config.mjs tsconfig.json package.json"
evidence:
  - "All 6 child ledgers verified complete (2026-07-24)"
  - "npm run check: 0 errors, 0 warnings, 4 hints"
  - "npm test: 122 pass, 0 fail"
  - "npm run build: 5 pages + sitemap.xml + robots.txt"
  - "npm run verify: verify: ok"
  - "git diff: empty (no production code touched)"
  - "progress.md created at .state/m2-accessible-core-shell-closeout/progress.md"
blocked_by: []
attempts: 0
```

**Steps:**

1. Run the child-ledger status check: for each of the six M2 child slugs, read
   `.opencode/artifacts/<slug>/prd.json` (read-only) and confirm `status` is `complete`.
2. Run the full gate: `npm run check`, `npm test`, `npm run build`, `npm run verify`.
3. Verify no production code changed: `git diff --name-only HEAD -- src/ tests/ scripts/
   astro.config.mjs tsconfig.json package.json` must produce empty output.
4. Create `.state/m2-accessible-core-shell-closeout/progress.md` with: date, gate results
   per command, child-ledger status summary, ledger reconciliation note (legacy parent
   stale, not edited), acceptance-hash lineage reconciliation, and screen-reader BLOCKED
   carried-forward note.

### T2 — Record ledger reconciliation and hash lineage [implementation]

`.state/<slug>/progress.md` documents the stale legacy parent ledger, the audited-commit
hash lineage, and preserves the screen-reader BLOCKED status.

```yaml
id: T2
kind: implementation
status: verified
depends_on:
  - T1
creates:
  - ledger reconciliation note in progress.md
  - acceptance-hash lineage reconciliation in progress.md
files:
  - .state/m2-accessible-core-shell-closeout/progress.md
verify:
  - "test -f .state/m2-accessible-core-shell-closeout/progress.md && grep -q 'gate' .state/m2-accessible-core-shell-closeout/progress.md && grep -q 'hash' .state/m2-accessible-core-shell-closeout/progress.md"
  - "grep -q 'BLOCKED' .state/m2-accessible-core-shell-closeout/progress.md"
evidence:
  - "progress.md contains gate evidence, hash lineage, and BLOCKED status (2026-07-24)"
blocked_by: []
attempts: 0
```

**Steps:**

1. Write the ledger reconciliation section: the legacy `.opencode/` parent `prd.json` is
   stale (2 children `pending`, parent `in-progress`) but left untouched as read-only
   legacy; the children's own ledgers are authoritative (all 6 `complete`).
2. Write the acceptance-hash lineage section: `3ded07b` → `3ccbf1f` → `ad15146`, no `src/`
   production-code drift, satisfying close-2 in the audited-commit sense.
3. Write the screen-reader BLOCKED carried-forward note.
4. Verify: `progress.md` contains "gate", "hash", and "BLOCKED".

### T3 — Update OMP tracking artifacts [implementation]

`.state/roadmap.md` P3 status is `Complete`, `.state/state.md` has a recent-completed-work
row for the closeout, `.state/project-status.md` has the closeout row present.

```yaml
id: T3
kind: implementation
status: verified
depends_on:
  - T2
creates:
  - updated .state/roadmap.md P3 status Complete
  - updated .state/state.md recent-completed-work row
  - updated .state/project-status.md closeout row
files:
  - .state/roadmap.md
  - .state/state.md
  - .state/project-status.md
verify:
  - "grep -E 'P3.*Complete' .state/roadmap.md"
  - "grep -q 'm2-accessible-core-shell-closeout' .state/state.md"
  - "grep -q 'm2-accessible-core-shell-closeout' .state/project-status.md"
evidence:
  - "roadmap.md P3 row shows Complete (2026-07-24)"
  - "state.md has closeout in recent-completed-work (2026-07-24)"
  - "project-status.md has closeout row (2026-07-24)"
blocked_by: []
attempts: 0
```

**Steps:**

1. **`roadmap.md` P3 status:** In the Overview table, change P3 row status from
   `In Progress` to `Complete` and clear the Active slugs column. In the P3 detail
   section, check the M2 aggregate close success criterion `[ ]` → `[x]` and change
   `m2-accessible-core-shell-closeout` work item from `open` to `complete`.
2. **`state.md` recent-completed-work:** Add a row:
   `m2-accessible-core-shell-closeout | P3 | 2026-07-24 | M2 aggregate close: ledger
   reconciliation and hash lineage recorded in .state/, tracking artifacts updated`.
   Keep `.active` pointing at the closeout slug (open question surfaced to user, not
   silently resolved).
3. **`project-status.md` closeout row:** Ensure the `m2-accessible-core-shell-closeout`
   row is present with current lifecycle.

---

## Wave Plan

### Wave 1
- T1 (verification — gate run + child-ledger check; creates progress.md)

### Wave 2
- T2 (ledger reconciliation + hash lineage in progress.md — depends on T1)

### Wave 3
- T3 (tracking artifacts — depends on T2)

---

## Execution Summary

| Metric | Value |
|---|---|
| Verified | 3 / 3 |
| Current wave | — |
| Frontier | — |
| Blocked | — |
| Last revision | R1 |

## Graph Revisions

| Revision | Trigger | Changed Nodes | Invalidated Nodes | Preserved Nodes | Rationale |
|---|---|---|---|---|---|
| R1 | `.opencode/` rescoping — user directed `.opencode/` is read-only legacy; closeout operates on `.state/` only | T2 (was: edit `.opencode/` prd.json), T3 (was: edit `.opencode/` acceptance.md), T4 (was: edit `.opencode/` todo.md + `.state/) | T2, T3, T4 | T1 | Original T2-T4 edited `.opencode/` files; rescoped to record reconciliation in `.state/` progress.md and update `.state/` tracking only. T2 and T3 merged into single progress.md task; T4 renamed T3 (tracking artifacts, `.state/` only). |
