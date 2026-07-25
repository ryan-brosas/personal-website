# Learnings — seo-geo-authority-refactor

Conventions, patterns, and successful approaches discovered during work on this plan.

_Auto-scaffolded by /start-work. Append new entries below - never overwrite._

---

## [2026-07-25] Task: T2 — ROUTE_REGISTRY as single route source

- **Test runner reality:** `npm test` = `node --test` running `*.test.mjs`, which import `.ts`
  directly via Node's native type-stripping. tsconfig sets `erasableSyntaxOnly` (NO enums/
  namespaces — use string-literal unions) and `verbatimModuleSyntax` (type-only imports MUST
  use `import type`). New kernel files followed both.
- **Registry API shape:** `defineRoutes(defs)` validates at construction (fail-fast) and returns
  a `RouteRegistry` object with METHODS (`ROUTE_REGISTRY.navItems()` etc.) — this matches the
  PAGES-shim call form in the plan. `validateRegistry` is a separate standalone export so unit
  tests can hit edge cases directly.
- **Layering that avoids a cycle:** `lib/routes.ts` (canonical primitives) ← `lib/route-registry.ts`
  ← `config/routes.ts` (ROUTE_REGISTRY). `routes.ts` must NOT import the registry, so
  `ROOT_ROUTE_POLICY` was moved OUT of `routes.ts` and is re-derived in `config/routes.ts` via
  `ROUTE_REGISTRY.byId("home")`. Consumers (index.astro, sitemap.xml.ts) just swapped the import
  source — one line each, no logic change.
- **Nav-order preservation:** existing NAV_ORDER was `[about, services, contact]`. Encoded as
  registry `navOrder` about=10/services=20/contact=30 so `navItems()` reproduces the shipped
  visual order (the design doc's services-first ordering would have broken the a11y/shell snapshot).
- **navLabelKey stays narrow:** `SettingsData.navLabels` has exactly about/services/contact keys,
  so `NavLabelKey` must remain that union. `case-studies` is registered (id reserved, hub gate
  declared) but carries NO navLabelKey and `navPlacement:"none"` — it is not navigable until T14
  adds the settings key + NAV_ORDER slot. This keeps `navItems()`/PAGES type-safe.
- **resolveRoutes stayed behavior-identical** by iterating `ROUTE_REGISTRY.navItems()` instead of
  PAGES; site-routes.ts no longer imports config/site (fewer PAGES consumers, same output).

## [2026-07-25T04:40:00Z] Task: T3 — env-driven SITE_ORIGIN with prod placeholder guard

- **Vite sets NODE_ENV=production internally** before evaluating `astro.config.mjs` during ANY
  `astro build` invocation — including test-invoked builds via `spawnSync`. This makes `NODE_ENV`
  unreliable as a discriminator for "real production build" vs "test build". Both `astro check`
  and test-invoked `astro build` see `NODE_ENV=production` inside the config file.
- **Guard design**: throw only when `SITE_ORIGIN` is explicitly set to the placeholder value
  (`https://example.com`). This catches the operator mistake of copying the placeholder into
  CI/CD env vars. Absent `SITE_ORIGIN` falls back silently — the normal dev/test state.
- **`declare const process`**: `@types/node` is not installed; added a minimal ambient declaration
  in `src/lib/route-registry.ts` so TypeScript accepts `process.env["SITE_ORIGIN"]` without
  requiring the package. The declaration is type-only, zero runtime cost.
- **`canonicalFor` signature**: made `origin` optional (`origin?: string`) in both the interface
  and implementation. Explicit `origin` arg (used by existing tests) takes precedence; env var
  is the production path; placeholder is the dev/test fallback. Tests pass unchanged.
- **Full gate**: `npm run check` (0 errors) + `npm test` (142/142) + `npm run build` (5 pages)
  + `npm run verify` (ok) + `SITE_ORIGIN=https://ryanjosebrosas.dev npm run build` (5 pages) all green.

## [2026-07-25] Task: T9 — buildPageMetadata builder + SeoHead PageMetadata contract

- **`noindex,follow` is load-bearing, NOT `nofollow`:** the task brief §4 said
  `noindex,nofollow`, but `tests/shell.test.mjs` asserts the exact string
  `content="noindex,follow"` (lines 123/296/487) for `/`, `/404.html`, and the
  noindex `/about/` variant. The "must not break shell.test.mjs" invariant wins —
  keep `noindex,follow`. Do NOT trust a prose spec over the executable test.
- **404 is registry-`public` but renders noindex:** `ROUTE_REGISTRY.byId("404")`
  has `visibility:"public"`, yet `/404.html` must emit `noindex,follow`. This is
  exactly why `buildPageMetadata` takes a `noindex` OVERRIDE — `404.astro` passes
  `noindex` explicitly. `buildPageMetadata("404", { noindex:true })`.
- **`[page].astro` noindex is content-driven, not registry-driven:** the variant
  shell test flips a content record's `visibility` to `noindex` and expects the
  robots meta. Registry says `about=public`, so `[page].astro` must pass
  `noindex={route.visibility === "noindex"}` as an override (override wins over
  the registry default). Deriving noindex purely from the registry would break
  that test.
- **Origin parity makes the canonical-source swap behavior-preserving:** old
  `SeoHead` used `Astro.site.href`; `astro.config` sets `site = SITE_ORIGIN ??
  "https://example.com"`. `ROUTE_REGISTRY.canonicalFor(id)` defaults its origin to
  `process.env["SITE_ORIGIN"] ?? "https://example.com"`. Identical → switching
  canonical derivation from `Astro.site` to `canonicalFor` changes no output.
- **`canonicalFor` positional signature:** it is `canonicalFor(id, params, origin?)`
  — call `canonicalFor(routeId, undefined)` for static routes (no params, env origin).
- **PageMetadata shape shipped** (task-brief shape, not the looser plan shape):
  `{ title, description, canonical, noindex, og: { title, description, image? } }`.
  Overrides: `{ title?, description?, noindex?, ogTitle?, ogDescription?, ogImage? }`.
  Page copy lives outside the registry, so title/description always arrive as
  overrides (default `""`); og.title/description default to the page title/description.
- **`index.astro` no longer needs `ROOT_ROUTE_POLICY`:** passing `routeId="home"`
  lets `buildPageMetadata` derive both canonical and noindex from the registry
  "home" entry — the T16 atomic-promotion property (flip home visibility → public)
  still holds, now through one fewer indirection.
- **Layering:** `src/lib/metadata.ts` imports `ROUTE_REGISTRY` from
  `src/config/routes.ts` (top of the stack) — no cycle, since nothing in the
  kernel imports metadata.ts.
- **Full gate green:** check 0 errors · test 157/157 · build 5 pages · verify ok.

## [2026-07-25] Task: T6 — content data models + atomic collection migration

- **New authority models** live in `src/lib/content-schemas.ts`: `PublicationRecord`,
  `SeoFields`, `TopicFields`, `ServiceRecord`, `CaseStudyRecord` (+ `PublicationDates`,
  `ReviewStatus`, `Robots`, `TopicPillar`, `SearchIntent`, `Audience`). Both a zod
  `*Schema` value and an inferred type are exported per model.
- **Do NOT reuse `publishing.ts` DateFieldsSchema for publications.** §12.2 needs
  `modifiedAt` + `expiresAt`; the kernel schema has `updatedAt` and no expiry. Since
  `publishing.ts` is off-limits, a local `PublicationDatesSchema` was added. Kept the
  kernel's `VisibilitySchema`/`EvidenceSchema` imports (never redefined).
- **Fail-closed vs "reject missing visibility":** these conflict. `visibility` keeps
  `.default("draft")`, so an omitted value defaults rather than rejects. Tests assert
  (a) an INVALID visibility value is rejected and (b) omitted → "draft". That satisfies
  the visibility contract without dropping the mandated fail-closed default.
- **canonicalOverride = reject-by-default:** `CANONICAL_OVERRIDE_ALLOWLIST` (empty) +
  `.refine(v => allowlist.includes(v))`. Any editor-supplied canonical fails until a
  code owner adds it. Cleaner than a literal union (empty zod union is impossible).
- **Records flatten SeoFields** (title/description top-level via `.merge`), matching the
  task's "extends PublicationRecord + SeoFields" phrasing, not the plan's nested `seo:`.
  `.merge()` is safe here — Publication/Seo/Topic field sets are disjoint.
- **Atomic migration, no orphan window:** in ONE edit, `content.config.ts` gained
  `services` + `"case-studies"` and dropped projects/blog/directories/directoryEntries.
  Removed now-unused `reference`/`z`/`RecordBase` imports. No src consumer referenced the
  dropped collections (verified via grep) so no downstream breakage.
- **Empty-dir warnings:** created `src/content/{services,case-studies}/` with `.gitkeep`.
  glob still WARNs "No files found matching **/*.md" (dir exists, no md yet) — but the
  old missing-BASE-dir warns for the removed collections are gone.
- **Test concurrency race (gotcha):** `npm test` = `node --test` runs test FILES in
  parallel. `tests/shell.test.mjs` and `tests/policy.test.mjs` BOTH spawn `astro build`;
  concurrent builds intermittently fail shell.test.mjs's D1/D2/D3 (~13 fails). Re-running,
  or running `node --test tests/shell.test.mjs` in isolation, is green (24/24). Not a
  logic bug — a build-output/timing race. Full clean run: 157/157.

## [2026-07-25] Task: T8 — evidence/freshness/relationship policy kernel

- **getRelatedList reuses, never weakens, resolveRelationship.** The UI-safety
  helper `getRelatedList(refs, collections)` is just
  `refs.filter(r => resolveRelationship(r, collections).ok)`. Non-public/unresolvable
  refs are DROPPED (empty list), so a partially-published graph (a still-`noindex`
  case study) builds green instead of failing — the "sequencing/empty" fix. The
  kernel's public->public-only rejection is untouched; a T8 test re-asserts it still
  returns `{ok:false}` for a noindex target. A public page thus never links a
  non-public target.
- **Evidence = errors-as-data core + one throwing build gate.** `resolveClaim`/
  `resolvePublicClaim` return a discriminated `{ok:true;sources}|{ok:false;error}`.
  Only `assertClaimResolvable` throws (the build block). Fail-closed: non-approved
  claim (`claim-blocked`/`claim-retired`), zero sources (`no-sources`), or a source
  id absent from the registry (`missing-source`). `Object.hasOwn(registry,id)` guards
  inherited-property ids ("constructor") exactly like resolveRelationship.
- **internal-only sources can't back a PUBLIC claim.** `resolvePublicClaim` rejects
  any source with `permission:"internal-only"` (design §12.5 "no public link/exposed
  path"), while `resolveClaim` still resolves it for internal drafts.
- **Freshness `now` is INJECTED, never Date.now().** Pure logic uses `Date.parse(now)`
  vs `Date.parse(dates.expiresAt/reviewedAt)`. INV-13 encoded as a closed `ChangeKind`
  union with a module-level `SUBSTANTIVE_CHANGES` readonly array
  (body-text/heading/data-value/new-section substantive; formatting/frontmatter-meta/
  typo-fix NOT). `nextModifiedAt` returns `{modifiedAt, changed}` — trivial edits keep
  the prior `modifiedAt` (or leave it `undefined`), never fabricating freshness.
- **T7 type reconciliation is documented in-file, not fought over.** evidence.ts
  carries minimal local ClaimRecord/SourceRecord mirroring §12.5; T7's
  `src/config/entities.ts` owns the canonical shapes. Registry is `Record<string,
  SourceRecord>` to match the `src/data/sources.json` object (`{}` today).
- **Full gate green:** check 0 errors (508 files) · test 182/182 · build 5 pages ·
  verify ok. No shell.test.mjs race this run (ran cleanly).

## [2026-07-25] Task: T7 — person entity + source/claim registry seed

- **New authority registry** lives in `src/config/entities.ts`: TS domain types
  `PersonEntity`/`VerifiedExternalProfile`/`SourceRecord`/`ClaimRecord` (all
  string-literal unions — `erasableSyntaxOnly` forbids enums), plus `PERSON_ENTITY`,
  `SELF_PROJECT_CLAIMS`, a zod `SourceRecordSchema` boundary validator, and the pure
  `resolveClaimSources(claim, registry)` resolver.
- **`knowsAbout` reuses T6's `TopicPillarSchema.options`** rather than re-listing the
  four pillars — one authority for the topic model + entity graph, no drift.
- **Type-only imports from publishing.ts** (`import type { SourceRegistry, ValidateResult }`)
  satisfy `verbatimModuleSyntax`; the visibility/evidence unions are NOT redefined.
- **Resolver semantics:** only `status==='approved'` claims are gated — they need >=1
  sourceId AND every id present in `sources.json`; empty -> `approved-claim-requires-source`,
  unknown -> `unknown-source`. Blocked/retired claims pass (they never render public;
  that is enforced downstream by T8's evidence policy).
- **Seeded source is honesty-safe:** ONE record, type `approved-artifact`, permission
  `public` — the committed static build + public source repo (directly observable). No
  live URL (site not launched), no metrics/testimonials/client data. `sameAs: []` (D-15
  deferred — never guess external profile URLs).
- **Updated the pre-existing `sources.json is empty` test** (it asserted `deepEqual({},...)`)
  to assert the seeded record's id-matches-key + non-empty title + public permission.
- **Concurrency gotcha:** T8 ran in parallel, writing `src/lib/{evidence,relationships,
  freshness}.ts` and editing the SAME `tests/policy.test.mjs`. A first `node --test` hit a
  transient `ERR_MODULE_NOT_FOUND` for `evidence.ts` caught mid-write; re-running after the
  file settled was green. Staged ONLY the three T7-owned paths — did not capture T8's
  untracked source files into the T7 commit.
- **Full gate green:** check 0 errors · full test 182/182 · policy.test.mjs isolated 132/132
  · build 5 pages · verify ok.

## [2026-07-25] Task 4 — Verifier derives manifest from ROUTE_REGISTRY (gate-filtered)

- **Registry helpers run AHEAD of the build.** `expectedBuildManifest()` returns
  `string[]` (NOT an object) and includes `/case-studies/`; `discoverableRoutes()`
  also includes it (locked by `tests/route-registry.test.mjs:163`). The hub is
  reserved (gate `case-studies-hub`) but not built until T14. A naive
  registry-derived manifest therefore fails the real build with
  `missing-route: /case-studies/` + `sitemap-missing`.
- **favicon.svg is not a route.** It is a `public/` static asset copied to dist
  root, so it can never come from the registry — it MUST be a declared literal in
  `expectedFileEndpoints` or the verifier flags `unexpected-file: favicon.svg`.
- **Gate filter is the stopgap discriminator.** `gate === "always"` selects the
  unconditionally-enabled routes (about/services/contact); the noindex root is
  kept via `|| visibility === "noindex"`; case-studies (gate `case-studies-hub`)
  falls out. Same expression drives both the CLI entry and shell.test.mjs so they
  can't drift.
- **RED needs the RAW helpers.** The shell test passes its own manifest to
  `verifyBuild` (it does NOT exercise the CLI entry), so a correct gate-filtered
  derivation is GREEN immediately. To get a meaningful RED, wire the test to the
  UNFILTERED registry helpers first (case-studies leaks → verifyBuild rejects),
  then add the filter for GREEN.
- **6 verifyBuild call sites** in shell.test.mjs shared the hard-coded 4-route
  manifest (not just the one at :96-147 named in the brief) — all replaced with the
  derived vars via a single top-of-file derivation block.
- **.mjs uses `process` without `declare`** — `astro check` types it fine (the file
  already used `process.argv`/`process.exit`); the `declare const process` pattern
  is only needed in the `.ts` policy kernel.
- **Placeholder-origin guard** is env-gated at the CLI (`forbidPlaceholderOrigin =
  site !== "https://example.com"`) and implemented as a pure option inside
  `verifyBuild` (testable, no env read in the kernel). Verified: EXIT=1 on an
  injected `example.com` canonical under `SITE_ORIGIN=prod`.

## [2026-07-25] Task: T10 — JSON-LD entity graph + JsonLd/Breadcrumbs components

- **Inherited a STALLED, inconsistent draft (untracked).** `src/lib/structured-data.ts`
  + `tests/structured-data.test.mjs` + `tests/breadcrumbs.test.mjs` existed but were
  three MUTUALLY-INCONSISTENT shapes: lib exported `buildStructuredData(routeId)->ARRAY`
  reading env, its test asserted a `#page`/`searchEntity`/`knowsAbout` shape the lib
  never produced (self-RED), and breadcrumbs.test asserted `breadcrumbsFor("home").length===1`
  while the committed registry SUPPRESSES home (returns `[]`). Rewrote all three to the
  T10 spec + registry reality. Lesson: verify on-disk state before assuming "no code yet".
- **Task API is `buildEntityGraph({ site, page })` -> `{ "@context":"https://schema.org", "@graph":[...] }`,
  NOT the array shape.** `site` (origin) is passed EXPLICITLY and is the ONLY origin source —
  dropped env/`declare const process`/`originFromEnv` entirely from the lib (the layout passes
  `Astro.site` at wire-time in T11+). Anchors: Person `${origin}/#person`, WebSite `${origin}/#website`,
  WebPage `${canonical}#webpage` (canonical via `ROUTE_REGISTRY.canonicalFor(id,undefined,origin)`).
- **`toOrigin(site)` strips a trailing slash** (`/\/+$/`) so `${origin}/#person` never doubles the
  slash — makes the builder robust whether the caller passes `.dev` or `.dev/`.
- **INV-03 gate = `visibility === "public"` ONLY.** Person + WebSite (global site identity) are
  ALWAYS emitted; WebPage/Service/Article/BreadcrumbList are emitted ONLY for `public` pages —
  `noindex` AND `draft` contribute no page node. Test proves a noindex page keeps Person/WebSite
  but drops WebPage + BreadcrumbList.
- **shell.test.mjs inline-script contract does NOT collide with JSON-LD.** `assertOneNavScript`
  (lines 54-62) filters out `type="application/ld+json"` and `importmap` before counting
  "behavioral" scripts. `JsonLd.astro` uses `<script is:inline type="application/ld+json" set:html=...>`
  — a DATA block, excluded by design. Added `is:inline` to silence the astro(4000) hint AND
  guarantee it is never bundled into `_astro/*.js` (which the verifier rejects).
- **Breadcrumb labels are derived, not stored.** The registry keeps no crumb copy, so both
  `Breadcrumbs.astro` and the lib title-case the route id (`"case-studies" -> "Case Studies"`).
  The trail itself comes straight from `breadcrumbsFor` (never hard-coded) so IA changes flow through.
- **`rm` is DENY-listed** in this repo's bash permissions — could not delete the broken stray
  `tests/breadcrumbs.test.mjs`; rewrote it in place to correct, registry-true assertions instead
  (kept as valid T10 breadcrumb-data-contract coverage).
- **Full gate green:** check 0 errors/0 warnings (513 files) · test 195/195 (was 182, +13) ·
  build 5 pages · verify ok. Components intentionally NOT wired into pages (T11/T14/T15).

## [2026-07-25] Task: T12 — shared authority components (Byline/Evidence/Freshness/Related)

- **`.astro` isn't Node-importable, so the TDD seam is a `.ts` file.** `node --test`
  can't import `.astro`. Extracted each component's ONE decision into
  `src/components/authority.ts` (`bylinePerson`/`evidenceSources`/`freshnessDate`/
  `relatedRefs`) — pure functions that DELEGATE to the T7/T8 kernels
  (`PERSON_ENTITY`/`resolvePublicClaim`/`nextModifiedAt`/`getRelatedList`) and
  reimplement nothing. The `.astro` files import the seam and only render. This gives
  a real RED (seam missing → `ERR_MODULE_NOT_FOUND`) AND tests the component contract,
  not just the kernel. 11/11 green.
- **Render-nothing is the guard pattern, not a branch in the seam.** Components use
  `{ sources.length > 0 && (...) }` / `{ shown !== undefined && (...) }` (same as the
  proven `Breadcrumbs.astro`). So a blocked/retired/internal-only claim → `[]` → empty,
  and a trivial edit → `undefined` → empty, with zero conditional logic in the `.astro`.
- **`freshnessDate` = `nextModifiedAt(...).changed ? .modifiedAt : undefined`.** INV-13:
  a trivial edit keeps the OLD `modifiedAt`, but the NOTICE must still show nothing — so
  gate on `.changed`, not on `.modifiedAt` being defined. Otherwise a prior substantive
  date would leak through a later typo-fix render.
- **`rel` is NOT a valid `<span>` attribute** — astro's `HTMLAttributes` rejects it
  (`ts(2322)`). `rel` belongs on `<a>`/`<link>`. Used `class="byline__author"` instead.
- **`resolvePublicClaim` (non-throwing) is the right resolver for a public component**,
  never `assertClaimResolvable` (build gate, throws). Internal-only-backed public claim
  → `{ok:false,"internal-only-source"}` → `[]`, so a public page never leaks it.
- **Suite-red was 100% T11's, confirmed in ISOLATION (not the build race).**
  `node --test tests/shell.test.mjs` alone → 24 pass / 2 fail, both T11's
  Commercial/CaseStudy layout probes (its untracked layouts + its shell.test.mjs edits).
  My components are unwired, so they can't touch those probes. Committed ONLY my 6 files.
- **Full gate for my slice:** check 0 errors (519 files) · components.test 11/11 ·
  build 5 pages · verify ok.

## [2026-07-25] Task: T11 — Commercial + CaseStudy authority layouts

- **Both layouts are thin WRAPPERS of BaseLayout, never re-implementations.** Pattern:
  `<BaseLayout routeId title description noindex?><JsonLd graph={buildEntityGraph({site,page})}/>
  <Breadcrumbs routeId/><slot/></BaseLayout>`. The single `<main id="main">`, skip link,
  SeoHead (via `buildPageMetadata(routeId)`), header/footer, and the ONE nav-enhancement
  script all come from BaseLayout — the a11y/shell contract is preserved by construction.
  Only difference between the two: `kind:"service"` vs `kind:"article"` in the page object.
- **Props: `{ routeId, title, description, visibility, noindex? }`.** `visibility` is a required
  prop (not derived) because it gates the WebPage/Service/Article/BreadcrumbList nodes inside
  `buildEntityGraph` (INV-03); `noindex?` stays an optional passthrough so BaseLayout keeps
  deriving it from the registry unless a content record overrides (T15). `title`/`description`
  flow to BaseLayout→SeoHead AND into the graph's page node — one source, no drift.
- **`site = Astro.site?.href ?? "https://example.com"`.** `buildEntityGraph` takes the origin
  EXPLICITLY (T10 dropped env reads from the lib), so the layout is the wire-time origin owner.
  `Astro.site.href` yields a trailing slash; `toOrigin` inside the builder strips it. Placeholder
  fallback keeps render from throwing if config `site` is ever unset.
- **Type-only `import type { Visibility } from "../lib/publishing.ts"`** (verbatimModuleSyntax);
  `.ts`/`.astro` extensions on imports match the repo convention (BaseLayout imports `../lib/metadata.ts`).
- **PROBE GOTCHA — Astro ignores `_`-prefixed src/pages files.** The build-probe copies prod src
  to a temp root (C2-variant pattern) and drops throwaway fixture pages that render each layout,
  then asserts the shell contract on the built HTML (raw `astro build`, NOT the verifier, so the
  extra probe routes never trip the manifest). First attempt named them `_probe-*.astro` → Astro
  treats `_`-prefixed pages as PRIVATE and emits NO route, so the build was clean but produced no
  HTML (tests failed on "must exist", masking the real cause). Renamed to `probe-*.astro` → GREEN.
- **JSON-LD is safe against `assertOneNavScript`.** It counts only behavioral scripts and filters
  out `type="application/ld+json"` (shell.test.mjs:58-62). Probe parses the single ld+json block
  and asserts the graph carries both a `WebPage` node and the layout's kind node (`Service`/`Article`).
- **Full gate green:** check 0 errors/0 warnings (521 files) · shell.test.mjs isolated 26/26 (+2) ·
  build 5 pages · verify ok · full `npm test` 208/208 (no race this run). Layouts intentionally
  NOT wired into any page — pages land in T14/T15.

## [2026-07-25] Task: T13 — differentiated crawler robots policy

- **Verifier was NOT user-agent-aware (blocker, operator-authorized fix).** The
  T4 robots check (`scripts/verify-build.mjs`) used a single flat loop that
  flagged ANY `Disallow:` with `robots-has-disallow`. A differentiated policy
  MUST emit `Disallow: /` under named training crawlers, so it tripped the
  check. Fix: track `currentAgent` (set on every `user-agent` directive) and
  gate the error to `currentAgent === "*"`. Per-bot Disallow under a NAMED agent
  now passes — the intended search-vs-training differentiation. This does NOT
  weaken the `*` invariant; the wildcard block still may never Disallow.
- **Locked verifier tests survive the fix for free.** policy.test.mjs:836
  (`Disallow: /` under `User-agent: *`) still FAILS because its Disallow sits
  under `*`; :915 (commented) still passes. Added ONE new test: a named-agent
  `Disallow: /` under GPTBot now PASSES verifyBuild — covers the parser change.
- **renderRobots stays PURE and deterministic.** New sig
  `renderRobots(site, policy: CrawlerPolicy[])`. The `*` + `Sitemap:` header is
  unchanged and owned by the function (never from policy). Stanzas emit in array
  order: `User-agent:` then `Allow:` lines then `Disallow:` lines. `[header,
  ...stanzas].join("\n")` gives one blank line between blocks. No env, no Date.
- **Bot names live ONLY in `src/config/crawlers.ts`.** robots.txt.ts imports
  `CRAWLER_POLICY` — zero bot literals in the endpoint. `CrawlerPolicy` is a
  plain string-literal-keyed type (erasableSyntaxOnly-safe); `import type` used
  for the type-only import in discovery.ts (verbatimModuleSyntax).
- **INV — search permission ≠ training consent.** Allow group (OAI-SearchBot,
  Claude-SearchBot, PerplexityBot) and Disallow group (GPTBot, ClaudeBot,
  Google-Extended) are disjoint; a test asserts no search bot is Disallowed and
  no training bot is Allowed.
- **Full gate green:** check 0 errors (522 files) · full test 213/213 ·
  policy.test.mjs isolated 137/137 · build 5 pages · verify ok (PASSES despite
  named-agent Disallow lines — proves the parser fix).

## [2026-07-25] Task: T14 — case-studies hub + slug page + transparent self-project

- **The block was real; Option A resolved it via ONE registry-derived helper.**
  `resolveCollectionRoutes(recordsByCollection)` (src/lib/site-routes.ts) is the
  single source of the collection route inventory: for EVERY dynamic collection
  route in the registry it applies the INV-07 min-child gate — ≥1 PUBLIC record
  → emit the parent hub route + one slug-sorted child per public record; zero
  public → emit nothing. Fully generic (iterates `def.isDynamic && def.collection`,
  `pathFor(def.id,{slug})`, `def.parent`) — NO `/case-studies/`/`this-site`
  literals. Consumed by sitemap.xml.ts, [slug].astro (via isDiscoverable),
  SiteHeader, verify-build.mjs, and the shell.test.mjs manifest block → public
  canonical == sitemap == internal discovery == verifier-expected BY CONSTRUCTION.
- **The verifier/test are Node .mjs and can't call getCollection.** Added
  `scripts/collection-records.mjs` (`readCaseStudyRecords` = minimal frontmatter
  regex for slug+visibility, fail-closed to draft; `caseStudyRoutes` = reader ⊕
  resolveCollectionRoutes). Both verify-build.mjs (additive; T13's `currentAgent`
  robots parser untouched) and tests/shell.test.mjs import it, so the derivation
  is single-sourced. Astro-runtime consumers use getCollection instead — same
  pure helper, different record source.
- **DYNAMIC-ROUTE CANONICAL NEEDS PARAMS THREADED THROUGH THE WHOLE CHAIN.**
  `canonicalFor(id, params)` / `breadcrumbsFor(id, params)` already took params,
  but buildPageMetadata, buildEntityGraph, BaseLayout, CaseStudyLayout, AND
  **Breadcrumbs.astro** all dropped them. Missing the Breadcrumbs one is a SILENT
  trap: it built fine for the static hub but threw `pathFor: missing route param
  "slug"` at BUILD time for /case-studies/[slug]/ — the stack pointed at
  structured-data.mjs:25 which is actually the bundled **Breadcrumbs** component
  (`breadcrumbsFor(routeId)` with no params), NOT buildEntityGraph. Thread params
  as an OPTIONAL prop through ALL FIVE — additive, so metadata/structured-data
  unit tests (static routes, params undefined) stay green.
- **Hub `index.astro` cannot self-suppress emission (Astro static page).** So the
  min-child gate is enforced for DISCOVERY (sitemap/nav/verifier via the helper)
  and proven by the helper unit test (zero public → []). The physical hub html
  always emits; when the only entry is draft, `npm run verify` FAILS-CLOSED with
  `unexpected-route: /case-studies/` (an empty/orphaned hub cannot ship). The
  per-record child gate IS real (getStaticPaths filters isDiscoverable → no child
  route for draft/noindex).
- **Hub carries WebPage+BreadcrumbList, NOT Article.** A listing page is not an
  article — emitting Article would violate "structured data matches visible
  content". Built the hub on BaseLayout + JsonLd(buildEntityGraph, kind omitted)
  + Breadcrumbs. The ENTRY page uses CaseStudyLayout (kind:"article") →
  Article+BreadcrumbList, which is what the acceptance QA checks.
- **evidence is a SINGLE object, not an array.** PublicationRecordSchema has
  `evidence: EvidenceSchema.optional()` (a discriminatedUnion), so this-site.md
  frontmatter is `evidence:\n  kind: verified\n  sourceId: source-self-project-build-001`
  — an array would fail content-collection validation. (The brief's `[{...}]` was
  wrong vs the actual T6 schema; followed the schema.)
- **Making the hub navigable rippled further than routes.ts.** NavLabelKey union
  (+caseStudies), PageConfig.navLabelKey → NavLabelKey (site.ts), SettingsData
  navLabels.caseStudies (required; +2 policy.test.mjs validSettings fixtures),
  site.json label, and SiteHeader folding resolveCollectionRoutes into
  resolvedByPath (the hub is not a `pages` record, so resolveRoutes alone drops
  it). Updated route-registry.test.mjs's two nav assertions (order now
  about/services/case-studies@25/contact; hub now navigable) — reflecting new
  behavior, not weakening.
- **Full gate green:** check 0 errors (526 files) · test 220/220 (+12, no race) ·
  build 7 pages · verify ok · prod-origin build verify ok · ZERO example.com in
  dist · slug canonical + Article/BreadcrumbList @id at prod origin.

## T15 — services/about/contact on CommercialLayout
- **One `[page].astro` handler, NOT dedicated per-page files.** Creating `services.astro`
  etc. would COLLIDE with `[page].astro` generating the same route. Kept the single
  dynamic handler and narrowed its getStaticPaths to iterate `ROUTE_REGISTRY.all()`
  filtered to `kind==="singleton" && navPlacement==="primary"` (→ about/services/contact),
  joined to their `pages` entry, emitting a route only when `isRoutable`. This is the
  registry-ID-only narrowing: orphan content files and removed routes (/projects/) build
  nothing. Dropped `resolveRoutes`/`PAGES` in favor of direct registry iteration.
- **CommercialLayout parameterized with optional `kind` (default "service").** about/contact
  must be WebPage-only (a Service node on a non-service page violates "structured data
  matches visible content"). Passing `kind:"webpage"` → buildEntityGraph emits WebPage only;
  services keeps default "service" → WebPage+Service. Default preserves the T11 probe
  (routeId="services", no kind) with zero regression. This was the one strictly-required
  touch outside the listed scope, and it's additive/backward-compatible.
- **noindex meta MUST come from CONTENT visibility, not the registry default.** buildPageMetadata
  derives noindex from REGISTRY visibility (about/services/contact are registry-"public"),
  but the C2 copied-production variant rewrites about.md→noindex and asserts noindex,follow +
  sitemap exclusion. So pass `noindex={entry.data.visibility === "noindex"}` explicitly to
  CommercialLayout→BaseLayout. Also pass `visibility={entry.data.visibility}` so the graph
  page-node is public-gated on the real content visibility (INV-03).
- **Content md files unchanged.** PageSchema (pages collection) already carries
  title/description/visibility and would STRIP extra ServiceRecord fields; the Service
  semantics live in the kind:"service" JSON-LD node, not frontmatter. "as needed" → no change.
- **Breadcrumbs on a top-level page render a single `<span aria-current>` self-crumb** (home
  suppressed), no h1/no script — safe for the tight C2/C3/C4 one-h1 / one-nav-script asserts.
- **Spurious LSP staleness after edits.** The LSP tool flagged phantom errors in
  CaseStudyLayout/BaseLayout/SiteHeader (params/resolveCollectionRoutes "missing") that
  contradict the on-disk files AND a clean `npm run check`. `astro check` is authoritative;
  ignore stale LSP diagnostics on files you didn't touch.
- **Full gate green:** check 0 errors (526 files) · test 224/224 (+4 T15, no race) ·
  build 7 pages · verify ok. RED→GREEN: 3 JSON-LD-missing failures → all pass.

## T16 — proof-gated public homepage promotion
- **Pure gate + fs edge loader split.** `homepageProofGate(input)` (src/lib/home-proof.ts) is a
  pure discriminated-result function tested BOTH directions in-process; `resolveHomeVisibility()`
  is the edge that reads the real this-site.md frontmatter + sources.json + SELF_PROJECT_CLAIMS and
  runs the gate. The registry "home" visibility = `resolveHomeVisibility()` (config/routes.ts), so
  sitemap discovery + robots meta + JSON-LD WebPage node all flip from ONE gate result. Reused the T8
  `resolvePublicClaim` kernel for both the case-study evidence AND every homepage claim — not re-derived.
- **CRITICAL: path resolution must be process.cwd(), NOT import.meta.url.** Vite bundles
  config/routes.ts -> home-proof.ts, so at `astro build` time import.meta.url points at a build chunk,
  not src/lib/ — a relative content path silently fails the fs read -> gate denies -> home stayed
  noindex in dist even though the in-process test registry saw public. Symptom: `sitemap-missing:
  https://example.com/`. Fix: `${process.cwd()}/src/content/case-studies/this-site.md` (Astro build +
  Node test runner + copied-variant build all run with cwd = project root). Fail-closed try/catch ->
  undefined -> noindex.
- **node:fs in a type-checked .ts needs an ambient shim.** `declare module "node:fs"` INSIDE a module
  file is treated as augmentation (TS2664, no @types/node). Put the ambient module decl in the
  non-module src/env.d.ts (only `readFileSync` declared). `process` declared locally type-only.
- **SeoHead now emits robots ALWAYS** (`noindex ? "noindex,follow" : "index,follow"`) so the promoted
  homepage carries the literal `index,follow` (task requirement). Public pages gain an explicit
  index,follow directive (semantically identical to the prior implicit default); existing tests only
  assert ABSENCE of noindex, so no regression.
- **verifier + shell filters extended to gate "home-proof".** expectedHtmlRoutes and
  expectedDiscoverableRoutes in BOTH scripts/verify-build.mjs and tests/shell.test.mjs now include
  `gate === "home-proof"` (discoverableRoutes() already pre-filters public, so home only enters the
  discoverable set when the gate promoted it).
- **Two unit tests updated to new reality (not weakened):** metadata.test (home noindex->public
  derivation), route-registry.test (discoverableRoutes now includes "/"). shell.test root/ tests
  flipped from noindex-shell to public-homepage contract (index,follow + in sitemap + case-study link
  + Person/WebSite/WebPage JSON-LD).
- **Draft-flip QA proof:** this-site.md public->draft rebuild => home noindex + / excluded from
  sitemap; restore => index,follow + / present. Machine-executable, fail-closed.
- **Full gate green:** check 0 errors (528 files) · test 235/235 (+11) · build 7 pages · verify ok ·
  prod-origin (ryanjosebrosas.dev) build+verify ok · ZERO example.com in dist.

## Final-review fix pass (F1/F2 REJECT findings)

- **Stale LSP vs `astro check`**: The opencode LSP daemon reported phantom errors
  (`params` not on EntityGraphPage/PageMetadataOverrides; `resolveCollectionRoutes`
  missing) in CaseStudyLayout/BaseLayout/SiteHeader — files I never touched.
  `npm run check` (astro check) reported **0 errors across 531 files**. Trust
  `astro check`, not the LSP daemon, when they disagree — the daemon hadn't loaded
  the generated `.astro/types.d.ts`.
- **INV-12 origin guard is testable only as a pure fn**: Vite forces
  `NODE_ENV=production` in EVERY build incl `node --test`, so a real-release signal
  needs a dedicated `PRODUCTION_BUILD=true` env var. Extracted `resolveSiteOrigin(env)`
  to `src/lib/site-origin.ts`; astro.config.mjs imports it (it already imports .ts,
  e.g. markdown-safety). Pure fn → no child-process spawning to test the throw.
- **T6 public-evidence refine ripples into fixtures**: adding a `.superRefine`
  requiring verified evidence when `visibility:"public"` broke the existing
  `validCaseStudy` fixture (public, no evidence). Fix = add evidence to the fixture
  AND add fail/pass/draft-pass tests. `.merge().extend().superRefine()` returns a
  ZodEffects but still works as an Astro collection schema + `safeParse().data`.
- **T2 gate-without-impl**: `RouteGateId` type allows reserved gates
  (insights-hub/research-hub/privacy-required/llms-experiment) but only
  always/home-proof/case-studies-hub are wired. `validateRegistry` now rejects any
  gate outside an `IMPLEMENTED_GATES` set — this doubles as the INV-15 enforcement
  (no llms-experiment route can be registered).
- **T16 rendered==validated by construction**: instead of parsing prose, made
  `homepageClaims()` the single source index.astro renders, derived from
  `SELF_PROJECT_CLAIMS` filtered through `resolvePublicClaim`. Test asserts
  subset+resolvable+full-set-equivalence. Shell test anchors preserved (one h1
  "Ryan Brosas", "AI workflow systems for founder-led teams", /case-studies/this-site/ link).
- **Prod-verify harness gotcha**: `verify` reads SITE_ORIGIN too; a prod build with
  a real origin must be verified WITH the same SITE_ORIGIN or it reports spurious
  `sitemap-missing` (placeholder vs real-origin URL mismatch), not a real defect.

## [2026-07-25] F1 fix — reconcile RENDERED homepage claims with the validated set
- **F1's gap: helper-subset ≠ rendered-subset.** The T16 tests proved `homepageClaims()`
  returns a valid, evidence-resolvable subset — but index.astro ALSO rendered free prose
  ("reliable AI workflow systems … so repetitive work stops coming back to you") + a
  capability list, none of it in `SELF_PROJECT_CLAIMS`. Fix was to DELETE the unbacked
  prose, not to add claims (never invent evidence — the prose bends to the validated set).
- **Surgical two-file change.** (1) index.astro: neutralized `description` (dropped
  "reliable"/capability/outcome), REMOVED the standalone unbacked paragraph; kept the
  already-present evidence-backed connective + case-study link, the h1 identity, and the
  homepageClaims()-driven `<ul>`. (2) home-proof.test.mjs: new "T16/F1" describe reads the
  actual `src/pages/index.astro` source and FAILS if unbacked positioning is re-added
  (denylist /reliable/, outcome promise, "human handoffs" capability list) + asserts
  rendered==validated (each rendered statement ∈ SELF_PROJECT_CLAIMS).
- **CONSTRAINT: shell.test.mjs:211 REQUIRES `AI workflow systems for founder-led teams`
  in the built HTML.** That phrase is topic+audience NAMING (not a quality/outcome claim),
  lives in the hero `<p><strong>`, and MUST stay — it is acceptable neutral positioning per
  the F1 brief AND load-bearing for the shell test. Only "reliable"/outcome/capability prose
  was the violation.
- **Source-static test beats a 3rd concurrent build.** Reading index.astro text (no astro
  build) is deterministic, race-free, and "fails if someone re-adds unbacked prose" — exactly
  the brief's preferred fallback when a fresh dist read is impractical in `node --test`.
- **Full gate green:** check 0 errors (531 files) · test 262/262 (+3, no race) · build 7 pages ·
  verify ok · prod-origin (ryanjosebrosas.dev, PRODUCTION_BUILD=true) build 7 pages + verify ok ·
  ZERO example.com in dist. (Stale-LSP phantom errors on CaseStudyLayout/BaseLayout/SiteHeader
  persist — astro check is authoritative; ignore, per the T15/final-review note above.)
