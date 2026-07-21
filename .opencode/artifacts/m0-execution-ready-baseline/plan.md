# M0 Execution-Ready Baseline — Implementation Plan

> **For Claude:** Implement this plan task-by-task.

**Goal:** Close the M0 build gate so Plan 01 (M1 — Astro policy-kernel tracer) may start, by durably recording scaffold authorization, the confirmed toolchain matrix with the declined alternative, and the placeholder-origin strategy.

**Discovery Level:** 0 — Pure internal planning work. The toolchain decision was user-approved 2026-07-22 and reconfirmed against the live registry this session. No new libraries, external APIs, or architecture decisions remain; remaining work is recording confirmed decisions in planning docs. Skipping research per `plan.md` Phase 2 Level 0.

**Context Budget:** ~15% — three small documentation tasks on existing planning files.

---

## Context (already done — not tasks)

- **t1 (repository baseline): COMPLETE** — commit `e5956d5` (2026-07-22): `.pi/` -> `.opencode/` migration recorded as high-similarity renames; `.gitignore` expanded to exclude `.opencode/node_modules/`, `node_modules/`, `dist/`, `.astro/`, `.playwright-mcp/`, `.env*`; `docs/sitemap.md` republished. `git status` clean. Tracked in `state.md:14-16,52`, `todo.md:24`.
- **sc-1, sc-5: COMPLETE.**
- This plan covers the **three remaining build-gate items** (t2, t3, t4). t1 alone already unblocks P02A (Signal Path prototype), which runs in parallel and is tracked under `.opencode/artifacts/homepage-art-direction/` — out of scope here.

---

## Must-Haves

### Observable Truths

(Operator/agent perspective — M0 is a gate, not user-facing.)

1. A future agent reading `state.md` finds an unambiguous, dated scaffold-authorization record naming Plan 01 scope (Astro baseline + publishing contracts + sitemap/robots).
2. A future agent reading `tech-stack.md` finds the confirmed toolchain matrix with registry evidence AND the declined Astro 7 / TS 7 alternative with the `@astrojs/check` peer-compat reason.
3. A future agent reading `plan.md` finds the placeholder-origin strategy for Plan 01 explicitly recorded (production origin injected at release time; final domain is NOT a build-gate item).
4. The M0 build-gate checklist in `state.md:50-55` and `todo.md:24-26` shows all four items checked.
5. `git status` is clean and `git log` shows the gate-closure commits.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Scaffold-authorization record | Dated approval for Plan 01 scope | `.opencode/state.md`, `.opencode/artifacts/website-build/todo.md` |
| Toolchain matrix + decline rationale | Confirmed pins + declined alternative + peer-compat evidence | `.opencode/tech-stack.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/artifacts/MEMORY.md` |
| Placeholder-origin strategy | Plan 01 `site` uses placeholder; real origin at release | `docs/sitemap.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/state.md` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `tech-stack.md` pins | Plan 01 `package.json` | exact version pins | Scaffold uses wrong major (Astro 7 / TS 7) and `astro check` breaks |
| `state.md` build gate | M1 start | checked items | Gate stays open; M1 cannot start |
| Placeholder-origin strategy | Plan 01 `astro.config.mjs` `site` | recorded strategy | Plan 01 waits on final domain (M3) unnecessarily |

## Dependency Graph

```text
t1 [COMPLETE: e5956d5]
  |
  +-> t2 Record scaffold authorization [checkpoint] — needs t1; creates auth record in state.md + todo.md
  +-> t3 Record toolchain matrix + decline rationale — needs t1; creates matrix in tech-stack.md + plan.md + MEMORY.md
        (t2 ‖ t3: no shared files)
  |
  +-> t4 Record placeholder-origin strategy — needs t2 + t3 (shares state.md with t2, plan.md with t3)

Wave 1: t2, t3 (parallel — disjoint files)
Wave 2: t4 (after both)
```

Task files (conflict detection):
- t2: `.opencode/state.md`, `.opencode/artifacts/website-build/todo.md`
- t3: `.opencode/tech-stack.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/artifacts/MEMORY.md`
- t4: `docs/sitemap.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/state.md`

## Tasks

### Task t2 — Record scaffold authorization [checkpoint]

**has_checkpoint: true** — Scaffold authorization is an explicit operator decision (AGENTS.md: "After explicit scaffold approval"). Record it only after the operator confirms.

**needs:** t1 (COMPLETE). **creates:** dated scaffold-authorization record.

**Steps:**

1. **Pause for operator confirmation.** Present Plan 01 scope to the operator: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts` + publishing contracts (`src/content.config.ts`, `src/lib/publishing.ts`, `src/lib/routes.ts`, `src/data/sources.json`, `tests/policy.test.mjs`) + discovery output (`src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `scripts/verify-build.mjs`). Ask: authorize scaffold of this scope now?

2. **On approval, edit `.opencode/state.md`** — change the build-gate bullet at `state.md:51`:
   - FROM: `- [ ] **Explicit scaffold authorization recorded.**`
   - TO: `- [x] **Explicit scaffold authorization recorded** (2026-07-22; Plan 01 scope: Astro baseline + publishing contracts + sitemap/robots; broader modules get separate authorization).`

3. **Edit `.opencode/artifacts/website-build/todo.md:25`**:
   - FROM: `- [ ] Record explicit scaffold authorization`
   - TO: `- [x] Record explicit scaffold authorization (2026-07-22; Plan 01: Astro baseline + publishing contracts + sitemap/robots)`

4. **Verify:**
   - `rg -n "scaffold.*authoriz|2026-07-22" .opencode/state.md .opencode/artifacts/website-build/todo.md` shows the dated record.
   - `rg -n "Plan 01.*authorized|scaffold authorization" .opencode/state.md` matches.

**Files:** `.opencode/state.md`, `.opencode/artifacts/website-build/todo.md` (2 files, ≤3).

---

### Task t3 — Record toolchain matrix + decline rationale

**has_checkpoint: false.** The decision is already made and reconfirmed this session with live registry evidence; this task records it durably.

**needs:** t1 (COMPLETE). **creates:** confirmed matrix + declined alternative + peer-compat evidence.

**Registry evidence (2026-07-22, reconfirmed this session):**
- `astro@5` latest = `5.18.2`; dist-tag `latest` = `7.1.3` (declined)
- `typescript@6` latest = `6.0.3`; dist-tag `latest` = `7.0.2` (declined)
- `@astrojs/check` latest = `0.9.9`; peerDependencies `typescript: '^5.0.0 || ^6.0.0'` (does NOT support TS 7 — decline reason)
- `@astrojs/rss` latest = `4.0.19`

**Steps:**

1. **Edit `.opencode/tech-stack.md`** — append a "Toolchain decision" subsection after line 26 (the Planned Dependencies table). Content:

   ```markdown
   ## Toolchain Decision (2026-07-22)

   Staying on Astro 5.18.2 + TypeScript 6.0.3 + `@astrojs/check` 0.9.9. Astro 7.1.3 /
   TypeScript 7.0.2 are declined because `@astrojs/check` 0.9.9 peerDependencies declare
   `typescript: '^5.0.0 || ^6.0.0'` and do not support TypeScript 7; upgrading to TS 7 would
   break `astro check`. Confirmed against the live registry 2026-07-22:
   - `astro@5` latest = 5.18.2; dist-tag `latest` = 7.1.3 (declined)
   - `typescript@6` latest = 6.0.3; dist-tag `latest` = 7.0.2 (declined)
   - `@astrojs/check` latest = 0.9.9 (peers `^5||^6`)
   - `@astrojs/rss` latest = 4.0.19

   Revalidate these pins at Plan 01 scaffold time; if `@astrojs/check` releases TS 7
   support, revisit the Astro 7 / TS 7 upgrade as a separate decision.
   ```

2. **Edit `.opencode/artifacts/website-build/plan.md:216`** — add the decline rationale after the existing pin line:
   - The line currently reads: `   - Pin Astro \`5.18.2\`, TypeScript \`6.0.3\`, \`@astrojs/check\` \`0.9.9\`, Node \`24.16.0\`, npm \`11.13.0\`.`
   - Add immediately after: `   - Decline Astro 7.1.3 / TypeScript 7.0.2: \`@astrojs/check\` 0.9.9 peers \`typescript: ^5.0.0 || ^6.0.0\` and does not support TS 7 (verified 2026-07-22). Revisit when \`@astrojs/check\` supports TS 7.`

3. **Append to `.opencode/artifacts/MEMORY.md`** — in the decisions section, add:
   ```markdown
   - **Decision:** Pin Plan 01 to Astro 5.18.2 + TypeScript 6.0.3 + `@astrojs/check` 0.9.9. `@astrojs/rss` 4.0.19 is confirmed now but installed and pinned by Plan 05. Astro 7.1.3 / TypeScript 7.0.2 declined because `@astrojs/check` 0.9.9 peerDependencies (`typescript: ^5.0.0 || ^6.0.0`) do not support TS 7; upgrading would break `astro check`. Confirmed against the live npm registry 2026-07-22.
   - **Rationale:** Avoids a broken `astro check` gate on day one. Latest-in-major pins stay current without crossing the unsupported TS 7 boundary.
   - **Consequences:** Plan 01 pins Astro, TypeScript, and `@astrojs/check` in `package.json` and `package-lock.json` (use `npm ci`); `@astrojs/rss` 4.0.19 is confirmed now but installed and pinned by Plan 05. Revisit when `@astrojs/check` publishes TS 7 support; that is a separate upgrade decision, not automatic.
   ```

4. **Verify:**
   - `rg -n "5.18.2|6.0.3|0.9.9|4.0.19" .opencode/tech-stack.md` — pins present.
   - `rg -n "Astro 7|TS 7|declined|peer.*5.*6|7.1.3|7.0.2" .opencode/tech-stack.md .opencode/artifacts/website-build/plan.md` — declined alternative + peer-compat recorded.
   - `rg -n "Astro 5.18.2.*TypeScript 6.0.3|declined" .opencode/artifacts/MEMORY.md` — durable memory entry.

**Files:** `.opencode/tech-stack.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/artifacts/MEMORY.md` (3 files, ≤3).

---

### Task t4 — Record placeholder-origin strategy

**has_checkpoint: false.** The route vocabulary is already confirmed and published; this records the origin strategy so Plan 01 does not wait on the final domain (M3).

**needs:** t2 + t3 (shares `state.md` with t2, `plan.md` with t3). **creates:** placeholder-origin strategy.

**Steps:**

1. **Edit `docs/sitemap.md`** — add an "Origin strategy" note. Locate the existing "Locked decisions" / trailing-slash section and append:
   ```markdown
   - **Origin strategy:** Plan 01 sets `site` in `astro.config.mjs` to a placeholder origin (e.g. `https://example.com`). Plan 01's `scripts/verify-build.mjs` validates generated canonicals against that configured `site` (placeholder allowed during local M1–M2 work). The production origin is injected at release time (Plan 10 / M3); the release verifier rejects placeholder origins so no placeholder ships to production. The final domain is NOT a build-gate item.
   ```

2. **Edit `.opencode/artifacts/website-build/plan.md`** — in the Constraints section (around line 99), add:
   - `- Plan 01's \`astro.config.mjs\` uses a placeholder origin; the production origin is injected at release time (Plan 10). The final domain gates the release track (M3), not the build gate.`

3. **Edit `.opencode/state.md:52-53`** — check the route/visibility gate item:
   - FROM: `- [ ] **Route/origin strategy and visibility policy agreed** (already documented in\n      \`docs/sitemap.md\` and \`plan.md\`; confirm at scaffold time).`
   - TO: `- [x] **Route/origin strategy and visibility policy agreed** (2026-07-22; `docs/sitemap.md` authoritative for route dispositions `launch | conditional | defer | absent` and content visibility `draft | public | noindex`; Plan 01 uses a placeholder origin injected at release).`

4. **Verify:**
   - `rg -n "placeholder origin|authoritative|route disposition|inject.*release" docs/sitemap.md .opencode/artifacts/website-build/plan.md .opencode/state.md`
   - `docs/sitemap.md` route vocabulary (`launch | conditional | defer | absent`) and content vocabulary (`draft | public | noindex`) are distinct and confirmed.

**Files:** `docs/sitemap.md`, `.opencode/artifacts/website-build/plan.md`, `.opencode/state.md` (3 files, ≤3).

---

## Final Gate-Close Verification

After all three tasks:

```bash
# Build gate fully closed
rg -n "^\- \[x\].*Repository baseline|^\- \[x\].*scaffold authorization|^\- \[x\].*Route/origin strategy|^\- \[x\].*toolchain" .opencode/state.md
rg -n "^\- \[x\].*Re-pin toolchain" .opencode/artifacts/website-build/todo.md

# Toolchain re-pin item — mark after t3 records the matrix
# (todo.md:26 "Re-pin toolchain against current registry" -> check once matrix is recorded)

# Clean tree
git status --short   # expect: clean after commits
git log --oneline -6  # expect gate-closure commits

# M0 success criteria all pass
rg -n "scaffold.*authoriz|2026-07-22" .opencode/state.md .opencode/artifacts/website-build/todo.md
rg -n "5.18.2|6.0.3|0.9.9|declined|Astro 7|7.0.2|peer.*5.*6" .opencode/tech-stack.md .opencode/artifacts/website-build/plan.md
rg -n "placeholder origin|authoritative|route disposition" docs/sitemap.md .opencode/artifacts/website-build/plan.md
rg -n "playwright-mcp|\.env|node_modules|dist" .gitignore
```

**Stop condition:** M0 build gate closed; all four items checked; `git status` clean. Plan 01 (M1) may start. P02A (already unblocked by t1) continues in parallel.

---

## Constitutional Compliance

- No `git add .` / `git add -A` — stage explicit files only.
- No `--force` push, `--no-verify`, `reset --hard`, `checkout .`, `clean -fd`.
- No new dependencies (pure documentation).
- No `as any` / `@ts-ignore`.
- All tasks ≤3 files.
- t2 has a checkpoint (operator scaffold-authorization decision).

Compliance: PASS.
