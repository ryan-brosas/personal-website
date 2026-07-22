# M1 Proven Static Foundation — Execution Plan

**Bead:** m1-proven-static-foundation
**Created:** 2026-07-22
**Status:** planned
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:211-247`
**Roadmap exit:** `.opencode/roadmap.md:72-81`
**PRD:** `.opencode/artifacts/m1-proven-static-foundation/prd.json`
**Spec:** `.opencode/artifacts/m1-proven-static-foundation/spec.md`

## Goal

Prove the static publishing **policy kernel** — pinned Astro baseline, shared Zod
schemas + pure functions, a thin content adapter, hand-built sitemap/robots, and a
read-only verifier — as the tracer bullet every later plan plugs into.

## Non-goals

- No `@astrojs/rss` (Plan 05), no `@astrojs/sitemap` (custom), no production HTML
  routes (Plan 03), no brand shell/components/styles (Plan 03), no content records
  (Plan 03+), no Pages CMS config (Plan 02), no production origin (Plan 10).

## Truths (must-haves)

- Pins exactly: Astro 5.18.2, TypeScript 6.0.3, `@astrojs/check` 0.9.9 (peers
  `^5||^6`). Node 24.16.0 / npm 11.13.0. (`tech-stack.md:23-37`)
- Static output; `trailingSlash: "always"` on HTML; placeholder `site` =
  `https://example.com` (release rejection is Plan 10). (`sitemap.md:25,30`)
- Visibility `draft | public | noindex`, fail-closed default `draft`. `draft` → no
  route; `noindex` → crawlable, excluded from discovery; `public` → routes +
  discovery. (`sitemap.md:19-21`, `plan.md:222-230`)
- Evidence variants: `Verified` requires `sourceId`; `Proposed` requires a
  trade-off; `Open` requires missing proof + a blocked decision. Distinct
  publish/updated/reviewed date fields. (`plan.md:225-229`)
- One custom `/sitemap.xml` (exactly `dist/sitemap.xml`, no index, no
  `@astrojs/sitemap`) from the public-route inventory; `/robots.txt` from the
  configured origin. (`sitemap.md:27,61-64`)
- Robots is **visibility-independent**: no `Disallow` for any route (noindex stays
  crawlable, drafts have no route); emits `User-agent: *` + absolute slashless
  `Sitemap: <site>/sitemap.xml`.
- Verifier is **read-only** (no writes/deletes to `dist/`), parameterized for root
  vs fixture build; placeholder origin allowed locally. (`spec.md:82-84`)
- Node-native TS: `"type":"module"`, `erasableSyntaxOnly`, `verbatimModuleSyntax`,
  explicit `.ts` relative imports, JSON via `with {type:"json"}`. (`spec.md`)
- No `git add .`; stage explicit paths. No `--force`, no hook bypass.

## Key links

- Route contract: `docs/sitemap.md:25-30,61-66,92`
- Master Plan 01 scope: `.opencode/artifacts/website-build/plan.md:211-247`
- Evidence/visibility rules: `.opencode/artifacts/website-build/plan.md:222-230`
- Collection registry (later plans): `plan.md:325,338,359,369,381,395-397`
  (`pages`,`projects`,`blog`,`directories`,`directoryEntries` via `glob()`;
  `settings` via `file()`)
- Astro 5.18.2 facts: `defineCollection`/`reference` from `astro:content`;
  `glob`/`file` from `astro/loaders`; `z` from `astro/zod` (Node-resolvable).
  `reference()`/`image()` are Astro-runtime-only — keep in `content.config.ts`.
  Empty `glob()` warns but does not throw; `file()` on `{}` loads zero, no warn.

## Testing scope boundary (documented)

M1 proves the **kernel** (Zod schemas + pure functions in `publishing.ts` /
`routes.ts` / `discovery.ts`) via Node `safeParse` + pure-function tests against
**injected synthetic state**, and proves the **adapter** (`content.config.ts`)
loads + type-checks via `astro check` + `astro build`. Behavioral schema-enforcement
on real records is vacuous in M1 (no records) and first exercised when Plan 03 adds
the first record; the shared schemas are already tested. The test-only
`tests/fixtures/policy-site/` build (not the root build) gives the non-vacuous
canonical/trailing-slash proof, since the root M1 build has no HTML routes.

## TDD protocol (all tasks except T1)

Each task: **RED** (write/extend `tests/policy.test.mjs`; for a new module, create a
minimal stub exporting intentionally-wrong defaults so the test fails on the
**assertion**, not on module-not-found) → run, confirm RED for the right reason →
**RED commit** (`test:`) → **GREEN** (replace stub with correct impl) → run,
confirm GREEN → **GREEN commit** (`feat:`) → refactor if needed (tests stay green).
`tests/policy.test.mjs` is plain JS (`.mjs`) importing `.ts` modules with explicit
extensions; Node 24 strips types. Never `git add .`; stage explicit paths. Commits
auto-allowed (`opencode.json:83`).

## Dependency graph & waves

```
T1 (config) → T2 (publishing policy) → T3 (routes + adapter)   [Wave 1: policy kernel]
                                          ↓
                          T4 (discovery render) → T5 (canonical fixture) → T6 (verifier)  [Wave 2: discovery/verifier]
```

- Wave 1 is strictly sequential: T2 needs T1's `package.json`/types; T3 needs T2's
  `publishing.ts`.
- Wave 2 is sequential: T4 needs T3's `routes.ts`; T5 needs T1's installed Astro;
  T6 needs T4/T5 outputs.
- **Mid checkpoint after T3** (policy kernel complete). Operator may pause here; no
  human decision required, but it is the natural context-relief point before the
  discovery/verifier wave.

## Tasks

### T1 — Configuration bootstrap (Wave 1, NO TDD — pure config)

- **Category:** scaffold · **Depends on:** — · **Files (5, cohesive config exception):**
  `package.json`, `package-lock.json` (generated), `astro.config.mjs`,
  `tsconfig.json`, `src/env.d.ts`
- **Implement:**
  - `package.json`: `"type":"module"`; scripts `dev`/`check`/`build`/`preview`/
    `test` (`node --test`)/`verify` (`node scripts/verify-build.mjs`); deps
    `astro@5.18.2`; devDeps `typescript@6.0.3`, `@astrojs/check@0.9.9`. No other deps.
  - `tsconfig.json`: extends `astro/tsconfigs/strict`; add `erasableSyntaxOnly: true`,
    `verbatimModuleSyntax: true`; `include: [".astro/types.d.ts", "**/*"]`;
    `exclude: ["dist"]`.
  - `astro.config.mjs`: `defineConfig({ site: "https://example.com", output:
    "static", trailingSlash: "always" })`.
  - `src/env.d.ts`: `/// <reference types="astro/client" />`.
- **Verify:** `npm ci` → 0; `npm run check` → 0 (generates `.astro/`); `npm run build`
  → 0, `dist/` exists; `rg -n '"static"|trailingSlash|example\.com' astro.config.mjs`.
- **Commit:** `chore: scaffold pinned Astro 5 static baseline (T1)`
- **Risk:** `@astrojs/check` 0.9.9 peer-compat with TS 6.0.3 → caught immediately by
  `npm run check`. Mitigation: pins reconfirmed against registry 2026-07-22.

### T2 — Publishing policy (Wave 1, RED/GREEN, 3 files)

- **Category:** contracts · **Depends on:** T1 · **Files:** `tests/policy.test.mjs`,
  `src/lib/publishing.ts`, `src/data/sources.json`
- **RED:**
  - `src/lib/publishing.ts` stub: `VisibilitySchema = z.literal("draft")`;
    `isDiscoverable = () => false`; `isRoutable = () => false`;
    `EvidenceSchema = z.object({})`; `validateEvidence = () => ({ok:false})`;
    `resolveRelationship = () => ({ok:false})` (intentionally wrong).
  - `src/data/sources.json` = `{}` (correct — empty public-safe evidence registry).
  - `tests/policy.test.mjs`: assert default visibility `draft`; `isDiscoverable`
    true only for `public`; `isRoutable` true for `public`+`noindex`, false for
    `draft`; evidence invariants (`Verified` needs `sourceId` present AND in the
    injected synthetic registry, else `unknown-source`; `Proposed` needs
    `tradeOff`; `Open` needs `missingProof`+`blocked`); unknown `sourceId`
    rejected; distinct `publishedAt`/`updatedAt`/`reviewedAt` date fields;
    `resolveRelationship` rejects hidden/missing/`draft`/`noindex` targets against
    an injected synthetic collection map, accepts `public`.
  - Run: `npm test` → fails on assertions (stub wrong), not ENOENT.
  - **RED commit:** `test: add publishing policy assertions (RED, T2)`
- **GREEN:**
  - `publishing.ts`: `VisibilitySchema = z.enum(["draft","public","noindex"])`
    (pure Zod from `astro/zod`); `isDiscoverable(v)` → `v==="public"`;
    `isRoutable(v)` → `v==="public"||v==="noindex"`; `EvidenceSchema` discriminated
    union on `kind` (`Verified`/`Proposed`/`Open`); `validateEvidence(e, registry)`
    → `{ok,error?}` (Verified checks `sourceId ∈ registry`); `resolveRelationship(
    ref, collectionsMap)` → `{ok,target?}` rejecting hidden/missing/draft/noindex.
    No `astro:*` import, no `any`, no `throw` for domain (Result-like).
  - Run: `npm test` → 0; `npm run check` → 0; `sources.json` is `{}`.
  - **GREEN commit:** `feat: publishing policy kernel (T2)`
- **Risk:** relationship resolver depends on injected synthetic map (pure) — no
  `astro:content` import. Verify no `astro:` import: `rg -n "astro:" src/lib/publishing.ts` → none.

### T3 — Routes + content adapter (Wave 1, RED/GREEN, 4-file cohesive exception)

- **Category:** contracts · **Depends on:** T2 · **Files (4, cohesive exception —
  shared test file + thin adapter + empty container):** `tests/policy.test.mjs`
  (extended), `src/lib/routes.ts`, `src/content.config.ts`,
  `src/content/settings/site.json`
- **RED:**
  - `src/lib/routes.ts` stub: `ROUTES = []`; `canonicalHref = () => ""` (wrong).
  - `src/content/settings/site.json` = `{}` (correct — empty container).
  - `src/content.config.ts`: real wiring (not stub) — `import { defineCollection,
    reference } from "astro:content"`, `import { glob, file } from "astro/loaders"`,
    `import { z } from "astro/zod"`, import shared schemas from `./lib/publishing.ts`;
    register `pages`/`projects`/`blog`/`directories`/`directoryEntries` via `glob()`
    and `settings` via `file("./content/settings/site.json")`. (Empty in M1.)
  - Extend `tests/policy.test.mjs`: route-contract invariants (HTML trailing slash,
    file endpoints slashless) + `canonicalHref("/services/", "https://example.com")`
    === `"https://example.com/services/"`; `canonicalHref("/probe/",
    "https://example.com")` round-trips; non-html path handling.
  - Run: `npm test` → fails on `canonicalHref` stub.
  - **RED commit:** `test: add route invariants and canonicalHref (RED, T3)`
- **GREEN:**
  - `routes.ts`: `canonicalHref(path, site)` → absolute URL, trailing slash for
    HTML routes, no double-slash; `ROUTES` registry (empty in M1; grows in Plan 03+);
    `isHtmlRoute`/`isFileEndpoint` helpers.
  - Run: `npm test` → 0; `npm run check` → 0 (adapter type-checks, imports shared
    schemas — does not restate); `npm run build` → 0 (adapter module load; empty-glob
    warnings expected).
  - **GREEN commit:** `feat: route inventory and content adapter (T3)`
- **Risk:** empty `glob()` warnings (documented, not errors); `content.config.ts`
  uses `astro:content` (not Node-testable) — gated by `astro check` + `astro build`,
  not behavioral tests. Verify no schema restatement: `rg -n "z\.enum|z\.object"
  src/content.config.ts` → only `reference()`/`image()` wrappers, schemas imported.

**— MID CHECKPOINT (policy kernel complete) —**

### T4 — Discovery rendering (Wave 2, RED/GREEN, 4-file cohesive exception)

- **Category:** discovery · **Depends on:** T3 · **Files (4, cohesive exception —
  shared test file + pure renderer + 2 thin endpoints):** `tests/policy.test.mjs`
  (extended), `src/lib/discovery.ts`, `src/pages/sitemap.xml.ts`,
  `src/pages/robots.txt.ts`
- **RED:**
  - `src/lib/discovery.ts` stub: `renderSitemap = () => ""`; `renderRobots = () =>
    ""` (wrong).
  - Extend tests: `renderSitemap(publicRoutes, site)` → only `public` in `<urlset>`,
    deterministic order + XML escaping; `draft`/`noindex` excluded; empty input →
    well-formed `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    `renderRobots(site)` → no `Disallow`, absolute slashless `Sitemap:
    https://example.com/sitemap.xml`.
  - Run: `npm test` → fails on render stubs.
  - **RED commit:** `test: add sitemap/robots render assertions (RED, T4)`
- **GREEN:**
  - `discovery.ts`: `renderSitemap(routes, site)` → XML string (sorted, escaped);
    `renderRobots(site)` → `User-agent: *\n\nSitemap: <site>/sitemap.xml\n`. Pure.
  - `src/pages/sitemap.xml.ts`: `GET()` → `new Response(renderSitemap(ROUTES,
    Astro.site.href), { headers: { "Content-Type": "application/xml" } })`.
  - `src/pages/robots.txt.ts`: `GET()` → `new Response(renderRobots(Astro.site.href),
    { headers: { "Content-Type": "text/plain" } })`.
  - Run: `npm test` → 0; `npm run build` → 0, `dist/sitemap.xml` + `dist/robots.txt`
    exist (root sitemap is the empty `<urlset>` placeholder).
  - **GREEN commit:** `feat: sitemap and robots endpoints (T4)`
- **Risk:** endpoints use `Astro.site` (runtime) — Node tests cover the pure render
  functions only; endpoint output verified in T6. Verify `@astrojs/sitemap` absent:
  `rg -n "@astrojs/sitemap" package.json` → none.

### T5 — Canonical fixture (Wave 2, RED/GREEN, 3 files)

- **Category:** tracer · **Depends on:** T1 (installed Astro) · **Files:**
  `tests/policy.test.mjs` (extended integration), `tests/fixtures/policy-site/astro.config.mjs`,
  `tests/fixtures/policy-site/src/pages/probe.astro`
- **RED:**
  - Fixture `astro.config.mjs`: `defineConfig({ site: "https://example.com",
    output: "static", trailingSlash: "always" })`.
  - Fixture `src/pages/probe.astro`: minimal valid HTML **without** a canonical link.
  - Integration test: copy `tests/fixtures/policy-site` to a temp dir; run
    `astro build --root <abs-temp>` with `cwd` = repo root (uses root
    `node_modules/.bin/astro`); read `<temp>/dist/probe/index.html`; assert exactly
    one `<link rel="canonical" href="https://example.com/probe/">`. Cleanup temp in
    `finally` (`fs.rm(temp, {recursive, force})`).
  - Run: `npm test` → fails (0 canonicals, expected 1) — assertion failure, not ENOENT.
  - **RED commit:** `test: add canonical fixture tracer (RED, T5)`
- **GREEN:**
  - Add to `probe.astro`: `<link rel="canonical" href={new URL(Astro.url.pathname,
    Astro.site).href} />` (self-canonical; `/probe/` → `https://example.com/probe/`).
  - Run: `npm test` → 0 (exactly one self-canonical).
  - **GREEN commit:** `feat: canonical tracer fixture (T5)`
- **Risk:** fixture build must resolve `astro` from root `node_modules` (set
  `cwd` to repo root; use absolute `--root`). Verify temp cleanup runs even on
  failure (`finally`).

### T6 — Read-only verifier (Wave 2, RED/GREEN, 2 files)

- **Category:** verifier · **Depends on:** T4, T5 · **Files:** `tests/policy.test.mjs`
  (extended), `scripts/verify-build.mjs`
- **RED:**
  - `scripts/verify-build.mjs` stub: `process.exit(0)` (passes everything — wrong).
  - Tests: `verifyBuild(manifest)` → `{ok, errors[]}`. Manifest shape:
    `{ distDir, site, expectedHtmlRoutes, expectedFileEndpoints, allowEmptySitemap }`.
    - **Root context:** `distDir:"dist"`, `site:"https://example.com"`,
      `expectedHtmlRoutes:[]`, `expectedFileEndpoints:["sitemap.xml","robots.txt"]`,
      `allowEmptySitemap:true` → `ok:true`.
    - **Fixture context:** `expectedHtmlRoutes:["/probe/"]`,
      `expectedFileEndpoints:[]`, `allowEmptySitemap:false` → `ok:true`.
    - **Failure cases (synthetic temp dists):** missing canonical; duplicate
      canonical; wrong-origin canonical; HTML slash mismatch; `draft`/`noindex` URL
      in sitemap but absent from public set; unexpected route; missing endpoint;
      endpoint mismatch → each `ok:false` with a named error.
    - **Read-only:** snapshot the `dist` tree (paths + mtimes) before and after;
      assert unchanged.
  - Run: `npm test` → fails (stub passes the failure cases).
  - **RED commit:** `test: add read-only build verifier cases (RED, T6)`
- **GREEN:**
  - `verify-build.mjs`: `verifyBuild(manifest)` reads `distDir` read-only; asserts
    each `expectedHtmlRoute` has `index.html` with exactly one self-canonical
    matching `<site><route>` (trailing slash for HTML); each `expectedFileEndpoint`
    exists; no unexpected routes/files; sitemap URLs ⊆ public set (empty allowed
    iff `allowEmptySitemap`); origin matches `site`. CLI entry: root build when
    invoked as `npm run verify`.
  - Run: `npm test` → 0; `npm run build` → 0; `npm run verify` → 0 (root).
  - **GREEN commit:** `feat: read-only build verifier (T6)`
- **Risk:** verifier must never write/delete. Verify: tests snapshot the tree
  before/after and assert no mutation.

## Full M1 exit gate (after T6)

```
npm ci && npm run check && npm test && npm run build && npm run verify
```

All exit 0. `dist/sitemap.xml` (empty `<urlset>` placeholder) + `dist/robots.txt`
exist; `tests/fixtures/policy-site` fixture proves one self-canonical; verifier is
read-only; `@astrojs/sitemap` absent; `package.json` pins exactly Astro 5.18.2 /
TS 6.0.3 / `@astrojs/check` 0.9.9.

## Constitutional compliance (self-check)

- No `git add .` / `git add -A` anywhere — explicit path staging only.
- No `--force` push, no `--no-verify`.
- No new dependencies beyond the 3 M0-authorized pins (Astro/TS/check).
- File-count exceptions (declared, cohesive): T1 = 5 (config bundle), T3 = 4
  (shared test + adapter + empty container), T4 = 4 (shared test + renderer + 2
  thin endpoints). All others ≤ 3.
- Human checkpoints: none required mid-plan; the T3 mid-checkpoint is a
  context-relief pause, not a decision gate. Final M1 close (`/ship` Phase 6) asks
  the user before marking the artifact complete.

## Open questions

None. All spec gaps resolved during `/plan` (canonical tracer = test fixture;
empty sitemap = local placeholder; content-adapter scope boundary documented).

## Stop conditions

- Single active artifact `m1-proven-static-foundation`; no child plans (`/ship`
  does not recurse). All 6 tasks live in this one `plan.md`.
- If `npm run check` fails on a peer-compat issue (TS 6 vs `@astrojs/check`), stop and
  reconfirm pins before proceeding — do not downgrade silently.
- If the fixture build cannot resolve `astro` from root `node_modules`, stop and
  wire the spawn `cwd`/PATH explicitly before retrying.
- P02A/P02B run in parallel under their own artifacts; disjoint files — no
  conflict with M1.
