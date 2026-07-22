# Plan: M2 Accessible Core Shell — Aggregate Close

**Slug:** m2-accessible-core-shell
**Type:** Aggregate (non-executable; child plans execute via `/ship`)
**Created:** 2026-07-22
**Status:** In Progress
**Depends on:** M1 complete (`9fd70ce`)
**Blocks:** M3 (credible core release)

## Goal

Aggregate-close the M2 milestone after all child plans complete. This plan is
non-executable — `/ship` refuses it. Child plans execute independently and report
completion to this artifact's `prd.json` child ledger.

## Child Execution Order

1. **`m2-content-route-contracts`** (3 TDD tasks): schemas/settings, route-visibility
   pipeline, phase-aware verifier. Active now.
2. **`m2-semantic-shell`** (3 TDD tasks): atomic root shell, header/footer, 404.
   Starts after Child 1.
3. **`m2-core-pages`** (gated by copy approval + markdown safety): About + Services
   dynamic-route pages.
4. **`m2-contact-page`** (gated by scheduler URL + email + privacy + copy approval):
   Contact record/page with security validation.
5. **`m2-brand-shell`** (gated by P02B verified distribution + asset allowlist +
   favicon derivation): tokens, global CSS, selected assets, favicon.
6. **`m2-accessibility-acceptance`** (gated by all UI children + browser environment):
   browser matrix, screen-reader smoke, durable acceptance record.

Activate one child at a time: `printf '%s\n' '<child-slug>' > .opencode/artifacts/.active`
then `/ship <child-slug>`. Do not `/ship` this aggregate.

## Tasks

### Task close-1 — Verify all child ledgers and run full gates

**Files:** `.opencode/artifacts/m2-accessible-core-shell/progress.md`

**Prerequisite:** Every child `prd.json` status is `complete`. No child is blocked.

**Steps:**
1. Verify each child's `prd.json` `status` field reads `"complete"`.
2. Run the full gate: `npm run check && npm test && npm run build && npm run verify`.
   All must exit 0.
3. Confirm no child has a `"blocked"` or `"pending"` status in the ledger.
4. Record the verification results in `progress.md`.

**Verify:** `npm run check && npm test && npm run build && npm run verify` — all exit 0;
all child ledgers show `complete`.

### Task close-2 — Verify accessibility evidence and request aggregate close

**Files:** `.opencode/artifacts/m2-accessible-core-shell/progress.md`,
`.opencode/artifacts/m2-accessible-core-shell/prd.json`

**Prerequisite:** Task close-1 complete.

**Steps:**
1. Verify `acceptance.md` exists in the accessibility child artifact with environment,
   route/viewport matrix, results, and exact tested commit hash.
2. Assert the acceptance record's commit hash matches current `HEAD`.
3. Ask the user via the question tool: "All child plans complete, gates green,
   accessibility evidence verified. Mark M2 complete?"
4. On confirmation, update `prd.json` status to `"complete"`, record close in
   `progress.md`, commit, and push.

**Verify:** `acceptance.md` commit hash matches `HEAD`; user confirms close.

## Hard Stops

- Do not `/ship` this aggregate. Activate a child and `/ship` the child.
- No partial close: a blocked child keeps M2 in progress.
- Accessibility evidence must match the exact final commit, not a stale hash.
- No child may be skipped or marked complete without its own `/ship` verification.

## Risks

| Risk | Mitigation |
|---|---|
| P02B never completes | M2 stays in progress; brand + accessibility children stay pending |
| Contact inputs stay open | Contact child stays pending; M2 stays in progress |
| Browser unavailable | Accessibility child records blocked; M2 stays in progress |
| Stale accessibility evidence | Task close-2 compares acceptance hash to HEAD |
