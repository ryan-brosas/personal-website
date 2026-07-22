# M1 Proven Static Foundation (Plan 01 — Policy-Kernel Tracer)

**Bead:** m1-proven-static-foundation
**Created:** 2026-07-22
**Status:** In Progress (artifact created; no tasks started)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:211-247`
**Roadmap exit:** `.opencode/roadmap.md:72-81`

## Bead Metadata

```yaml
depends_on: ["m0-execution-ready-baseline"]  # build gate closed 2026-07-22 (df1a082)
parallel: false                              # sequential tracer slices t1 -> t2 -> t3 -> t4
conflicts_with: []                           # P02A runs in a separate artifact, disjoint files
blocks: ["m2-accessible-core-shell"]          # M2 needs the policy kernel + verifier
estimated_hours: 8
```

---

## Problem Statement

### What problem are we solving?

The repository is greenfield and unscaffolded: no `package.json`, no source, no
dependencies. M0 closed the build gate (scaffold authorized, toolchain pinned,
placeholder-origin strategy recorded). M1 proves the policy kernel: an Astro
static baseline whose publishing contracts (collections, visibility enum,
evidence variants, typed relationships) drive sitemap/robots generation and a
generated-output verifier. This is the tracer bullet that every later plan
(brand shell, projects, blog, RSS, directory) plugs into.

### Why now?

The build gate is closed (`state.md:52-55`, all `[x]`). Scaffold is authorized
for exactly this scope (`state.md:53`). The toolchain is pinned against the
live registry and the local runtime matches (`node v24.16.0`, `npm 11.13.0`).
There is no remaining blocker for M1.

---

## Scope

**In scope (Plan 01 — `website-build/plan.md:215-236`):**

1. Pinned Astro 5 baseline: `package.json`, `package-lock.json`, `astro.config.mjs`,
   `tsconfig.json`, `src/env.d.ts`. Static output, strict TypeScript, placeholder
   `site`, `trailingSlash: "always"`.
2. Publishing contracts: `src/content.config.ts` (collection schemas + singleton
   records + `draft | public | noindex` enum), `src/lib/publishing.ts` (evidence
   variants Verified/Proposed/Open, publish/updated/reviewed semantics),
   `src/lib/routes.ts` (public-route inventory from the policy),
   `src/data/sources.json` (representative `public`/`draft`/`noindex` fixtures),
   `tests/policy.test.mjs` (policy assertions).
3. Discovery output + verifier: `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`,
   `scripts/verify-build.mjs`. One sitemap from the public-route inventory (NOT
   `@astrojs/sitemap`); robots from the configured origin; verifier is read-only
   and fails on route/canonical/visibility/origin mismatch (placeholder allowed
   locally).

**Non-goals:**

- No `@astrojs/rss` (installed/pinned by Plan 05).
- No brand shell, components, layouts, header/footer, or styled pages (Plan 03).
- No project case-study content or homepage choreography (Plan 04).
- No Pages CMS config (Plan 02).
- No production origin — `site` is a placeholder; injection is Plan 10's job.

---

## Success Criteria (M1 exit — `roadmap.md:79-81`)

Representative `public`, `draft`, and `noindex` fixtures pass
`npm run check && npm test && npm run build && npm run verify`:

1. **No draft output:** no `draft` route generates a page or appears in discovery.
2. **No `noindex` in discovery:** `noindex` pages are crawlable but excluded from
   sitemap/robots.
3. **One self-canonical per indexable page:** every `public` page emits exactly one
   `<link rel="canonical">` matching its own URL with a trailing slash.
4. **Correct slash behavior:** `trailingSlash: "always"` enforced in output.
5. **Verifier passes read-only:** `scripts/verify-build.mjs` exits 0 against the
   configured placeholder `site`; it would fail on route/canonical/visibility/origin
   mismatch.

---

## Constraints (from AGENTS.md, tech-stack.md, plan.md)

- Semantic HTML + plain CSS; no UI framework. (No UI is produced in M1.)
- Strict TypeScript (`astro: strict`); no `as any` / `@ts-ignore`.
- Static output; no SSR.
- One canonical visibility policy across routes, sitemap, robots, and verifier.
- `trailingSlash: "always"` on HTML routes.
- `@astrojs/sitemap` is NOT installed — the sitemap is hand-built from the
  public-route inventory so the policy is the single source of truth.
- Placeholder `site` (e.g. `https://example.com`) allowed during M1–M2; release
  rejection of placeholders is Plan 10's job.
- No `git add .`; stage explicit paths only. No `--force` push, no hook bypass.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| `@astrojs/check` 0.9.9 peer-compat breaks on TS 6.0.3 | Low | High | Pins reconfirmed against registry 2026-07-22; peers `^5||^6`. t1 verify (`npm run check`) catches immediately. |
| Sitemap includes `draft`/`noindex` routes | Med | High | t4 verify asserts no draft output and no `noindex` in discovery. |
| Duplicate or missing canonicals | Med | Med | t4 verifier asserts one self-canonical per indexable page. |
| Verifier not read-only (writes/deletes build output) | Low | High | t4 implements verifier as read-only assertions over `dist/`. |
| Placeholder origin fails local verify | Med | Med | Verifier validates against configured `site` (placeholder allowed); release rejection is Plan 10. |

---

## Related Tracks

- **P02A (Signal Path prototype):** runs in parallel under
  `.opencode/artifacts/homepage-art-direction/`. Disjoint files. Does not gate M1.
- **P02B:** gates Plan 03 Task 1 visual integration + Plan 04 choreography, NOT M1.

---

## Non-goals re-stated

This bead produces the policy kernel and its discovery/verifier tracer only. It
does not ship visible pages, brand assets, or content beyond the minimal
fixtures needed to prove the policy. UI, content, and CMS are later plans.
