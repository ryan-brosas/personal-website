# Progress — m2-semantic-shell

## Execution Record

**Slug:** m2-semantic-shell
**Parent:** m2-accessible-core-shell (aggregate)
**Status:** complete
**Completed:** 2026-07-22
**Base SHA:** `afe08ce` (pre-ship)
**Head SHA:** `1d3e65a` (after review fixes; pre-close)

## Commits

| Commit | Type | Description |
|---|---|---|
| `c9684a9` | docs | Persist semantic-shell plan and sync spec/prd to corrected B1/B2/B3 |
| `e2546c8` | test | B1 RED — define root noindex shell contract |
| `2d5aa53` | feat | B1 GREEN — add atomic root noindex shell |
| `0f060fe` | test | B2 RED — define shared no-JS shell contract |
| `494f92e` | feat | B2 GREEN — extract shared no-JS semantic shell |
| `59c2309` | test | B3 RED — define footer and recoverable 404 contract |
| `16207c1` | feat | B3 GREEN — add shared footer and recoverable 404 |
| `1d3e65a` | fix | Centralize root metadata in ROOT_ROUTE_POLICY and harden tests |

## Task Results

| Task | Status | Commit | Files |
|---|---|---|---|
| b1 Atomic root noindex shell | [x] | RED `e2546c8` / GREEN `2d5aa53` | tests/shell.test.mjs, src/lib/routes.ts, src/pages/sitemap.xml.ts, scripts/verify-build.mjs, src/pages/index.astro |
| b2 Shared no-JS head, layout, header | [x] | RED `0f060fe` / GREEN `494f92e` | tests/shell.test.mjs, src/components/SeoHead.astro, src/layouts/BaseLayout.astro, src/components/SiteHeader.astro, src/pages/index.astro |
| b3 Shared footer and recoverable 404 | [x] | RED `59c2309` / GREEN `16207c1` | tests/shell.test.mjs, scripts/verify-build.mjs, src/components/SiteFooter.astro, src/layouts/BaseLayout.astro, src/pages/404.astro |

## Deviations

- B1 file allocation differed from the original `/create` PRD: the corrected `/plan`
  centralized `ROOT_ROUTE_POLICY` in `src/lib/routes.ts` (B1) rather than creating
  `SeoHead`/`BaseLayout` in B1. B2 then extracted those as a refactor preserving B1
  behavior. This kept each task at ≤5 files and made root visibility atomic across
  metadata, sitemap, and the later Plan 04 promotion. Recorded in the pre-execution
  planning sync (`c9684a9`).
- B3 amended its GREEN commit (`16207c1`) to include a B1-test manifest fix (B1
  verifier expected `404.html` once B3 added it, since the isolated root build emits
  every route). The B1 test asserts root output but the build always emits all
  routes, so the manifest must match reality.

## Discoveries

- Astro 5.18.2 redirects an outDir outside cwd through root `.astro`, copies it,
  then removes it (`node_modules/astro/dist/core/build/common.js:75-80`,
  `static-build.js:284-290`). The shell test therefore builds into a unique
  repo-local ignored parent `node_modules/.shell-test-XXXX/dist`, never the shared
  `dist/` (races `npm run build`) or an external `/tmp` (Astro cache hazard).
- Astro inlines CSS under 4096 bytes (`inlineStylesheets: auto`), so the B2 focus
  CSS test collects inline `<style>` plus any linked `_astro/*.css` rather than
  requiring a `_astro/` file.
- `src/pages/404.astro` is internally route `/404` under `trailingSlash: "always"`
  but emits `404.html` (special-cased). The `canonicalPath="/404.html"` override on
  `SeoHead`/`BaseLayout` is required; the default `new URL(Astro.url.pathname,
  Astro.site)` would yield `/404/`.

## Review History

### Round 1 — `1d3e65a` (fix base `16207c1`)

Score: 3.5/5, fix-then-close. Findings:

1. **(architecture/important)** `src/pages/index.astro` hardcoded `noindex` instead
   of deriving from `ROOT_ROUTE_POLICY` → Plan 04 promotion would update sitemap but
   not page robots meta (atomic promotion broken).
2. **(test/minor)** sitemap exclusion test used substring match
   `!sitemap.includes("https://example.com/")` → false-positive once `/about/`
   exists.
3. **(test/minor)** focus CSS test checked outline/outline-offset independently
   anywhere in CSS → would pass `:focus-visible { outline: none }` next to an
   unrelated nonzero outline.

### Fix commit `1d3e65a`

- Finding 1: `index.astro` now imports `ROOT_ROUTE_POLICY`, derives
  `noindex = ROOT_ROUTE_POLICY.visibility === "noindex"`, and passes
  `canonicalPath={ROOT_ROUTE_POLICY.path}`. Plan 04 flips the policy → sitemap +
  page metadata update atomically.
- Finding 2: sitemap test parses `<loc>` URLs and asserts the exact root canonical
  `https://example.com/` is not among them.
- Finding 3: focus CSS test finds all `:focus-visible` rule blocks and asserts at
  least one has non-none/nonzero outline AND nonzero offset within the SAME rule.

### Round 2 (re-review)

Score: 5/5, no findings, nextAction=close. All three prior findings resolved; no
new issues. `npm run check`, `npm test` (88/88), `npm run build`, `npm run verify`
all exit 0.

## Goal-Backward Verification

### Success criteria

- **SC-1 Atomic root shell:** `dist/index.html` has exactly one canonical
  `https://example.com/`, `noindex,follow`, one `<h1>Ryan Brosas</h1>`, skip link to
  `#main`, `<main id="main">`, no script; `/` excluded from sitemap. EXISTS +
  SUBSTANTIVE + WIRED (`ROOT_ROUTE_POLICY` → `sitemap.xml.ts` + `index.astro`).
- **SC-2 No-JS navigation:** built `dist/index.html` has one
  `<nav aria-label="Primary">` with only the root link (zero page records in M2),
  `aria-current="page"` on the root link, no links to `/about/` `/services/`
  `/contact/`, a footer, no script, applicable `:focus-visible` CSS. EXISTS +
  SUBSTANTIVE + WIRED (`getEntry("settings","site")` → `resolveRoutes` → nav).
- **SC-3 Recoverable 404:** `dist/404.html` has exactly one canonical
  `https://example.com/404.html`, `noindex,follow`, `<h1>Page not found</h1>`,
  recovery link `Return to the home page` to `/` inside `main#main`; 404 header
  has no `aria-current="page"`. EXISTS + SUBSTANTIVE + WIRED (`canonicalPath`
  override + `404.html` verifier endpoint).

### Required artifacts (10/10)

| Path | Exists | Substantive | Wired |
|---|---|---|---|
| `src/lib/routes.ts` | yes | ROOT_ROUTE_POLICY | sitemap.xml.ts + index.astro |
| `src/pages/index.astro` | yes | identity copy + noindex | BaseLayout |
| `src/components/SeoHead.astro` | yes | typed props + canonicalHref | BaseLayout |
| `src/layouts/BaseLayout.astro` | yes | doc shell + focus CSS | index.astro + 404.astro |
| `src/components/SiteHeader.astro` | yes | getEntry + resolveRoutes + nav | BaseLayout |
| `src/components/SiteFooter.astro` | yes | copyright + footer nav | BaseLayout |
| `src/pages/404.astro` | yes | canonicalPath + recovery link | BaseLayout |
| `tests/shell.test.mjs` | yes | B1/B2/B3 describe blocks | isolated build harness |
| `src/pages/sitemap.xml.ts` | yes | ROOT_ROUTE_POLICY prepend | renderSitemap |
| `scripts/verify-build.mjs` | yes | manifest expects / + 404.html | CLI |

### Key links (7/7)

| From → To | Via | Verified |
|---|---|---|
| routes.ts → index.astro | ROOT_ROUTE_POLICY | yes (noindex + canonicalPath derived) |
| routes.ts → sitemap.xml.ts | ROOT_ROUTE_POLICY visibility | yes (prepended, excluded while noindex) |
| settings/site.json → SiteHeader | getEntry("settings","site") | yes (throw if missing) |
| site-routes.ts → SiteHeader | resolveRoutes filtering | yes (no draft/absent links) |
| BaseLayout → SeoHead | typed metadata props | yes |
| 404.astro → SeoHead | canonicalPath="/404.html" | yes (built canonical /404.html) |
| shell.test.mjs → output | isolated Astro build | yes (repo-local ignored outDir) |

### Stub detection

No stubs: no `return null`, `TODO`, `FIXME`, empty handlers, or static responses.

## Final Gate Evidence

```
npm run check   → 0 errors, 0 warnings, 4 hints (pre-existing docs/ brand deprecations)
npm test        → 88/88 pass
npm run build   → 2 pages (/ + 404.html), exit 0
npm run verify  → ok
```

dist/ inventory: `index.html`, `sitemap.xml`, `robots.txt`, `404.html`.

## Privacy and Security

No credentials, analytics, forms, scheduler data, or private approval records. No
client script. No unapproved claims — only locked identity copy
(`DESIGN.md:478-481`, `ryan-brosas-landing-page.html:6-7`). `noindex` pages stay
crawlable; robots.txt has no Disallow.

## Next Child

`m2-core-pages` — gated by copy approval + markdown body safety. Do not proceed
without user go-ahead.
