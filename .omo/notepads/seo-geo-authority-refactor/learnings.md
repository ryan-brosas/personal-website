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
