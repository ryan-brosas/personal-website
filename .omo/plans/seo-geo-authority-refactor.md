# seo-geo-authority-refactor - Work Plan

## TL;DR (For humans)

**What you'll get:** Your website's plumbing rebuilt around a single source of truth for every page, so the site can finally present you as a credible authority — a proof-backed homepage, a services page, a real case study, plus about and contact — with correct search-engine and AI-crawler behavior baked in. This first release is the shippable commercial core; blog/insights, research, and analytics come in a later plan.

**Why this approach:** One route registry drives everything (canonical URLs, navigation, sitemap, the build verifier), so pages can never silently disagree about what exists. The homepage only becomes publicly indexable once a real, evidence-backed case study exists — no empty claims. Every change is written test-first against the existing 211-test suite so the site is never left broken between steps.

**What it will NOT do:** No framework rewrite (stays a static Astro site). No blog, research section, analytics, or CMS in this release. No marketing claims without an approved evidence record behind them.

**Effort:** Large
**Risk:** Medium - the route registry replaces load-bearing code that 211 tests and the build verifier hard-code against; the mitigation is strict test-first sequencing so the suite is green at every commit.
**Decisions to sanity-check:** Production domain is `https://ryanjosebrosas.dev`; the launch case study is a transparent write-up of this website's own build (no client permission needed); Projects→Case Studies and Blog→Insights renames supersede the old `docs/sitemap.md` route contract.

Your next move: approve to start work (`$start-work`), or ask for a high-accuracy review first. Full execution detail follows below.

---

> TL;DR (machine): Large / Medium risk. Deliver P0-P4 first releasable increment: ONE ROUTE_REGISTRY policy kernel (origin-fail, registry-derived verifier) -> data models + collection migration -> metadata + JSON-LD entity graph + layouts -> evidence/freshness -> proof-gated commercial core (home/services/case-studies/about/contact) + crawler robots policy. TDD against 211-test suite, suite green every commit.

## Scope

### Must have
- ONE `ROUTE_REGISTRY = defineRoutes(...)` (`src/config/routes.ts` + `src/lib/route-registry.ts`) as the single executable route source, with derived helpers `pathFor / canonicalFor / parentFor / navItems / breadcrumbsFor / discoverableRoutes / expectedBuildManifest` and registry validation (duplicate id/path, trailing-slash correctness, missing parent, nav without public-capable route, gate without impl). `PAGES` in `src/config/site.ts` and the empty `ROUTES` array in `src/lib/routes.ts` are eliminated as independent route sources (PAGES derived from the registry during transition, then deleted).
- Env-driven origin: `SITE_ORIGIN` from `process.env`; `astro.config.mjs` throws at config load when `NODE_ENV === "production"` and `SITE_ORIGIN` is unset or equals `https://example.com`. Local/test builds fall back to the placeholder WITHOUT throwing.
- `scripts/verify-build.mjs` CLI entry derives `site`, `expectedHtmlRoutes`, `expectedDiscoverableRoutes` from `ROUTE_REGISTRY` + `SITE_ORIGIN` — NO hard-coded literals. Verifier also fails if any emitted JSON-LD or canonical contains `example.com` while `SITE_ORIGIN` is the production value.
- Data models as strict TS: `PublicationRecord`, `SeoFields`, `PersonEntity` (id `ryan-brosas`, `sameAs`), `SourceRecord`, `ClaimRecord`, `TopicFields` (pillars), plus `ServiceRecord` / `CaseStudyRecord` collection schemas. Old collections (`projects`, `blog`, `directories`, `directoryEntries`) removed from `content.config.ts`; `settings` preserved.
- Single `buildPageMetadata()` (typed `PageMetadata` return) feeding all layouts via `SeoHead.astro`; JSON-LD graph (`Person / WebSite / WebPage / Service / Article / BreadcrumbList`) with stable `@id` anchors; breadcrumbs derived from registry hierarchy.
- Evidence/freshness kernel: claim/source validation (`evidence.ts`), freshness policy (`freshness.ts`), typed public->public relationships (`relationships.ts`) + presentation components (`Byline`, `EvidenceNote`, `FreshnessNotice`, `RelatedContent`).
- Proof-gated commercial core: `/services/`, `/case-studies/` hub + `/case-studies/[slug]/` (one transparent self-project entry), `/about/`, `/contact/`, and homepage `/` promoted from `noindex` to `public` ONLY when the machine-executable proof gate passes. Layouts `CommercialLayout` + `CaseStudyLayout`.
- Crawler policy: `src/config/crawlers.ts` typed `CrawlerPolicy[]`; `renderRobots` extended to emit per-agent allow/disallow — allow `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`; disallow `GPTBot`, `ClaudeBot`, `Google-Extended`.
- 15 design-doc invariants (INV-01..15) expressed as build-contract/unit tests; discovery parity enforced (public canonical == sitemap == internal discovery == verifier expected). Suite green at every commit.
- `docs/sitemap.md` rewritten to the new IA and `AGENTS.md` updated to point route truth at `ROUTE_REGISTRY`.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NO framework rewrite; NO SSR (static output only); NO UI framework / MDX / client JS framework.
- NO P5+ scope in this plan: NO Insights/Blog pages, NO `rss.xml.ts`, NO `@astrojs/rss` install, NO Research section, NO `llms.txt`, NO analytics, NO IndexNow/console wiring, NO redirect manifest population (greenfield — no legacy public URLs). `insights-rss`, `research`, `measurement-experiments` are DEFERRED.
- NO thin taxonomy/aggregation pages: `/tags`, `/authors`, `/categories`, `/resources`, `/projects`, `/blog`, `/directories`, `/tools`, `/search`, query-filter URLs, location pages, glossary, AI-summary URLs.
- NO service detail subpages (single `/services/` page); NO generated OG images; NO form backend; NO theme switcher; NO CMS runtime shipped to the public site.
- NO unapproved claims/metrics/testimonials — every public claim needs an approved evidence ref. The self-project case study is limited to observable, self-referential facts (stack, timeline, decisions) — NO performance/client-outcome metrics.
- NO weakening of `resolveRelationship` (public->public only stays); fix dev-time link failures by SEQUENCING, not policy relaxation.
- NO two coexisting route sources at the end of any wave; NO leaving the test suite red between commits; NO reduced "MVP/demo" of any listed component.

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: **TDD** (RED -> GREEN -> refactor) using the existing Node test runner (`node --test`, files `tests/*.test.mjs`/`.test.ts`). Every behavior change rewrites/adds the test FIRST (red), implements to green, then deletes the superseded old contract in the same commit. The suite is NEVER left red between commits.
- Composite gate per todo (all must pass): `npm run check && npm test && npm run build && npm run verify`.
- Evidence: `.omo/evidence/task-<N>-seo-geo-authority-refactor.<ext>` (outside a ulw-loop; if run under `omo ulw-loop`, use its `currentAttemptDir`). Capture BOTH the RED and GREEN test output and the real-surface artifact (built HTML/robots/sitemap dump, or the `verify` stdout) per todo.

## Execution strategy

### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.

- **W0 (prerequisite, serial):** Todo 1 — satisfy the lifecycle-policy write gate. Hard prerequisite for EVERY implementation todo.
- **W1 (policy kernel):** Todos 2-5 — route registry, origin-fail, registry-derived verifier, contract-doc supersede.
- **W2 (data + evidence models):** Todos 6-8 — content schemas + collection migration, entities/sources seed, evidence/freshness/relationships.
- **W3 (presentation kernel):** Todos 9-12 — metadata builder + SeoHead, structured-data graph + JsonLd + Breadcrumbs, layouts, shared components.
- **W4 (commercial core + crawlers):** Todos 13-16 — crawler policy + robots, case-studies hub+slug + self-project content, services/about/contact, homepage proof-gate promotion.
- **Final:** F1-F4 in parallel after all todos.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. lifecycle approval gate | - | 2-16, F1-F4 | - |
| 2. route-registry kernel | 1 | 3,4,5,6,9,10,13,14,15,16 | - |
| 3. origin-fail config | 1,2 | 4,13,16 | 5 |
| 4. verifier registry-derived | 2,3 | 13,14,15,16 | - |
| 5. contract-doc supersede | 2 | - | 3,4 |
| 6. content schemas + collection migration | 2 | 7,8,14,15 | 9 |
| 7. entities + sources seed | 6 | 10,14,16 | 8 |
| 8. evidence/freshness/relationships | 6 | 12,14,16 | 7 |
| 9. metadata builder + SeoHead | 2 | 10,11,13,14,15,16 | 6 |
| 10. structured-data graph | 2,7,9 | 11,14,15,16 | - |
| 11. layouts (Commercial, CaseStudy) | 9,10 | 13,14,15,16 | 12 |
| 12. shared components | 8,10 | 14 | 11 |
| 13. crawlers + robots | 3,4,9,11 | 16 | 14,15 |
| 14. case-studies hub+slug + self-project | 4,6,7,8,10,11,12 | 16 | 13,15 |
| 15. services/about/contact | 4,6,9,11 | 16 | 13,14 |
| 16. homepage proof-gate promotion | 3,4,7,8,13,14 | - | - |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [x] 1. Satisfy the lifecycle-policy write gate for this slug
  What to do / Must NOT do: Create the approval marker so source writes outside `.opencode/artifacts/` are unblocked for slug `seo-geo-authority-refactor`. Inspect `.opencode/plugin/lifecycle-policy/policy.ts` to confirm the EXACT expected location, filename, and JSON shape (it reads `.opencode/artifacts/.active` -> slug -> requires `spec.md` + `plan.md` + `approval.json` whose `planSha256` == sha256 of the RAW plan bytes). Set `.active` to this slug, create `.opencode/artifacts/seo-geo-authority-refactor/{spec.md,plan.md}` (plan.md may be a pointer to this `.omo/plans` file's content) and `approval.json` with the correct `planSha256` computed via `sha256sum`. Must NOT disable, edit, or bypass the plugin logic; must NOT weaken the gate globally.
  Parallelization: Wave 0 | Blocked by: - | Blocks: 2-16, F1-F4
  References (executor has NO interview context - be exhaustive): `.opencode/plugin/lifecycle-policy/policy.ts` (untracked; `approvalStatus(dir)` + `planSha256` logic — hash is `createHash('sha256').update(readFileSync(planPath))`, NOT `echo -n`); prior working example on `main`: `.opencode/artifacts/m2-accessibility-acceptance/approval.json` = `{version:1, slug, planSha256, approvedAt}`; `.opencode/AGENTS.md` (writes under `.opencode/artifacts/` are always allowed).
  Acceptance criteria (agent-executable): a throwaway write to a source path (e.g. append a comment to `src/env.d.ts` then revert) succeeds without the "Blocked: missing lifecycle approval for source mutation" error.
  QA scenarios (name the exact tool + invocation): happy — `sha256sum .opencode/artifacts/seo-geo-authority-refactor/plan.md` matches `approval.json.planSha256`, then `Edit` a source file succeeds; failure — before creating `approval.json`, confirm the same `Edit` is rejected with the block message (captures the gate is real). Evidence `.omo/evidence/task-1-seo-geo-authority-refactor.txt`
  Commit: Y | chore(lifecycle): approve slug seo-geo-authority-refactor for source writes

- [x] 2. Route registry kernel replaces PAGES/ROUTES as the single route source
  What to do / Must NOT do: Create `src/config/routes.ts` (`ROUTE_REGISTRY = defineRoutes({...})` inventory for the first-release IA: `/`, `/services/`, `/case-studies/`, `/case-studies/[slug]/`, `/about/`, `/contact/`, endpoints `/sitemap.xml`, `/robots.txt`, `/404.html`) and `src/lib/route-registry.ts` (`defineRoutes`, derived `pathFor/canonicalFor/parentFor/navItems/breadcrumbsFor/discoverableRoutes/expectedBuildManifest`, and `validateRegistry()` covering duplicate id/path, malformed pattern, missing/extra trailing slash on HTML routes, file endpoints WITHOUT trailing slash, missing parent, nav entry without a public-capable route, gate declared without impl). Make `PAGES` in `src/config/site.ts` a DERIVED export from the registry (adapter shim) so existing callers keep working; keep `src/config/site.ts` for identity only. Reserve `case-studies` (Projects rename) and note `insights` as a future registry entry — do NOT create Insights routes now. TDD: rewrite `tests/policy.test.mjs` (imports `ROUTES` at :13, `resolveRoutes` at :21) to import from the registry FIRST (red), implement (green), then delete the empty `ROUTES` array from `src/lib/routes.ts`. Must NOT leave two independent route sources; must NOT hard-code canonical strings anywhere but the registry helpers.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 3,4,5,6,9,10,13,14,15,16
  References: `src/lib/routes.ts:10-24` (empty ROUTES + `ROOT_ROUTE_POLICY`), `src/config/site.ts:16-23` (PAGES, navLabelKey union, NAV_ORDER), `src/lib/site-routes.ts:12,21-34` (`resolveRoutes`, imports PAGES), `tests/policy.test.mjs:13,21-151`, design doc §13 + §13.1 + Appendix A (`RouteDefinition` type + YAML inventory + routeGates), INV-01/02/06/07.
  Acceptance criteria: `npm run check && npm test` green; `grep -rn "config/site" src tests | grep -v identity` shows PAGES consumed only via the derived shim; `validateRegistry()` unit test asserts it throws on a duplicate path and on a missing trailing slash.
  QA scenarios: happy — a registry unit test asserts `canonicalFor("case-studies")` returns `<origin>/case-studies/` and `discoverableRoutes()` excludes any `noindex` route; failure — a test feeding a malformed route (endpoint WITH trailing slash) asserts `validateRegistry()` throws. Evidence `.omo/evidence/task-2-seo-geo-authority-refactor.txt`
  Commit: Y | feat(routes): introduce ROUTE_REGISTRY as single route source

- [x] 3. Env-driven origin with production placeholder guard
  What to do / Must NOT do: Read `SITE_ORIGIN` from `process.env` in `astro.config.mjs`; `site` = `process.env.SITE_ORIGIN ?? "https://example.com"`. Throw at config-load ONLY when `NODE_ENV === "production"` AND (`SITE_ORIGIN` unset OR === `https://example.com`). Local/dev/test builds must NOT throw. Ensure `route-registry.canonicalFor` consumes this origin. Must NOT hard-code the production domain in source (comes from env); must NOT throw in non-prod.
  Parallelization: Wave 1 | Blocked by: 1,2 | Blocks: 4,13,16 | Can parallelize with: 5
  References: `astro.config.mjs:14` (`site: "https://example.com"`), design doc §13 (SITE_ORIGIN ?? example.com, throw-in-PROD), INV-12. Production origin: `https://ryanjosebrosas.dev`.
  Acceptance criteria: `NODE_ENV=production node -e "import('./astro.config.mjs')"` (no SITE_ORIGIN) exits non-zero with a placeholder-origin error; `SITE_ORIGIN=https://ryanjosebrosas.dev NODE_ENV=production` load succeeds; plain `npm run check && npm test && npm run build` (dev) still green.
  QA scenarios: happy — `SITE_ORIGIN=https://ryanjosebrosas.dev npm run build` then grep built `<link rel="canonical">` shows the prod origin, zero `example.com`; failure — `NODE_ENV=production` without `SITE_ORIGIN` build fails fast with the guard message. Evidence `.omo/evidence/task-3-seo-geo-authority-refactor.txt`
  Commit: Y | feat(config): env-driven SITE_ORIGIN with prod placeholder guard

- [ ] 4. Verifier derives its manifest from the registry (de-hardcode)
  What to do / Must NOT do: Rewrite the `scripts/verify-build.mjs` CLI entry (currently `:229-236`) to compute `site`, `expectedHtmlRoutes`, `expectedDiscoverableRoutes`, and endpoint list from `ROUTE_REGISTRY.expectedBuildManifest()` + `process.env.SITE_ORIGIN ?? "https://example.com"` — NO route/site literals. Add a verifier check: FAIL if any built `<link rel="canonical">` or `<script type="application/ld+json">` contains `example.com` while `SITE_ORIGIN` is the prod value. Update `tests/shell.test.mjs` (hard-codes the 4-route manifest at :96-147) to derive expectations from the registry FIRST (red), then green. Must NOT keep any literal route array in the verifier; must NOT relax `allowEmptySitemap:false`.
  Parallelization: Wave 1 | Blocked by: 2,3 | Blocks: 13,14,15,16
  References: `scripts/verify-build.mjs:229-236`, `tests/shell.test.mjs:96-147`, design doc §13 (expectedBuildManifest, discovery parity), INV-06.
  Acceptance criteria: `npm run build && npm run verify` green with the registry-derived manifest; a temporary registry entry addition is reflected in `verify` expectations without editing the CLI entry; `SITE_ORIGIN=https://ryanjosebrosas.dev npm run build && npm run verify` passes and the example.com guard check is exercised.
  QA scenarios: happy — `npm run verify` stdout lists exactly the registry's discoverable routes; failure — inject `example.com` into a built canonical (temp) and confirm `verify` exits non-zero on the guard. Evidence `.omo/evidence/task-4-seo-geo-authority-refactor.txt`
  Commit: Y | refactor(verify): derive build manifest from ROUTE_REGISTRY

- [x] 5. Supersede the old route-disposition contract
  What to do / Must NOT do: Rewrite `docs/sitemap.md` to the first-release IA (home/services/case-studies(+[slug])/about/contact + endpoints; explicitly mark projects/blog/directories/tools/resources as removed/renamed). Update root `AGENTS.md` to remove "Read `docs/sitemap.md` before changing routes" as the authority and point route truth at `src/config/routes.ts` (`ROUTE_REGISTRY`). Must NOT leave the old launch routes listed as current; must NOT delete `docs/sitemap.md` history/context — rewrite its contract section.
  Parallelization: Wave 1 | Blocked by: 2 | Blocks: - | Can parallelize with: 3,4
  References: `docs/sitemap.md:39-58` (lists /projects//blog//directories//tools//resources/ as LAUNCH), root `AGENTS.md` (Planning Sources: "Read docs/sitemap.md"), design doc §20 P0.
  Acceptance criteria: `docs/sitemap.md` route table == registry HTML routes; `AGENTS.md` references `ROUTE_REGISTRY`; no test/build impact (`npm run check && npm test` still green).
  QA scenarios: happy — diff shows renamed/removed routes and the new authority pointer; failure — grep `docs/sitemap.md` for `/projects/` or `/directories/` as current returns nothing. Evidence `.omo/evidence/task-5-seo-geo-authority-refactor.txt`
  Commit: Y | docs(routes): supersede sitemap contract with ROUTE_REGISTRY

- [x] 6. Content data models + atomic collection migration
  What to do / Must NOT do: Add strict TS models in `src/lib/content-schemas.ts`: `PublicationRecord` (visibility `draft|public|noindex`, dates `{publishedAt,modifiedAt,reviewedAt,expiresAt}`, `owner:'ryan'`, `reviewStatus`), `SeoFields` (title/description/social/robots{index,follow,maxImagePreview,maxSnippet,maxVideoPreview}, allowlist-gated `canonicalOverride`), `TopicFields` (pillar union `ai-workflow-systems|agent-reliability|content-research-operations|context-knowledge-systems`), plus `ServiceRecord` + `CaseStudyRecord` extending `PublicationRecord`. In `src/content.config.ts`: add `case-studies` + `services` collections; in the SAME commit REMOVE `projects`, `blog`, `directories`, `directoryEntries` registrations and move/delete any content files under those dirs (no orphans). Preserve `settings` unchanged. TDD: extend `tests/policy.test.mjs` for the new schemas FIRST. Must NOT keep old + new collections coexisting; must NOT change the `visibility`/`evidence` unions' fail-closed semantics.
  Parallelization: Wave 2 | Blocked by: 2 | Blocks: 7,8,14,15 | Can parallelize with: 9
  References: `src/content.config.ts:12-61`, `src/lib/publishing.ts:10-13,21-41` (visibility + evidence unions), `src/content/AGENTS.md:6-10`, design doc §12 (exact TS interfaces), INV-03/05/09.
  Acceptance criteria: `npm run check` green (new types compile); `npm test` green; `grep -rn "projects\|blog\|directories" src/content.config.ts` returns nothing; `npm run build` produces no orphaned-collection error.
  QA scenarios: happy — a schema test asserts a `CaseStudyRecord` with `visibility:'public'` and no evidence ref FAILS validation; failure — build with a leftover `src/content/projects/*.md` present asserts a config error (then remove it). Evidence `.omo/evidence/task-6-seo-geo-authority-refactor.txt`
  Commit: Y | feat(content): publication/seo/topic models + collection migration

- [ ] 7. Person entity + source registry seed
  What to do / Must NOT do: Create `src/config/entities.ts` with `PersonEntity` (`id:'ryan-brosas'`, `sameAs: VerifiedExternalProfile[]`, `knowsAbout`) and `SourceRecord`/`ClaimRecord` types wired to `src/data/sources.json` (currently `{}`). Seed only APPROVED, self-referential sources needed for the self-project case study (e.g. the public repo / live build). Must NOT invent external testimonials or metrics; must NOT list unverified `sameAs` profiles (D-15 deferred — include only confirmed public profiles).
  Parallelization: Wave 2 | Blocked by: 6 | Blocks: 10,14,16 | Can parallelize with: 8
  References: `src/data/sources.json:1` (`{}`), design doc §12 (PersonEntity, SourceRecord, ClaimRecord, kinds fact|metric|testimonial|interpretation|proposal, status approved|blocked|retired), Appendix B.
  Acceptance criteria: `npm run check` green; a test asserts every `ClaimRecord.status==='approved'` resolves to a `SourceRecord` id present in `sources.json`; unknown source id -> validation error.
  QA scenarios: happy — `evidence` lookup for the self-project claim returns an approved source; failure — a claim referencing a missing source id fails the resolver test. Evidence `.omo/evidence/task-7-seo-geo-authority-refactor.txt`
  Commit: Y | feat(entities): person entity + source/claim registry seed

- [x] 8. Evidence, freshness, and relationship policy
  What to do / Must NOT do: Create `src/lib/evidence.ts` (claim->source resolution, blocks build on missing/blocked refs), `src/lib/freshness.ts` (`updatedAt` only for substantive changes; stale detection vs `expiresAt`/`reviewedAt`), `src/lib/relationships.ts` (typed `{collection,id}` refs). Keep `resolveRelationship` public->public ONLY (do NOT weaken). Add a helper that returns an EMPTY related list when a target is not yet public (so dev-time linking to a still-`noindex` case study does not fail the build — fix by sequencing/empty, not by relaxing policy). TDD each. Must NOT allow a public page to reference a non-public target; must NOT emit freshness dates for trivial edits.
  Parallelization: Wave 2 | Blocked by: 6 | Blocks: 12,14,16 | Can parallelize with: 7
  References: `src/lib/publishing.ts:80-87` (`resolveRelationship` rejects non-public with `not-discoverable`), design doc §12 (relationships, evidence), §13 (freshness), INV-09/11/13.
  Acceptance criteria: `npm run check && npm test` green; test asserts `resolveRelationship` to a `noindex` target returns `{ok:false}` AND the related-list helper returns `[]` (no throw) for that same target.
  QA scenarios: happy — public->public relationship resolves ok and renders; failure — public->noindex relationship yields empty related list, build stays green. Evidence `.omo/evidence/task-8-seo-geo-authority-refactor.txt`
  Commit: Y | feat(evidence): claim/freshness/relationship policy kernel

- [x] 9. Single metadata builder + SeoHead refactor
  What to do / Must NOT do: Create `src/lib/metadata.ts` exporting `buildPageMetadata()` returning a named `PageMetadata { title; description; canonicalPath; noindex; ogTitle?; ogDescription?; ogType:'website'|'article' }`. Refactor `src/components/SeoHead.astro` to accept EXACTLY `PageMetadata` (no duplicate/ad-hoc props) and emit canonical (from `route-registry.canonicalFor` + origin), robots, and parameterized OG tags. TDD via a render/contract test. Must NOT add props that duplicate required fields; must NOT compute canonical anywhere but via the registry.
  Parallelization: Wave 3 | Blocked by: 2 | Blocks: 10,11,13,14,15,16 | Can parallelize with: 6
  References: `src/components/SeoHead.astro:8-15,27-34` (minimal props, unparameterized OG), design doc §13 (buildPageMetadata single builder), INV-01/03.
  Acceptance criteria: `npm run check && npm test && npm run build` green; built `/about/` HTML has exactly one self-referential canonical and OG title/description matching the page.
  QA scenarios: happy — metadata unit test asserts `buildPageMetadata` for a case study returns `ogType:'article'`; failure — passing an unknown prop to `SeoHead` is a type error (`npm run check`). Evidence `.omo/evidence/task-9-seo-geo-authority-refactor.txt`
  Commit: Y | feat(seo): single buildPageMetadata + SeoHead contract

- [ ] 10. JSON-LD entity graph + JsonLd/Breadcrumbs components
  What to do / Must NOT do: Create `src/lib/structured-data.ts` building a JSON-LD `@graph` (`Person`#person / `WebSite`#website / `WebPage` / `Service` / `Article` / `BreadcrumbList`) with stable `@id` anchors keyed off the origin; `src/components/JsonLd.astro` renders it; `src/components/Breadcrumbs.astro` derives from `route-registry.breadcrumbsFor`. Structured data must describe ONLY visible content (INV-03). TDD: unit tests set `site='https://ryanjosebrosas.dev'` explicitly (NOT env fallback) and assert no `example.com` in `@id`. Must NOT emit graph nodes for hidden/noindex pages; must NOT hard-code breadcrumb trails.
  Parallelization: Wave 3 | Blocked by: 2,7,9 | Blocks: 11,14,15,16
  References: design doc §13 (JSON-LD graph, stable @id), Metis gap #13 (example.com in @id), INV-03, `src/lib/route-registry.ts` (breadcrumbsFor).
  Acceptance criteria: `npm run check && npm test && npm run build` green; built `/case-studies/<slug>/` contains a valid `@graph` with `Article` + `BreadcrumbList`; grep confirms zero `example.com` in JSON-LD when built with prod origin.
  QA scenarios: happy — structured-data test asserts `Person['@id']` === `https://ryanjosebrosas.dev/#person`; failure — a noindex page emits no `WebPage` graph node (test). Evidence `.omo/evidence/task-10-seo-geo-authority-refactor.txt`
  Commit: Y | feat(seo): JSON-LD entity graph + breadcrumbs

- [ ] 11. Commercial + CaseStudy layouts
  What to do / Must NOT do: Create `src/layouts/CommercialLayout.astro` and `src/layouts/CaseStudyLayout.astro`, both feeding `SeoHead` via `buildPageMetadata` and rendering `JsonLd` + `Breadcrumbs`, preserving the existing BaseLayout a11y contract (single `<main id="main">`, skip link, one `<h1>`, single inline enhancement script, no-JS complete). Must NOT introduce a second inline script or break the skip-link/one-h1 contract enforced by `tests/shell.test.mjs`.
  Parallelization: Wave 3 | Blocked by: 9,10 | Blocks: 13,14,15,16 | Can parallelize with: 12
  References: `src/layouts/BaseLayout.astro`, `tests/shell.test.mjs:96-147` (a11y + one-inline-script contract), `src/AGENTS.md` (BaseLayout->SeoHead+skip link+single main), design doc §13.1.
  Acceptance criteria: `npm run check && npm test && npm run build && npm run verify` green; a page using each layout passes the existing shell a11y assertions.
  QA scenarios: happy — build a probe page with `CommercialLayout`, shell test asserts exactly one `<main>` + skip link; failure — a second inline `<script>` in a layout fails the one-inline-script test. Evidence `.omo/evidence/task-11-seo-geo-authority-refactor.txt`
  Commit: Y | feat(layouts): commercial + case-study layouts

- [ ] 12. Shared authority components
  What to do / Must NOT do: Create `src/components/{Byline,EvidenceNote,FreshnessNotice,RelatedContent}.astro` consuming `evidence.ts`/`freshness.ts`/`relationships.ts`. `RelatedContent` receives `[]` when targets are not public (per todo 8). `FreshnessNotice` shows dates only for substantive changes. `EvidenceNote` renders only approved claim refs. Must NOT render evidence for unapproved/blocked claims; must NOT show freshness for trivial edits.
  Parallelization: Wave 3 | Blocked by: 8,10 | Blocks: 14 | Can parallelize with: 11
  References: design doc §12/§13 (Byline/EvidenceNote/FreshnessNotice/RelatedContent), `src/lib/evidence.ts`/`freshness.ts`/`relationships.ts` (todo 8), INV-09/11.
  Acceptance criteria: `npm run check && npm test && npm run build` green; component tests assert `EvidenceNote` omits a `blocked` claim and `RelatedContent` renders nothing for a noindex target.
  QA scenarios: happy — `Byline` renders the ryan-brosas person; failure — `EvidenceNote` given a blocked claim renders empty (test). Evidence `.omo/evidence/task-12-seo-geo-authority-refactor.txt`
  Commit: Y | feat(components): byline/evidence/freshness/related

- [ ] 13. Crawler policy + robots differentiation
  What to do / Must NOT do: Create `src/config/crawlers.ts` exporting typed `CrawlerPolicy[]` (`{userAgent; allow?:string[]; disallow?:string[]}`): allow `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`; disallow `GPTBot`, `ClaudeBot`, `Google-Extended`; keep `User-agent: *` + `Sitemap:`. Change `renderRobots` signature to `(site: string, policy: CrawlerPolicy[]): string` — TDD: update the existing `renderRobots` tests FIRST (red), implement (green). Wire `robots.txt.ts` to pass the policy. Must NOT hard-code bot names in `robots.txt.ts` (centralize in `crawlers.ts`); must NOT conflate search-crawl permission with training consent (INV: separate).
  Parallelization: Wave 4 | Blocked by: 3,4,9,11 | Blocks: 16 | Can parallelize with: 14,15
  References: `src/lib/discovery.ts:40-46` (`renderRobots` emits only `User-agent:*`+`Sitemap`), `src/pages/robots.txt.ts`, `tests/policy.test.mjs` (renderRobots tests), design doc §Appendix C, INV: crawl≠training.
  Acceptance criteria: `npm run check && npm test && npm run build && npm run verify` green; built `/robots.txt` contains the allow/disallow blocks for the exact named bots + `Sitemap:` line with prod origin.
  QA scenarios: happy — `curl`/read built `dist/robots.txt` shows `User-agent: GPTBot\nDisallow: /` and `User-agent: OAI-SearchBot\nAllow: /`; failure — a robots test asserts `renderRobots` throws/typechecks if given a bad policy shape. Evidence `.omo/evidence/task-13-seo-geo-authority-refactor.txt`
  Commit: Y | feat(discovery): differentiated crawler robots policy

- [ ] 14. Case-studies hub + slug page + transparent self-project entry
  What to do / Must NOT do: Create `src/pages/case-studies/index.astro` (hub, min-child gate per INV-07 — renders only when >=1 public entry) and `src/pages/case-studies/[slug].astro` using `CaseStudyLayout`. Author `src/content/case-studies/this-site.md` — the transparent self-project: `visibility:'public'`, at least one `evidence` entry `kind:'verified'` referencing a `sourceId` in `sources.json`; content limited to OBSERVABLE self-referential facts (stack, timeline, decisions) — NO metrics/outcomes/testimonials. TDD the hub gate + slug rendering. Must NOT create thin/empty hub pages; must NOT include unapproved claims; must NOT promote the homepage here (that is todo 16).
  Parallelization: Wave 4 | Blocked by: 4,6,7,8,10,11,12 | Blocks: 16 | Can parallelize with: 13,15
  References: design doc §12 (CaseStudyRecord), §13 (hub min-child gate), Appendix B (example case-study record), `src/content/AGENTS.md` (add-a-page recipe: create content + register in registry), INV-07/09.
  Acceptance criteria: `npm run check && npm test && npm run build && npm run verify` green; `dist/case-studies/index.html` and `dist/case-studies/this-site/index.html` exist, are discoverable (in sitemap), and carry `Article`+`BreadcrumbList` JSON-LD.
  QA scenarios: happy — read built `dist/case-studies/this-site/index.html`, assert canonical `https://ryanjosebrosas.dev/case-studies/this-site/` + evidence note present; failure — a hub-gate test asserts the hub is NOT emitted/discoverable when zero public entries exist. Evidence `.omo/evidence/task-14-seo-geo-authority-refactor.txt`
  Commit: Y | feat(case-studies): hub + self-project entry

- [ ] 15. Services, about, contact via new layouts
  What to do / Must NOT do: Rebuild `/services/` (single page, `ServiceRecord`, distinct intent+proof — no detail subpages), migrate `/about/` and `/contact/` content onto `CommercialLayout` + `buildPageMetadata` + JSON-LD `Service`/`WebPage`. Retire/narrow the generic `[page].astro` so it only serves registry IDs. Preserve contact's scheduler CTA from settings (HTTPS calendly), `privacyRequired` locked false. TDD page contracts. Must NOT add service detail subpages; must NOT reintroduce the old PAGES-driven `[page].astro` catch-all for removed routes.
  Parallelization: Wave 4 | Blocked by: 4,6,9,11 | Blocks: 16 | Can parallelize with: 13,14
  References: `src/pages/[page].astro`, `src/content/pages/{about,services,contact}.md`, `src/content/settings/site.json` (schedulerUrl, CTAs), design doc §12 (ServiceRecord), INV-08.
  Acceptance criteria: `npm run check && npm test && npm run build && npm run verify` green; `dist/{services,about,contact}/index.html` exist with correct canonical + one `<h1>` + `Service`/`WebPage` JSON-LD; contact renders the scheduler CTA.
  QA scenarios: happy — read `dist/services/index.html`, assert `Service` JSON-LD + self canonical; failure — a test asserts a removed route (e.g. `/projects/`) produces NO built page. Evidence `.omo/evidence/task-15-seo-geo-authority-refactor.txt`
  Commit: Y | feat(pages): services/about/contact on commercial layout

- [ ] 16. Promote homepage to public via machine-executable proof gate
  What to do / Must NOT do: Implement the proof gate as a checklist ALL true before flipping `ROOT_ROUTE_POLICY.visibility` (`src/lib/routes.ts:22-24` / registry root) from `noindex` to `public`: (1) `src/content/case-studies/this-site.md` exists, `visibility:'public'`, >=1 `evidence` `kind:'verified'` -> `sourceId` in `sources.json`; (2) that `sourceId` present with non-empty label; (3) `npm run build && npm run verify` passes with `/` in `expectedDiscoverableRoutes`; (4) no claim in the homepage content lacks an evidence ref. Encode the gate as a test/build assertion so promotion is not manual guesswork. Update the homepage content (`index.astro`/its content source) to the proof-led positioning ("AI workflow systems for founder-led teams"), linking the case study. TDD: assert homepage is `noindex` until the gate conditions hold, then `public`. Must NOT flip to public if ANY condition fails; must NOT add unapproved homepage claims.
  Parallelization: Wave 4 | Blocked by: 3,4,7,8,13,14 | Blocks: -
  References: `src/lib/routes.ts:21-24` (ROOT_ROUTE_POLICY noindex), `src/pages/index.astro:15`, design doc §home-proof gate + INV-07, ADR-004 (Signal Path homepage motion — respect existing accepted decision), the self-project case study (todo 14).
  Acceptance criteria: `npm run check && npm test && npm run build && npm run verify` green; `dist/index.html` has NO `noindex`, self canonical `https://ryanjosebrosas.dev/`, `/` present in sitemap + discoverable routes; a gate unit test proves `/` stays noindex when the case study is absent/non-public.
  QA scenarios: happy — read `dist/index.html`, assert robots `index,follow` + case-study link + Person/WebSite/WebPage JSON-LD; failure — temporarily set the case study `visibility:'draft'`, rebuild, assert the gate keeps `/` noindex and excludes it from sitemap. Evidence `.omo/evidence/task-16-seo-geo-authority-refactor.txt`
  Commit: Y | feat(home): proof-gated public homepage promotion

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit — verify every todo 1-16 landed with its acceptance met and evidence captured; confirm all 15 INV invariants have a corresponding test; confirm discovery parity (public canonical == sitemap == internal discovery == verifier expected). Tool: read evidence files + `npm run check && npm test && npm run build && npm run verify`.
- [ ] F2. Code quality review — no duplicate route sources (single registry), no hard-coded origins/routes/bot-names outside their config, typed errors preserved, `resolveRelationship` not weakened, fail-closed visibility intact. Tool: `grep`/read diff + `oracle`/`momus` if high-accuracy review is requested.
- [ ] F3. Real manual QA — `SITE_ORIGIN=https://ryanjosebrosas.dev npm run build`, then inspect built `dist/{index,services,about,contact,case-studies/index,case-studies/this-site}/index.html`, `dist/robots.txt`, `dist/sitemap.xml`: canonical/robots/JSON-LD correct, zero `example.com`, crawler blocks present, homepage indexable. Tool: Bash grep over `dist/` + record outputs.
- [ ] F4. Scope fidelity — confirm NO P5+ leakage (no Insights pages, no `@astrojs/rss`, no rss.xml, no research, no llms.txt, no analytics), NO thin taxonomy pages, NO framework/SSR, self-project case study carries no unapproved metrics. Tool: `grep` for forbidden artifacts + read `content.config.ts`/`package.json`.

## Commit strategy
- One commit per todo (16 total), each using the `Commit:` line's conventional message; each commit leaves `npm run check && npm test && npm run build && npm run verify` green (TDD RED lives WITHIN the todo, never across a commit boundary).
- Todo 1 (lifecycle approval) commits first. Todos 2-5 (W1) commit in registry->origin->verifier->docs order. W2/W3 commit per todo in any intra-wave order respecting the dependency matrix. W4 commits 13-15 before 16 (homepage promotion is last).
- Do NOT squash away the RED->GREEN structure in the evidence; commits reference the plan todo number in the body. No push without explicit user request.

## Success criteria
- All 16 todos complete with both artifacts (RED->GREEN test output + real-surface `dist/` artifact) captured under `.omo/evidence/`.
- `SITE_ORIGIN=https://ryanjosebrosas.dev npm run check && npm test && npm run build && npm run verify` fully green; production build throws on the placeholder origin; local build still works.
- Single `ROUTE_REGISTRY` is the sole route source (PAGES/ROUTES eliminated); verifier + sitemap + robots all derived from it; discovery parity holds.
- First-release IA live and correct: proof-gated indexable homepage, `/services/`, `/case-studies/` hub + `this-site` entry, `/about/`, `/contact/`, differentiated crawler robots, JSON-LD entity graph, zero `example.com` in output.
- Zero P5+ scope shipped; zero thin taxonomy pages; fail-closed visibility + a11y (single main/skip-link/one-h1/no-JS-complete) intact; 15 INV invariants test-covered.
- F1-F4 all APPROVE.
