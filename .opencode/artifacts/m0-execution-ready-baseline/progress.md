# M0 Execution-Ready Baseline — Progress

## Execution Summary

- **Tasks completed/total:** 3/3 (t2, t3, t4). t1 (repository baseline) was complete before this plan.
- **Waves executed:** Wave 1 (t3, then t2 checkpoint) → Wave 2 (t4 + build-gate closure).
- **Checkpoints:** t2 `checkpoint:decision` — operator authorized Plan 01 scaffold scope (Astro baseline + publishing contracts + sitemap/robots; broader modules get separate authorization).
- **Commits made:** `71a5377` (plan), `500378b` (t3 toolchain), `b37dd31` (t2+t4 gate closure), `24f4a81` (review-fix round 1), `b0b2794` (review-fix round 2). Plus prior `e5956d5` (t1 baseline), `89f7ab7` (opencode small_model side request).

## PRD Task Results

| Task | Status | Files modified | Commit |
| --- | --- | --- | --- |
| t1 Repository baseline | [x] pass | `.pi/`->`.opencode/` migration, `.gitignore` | `e5956d5` (prior) |
| t2 Record scaffold authorization | [x] pass | `.opencode/state.md`, `.opencode/artifacts/website-build/todo.md` | `b37dd31` |
| t3 Record toolchain matrix + decline rationale | [x] pass | `.opencode/tech-stack.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/artifacts/MEMORY.md` | `500378b` |
| t4 Record placeholder-origin strategy | [x] pass | `docs/sitemap.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/state.md` | `b37dd31` |

## Verification Gate Results

Build/test/lint/typecheck gates are N/A — M0 is pure planning documentation; no scaffold, package.json, or npm scripts exist yet (by design). Verification was goal-backward + cross-file consistency:

- sc-1 baseline committed: `e5956d5` is an ancestor of HEAD.
- sc-2 scaffold auth recorded: `state.md:53`, `todo.md:25`.
- sc-3 toolchain matrix + decline: `tech-stack.md:23,30-37`, `plan.md:217`.
- sc-4 origin strategy: `sitemap.md:30`, `state.md:54`, `plan.md:100,236,433`.
- sc-5 `.gitignore` covers `.opencode/node_modules`, `node_modules`, `dist`, `.astro`, `.playwright-mcp`, `.env*`.
- Build gate (`.opencode/state.md:52-55`): all four items `[x]`.
- `.opencode/artifacts/.active` unchanged = `m0-execution-ready-baseline`.
- `git status` clean.

## Goal-Backward Verification

- **Artifacts:** 3/3 required artifacts exist, substantive, and wired:
  1. Scaffold-authorization record — `state.md` + `todo.md`.
  2. Toolchain matrix + decline rationale — `tech-stack.md` + `website-build/plan.md` + `MEMORY.md`.
  3. Placeholder-origin strategy — `docs/sitemap.md` + `website-build/plan.md` + `state.md`.
- **Key links checked:** tech-stack pins → Plan 01 package.json (pass); state build gate → M1 start (pass, gate closed); placeholder-origin strategy → Plan 01 `site` (pass; does not wait on M3 domain).
- **Stubs detected:** 0.

## Review Summary

Three review rounds (doc-only, proportionate):

- **Round 1:** 3/5 — placeholder-origin contradiction (Plan 01 uses placeholder but verifier was said to reject it) + RSS scope (MEMORY said Plan 01 pins RSS). Fixed in `24f4a81`.
- **Round 2:** 3/5 — fixes incomplete: M0 plan instruction text stale; Plan 10 wired to "run existing verifier" without injecting production origin or rejecting placeholders (M3 could ship a placeholder); MEMORY Decision line still implied Plan 01 pins RSS. Fixed in `b0b2794` (added Plan 10 production-origin injection + release-mode placeholder rejection; reconciled M0 plan instruction text; clarified MEMORY Decision line).
- **Round 3 (final):** 5/5, no findings, nextAction = close. Both prior findings fully resolved; no new inconsistency.

- **Critical issues:** 0. **Important issues:** 0 (final). **Minor issues:** 0 (final).
- **Overall assessment:** pass.

## Next Steps

- Plan 01 (M1 — Astro policy-kernel tracer) may start. Switch `.active` to the Plan 01 artifact when beginning.
- P02A (Signal Path homepage prototype) was already unblocked by t1 and runs in parallel under `.opencode/artifacts/homepage-art-direction/` (out of M0 scope).
- Side request completed: `.opencode/opencode.json` `small_model` set to `openai/gpt-5.4-mini` (`89f7ab7`) — **requires quitting and restarting opencode** to take effect.
- PR creation: not applicable (planning docs only; ask operator before any push).
