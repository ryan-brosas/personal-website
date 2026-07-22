# Progress — m2-content-route-contracts

**Status:** complete
**Completed:** 2026-07-22
**HEAD:** `8cf77ab`

## Task Results

### A1 — Content and settings schemas
- **RED** `3273d34`: stub schemas (PageSchema passthrough, SettingsDataSchema z.any()) + 10 tests; 7 fail for right reasons.
- **GREEN** `cff5f6d`: real `RecordBase` (composes VisibilitySchema+EvidenceSchema+DateFieldsSchema), `PageSchema` (title/description required), `SettingsDataSchema` (siteTitle, navLabels, optional all-or-none contact block). `content.config.ts` imports shared schemas (no restatement), pages loader narrowed to `.md` only. Settings envelope `{"site": <SettingsData>}` with entry ID `site`.

### A2 — Single route-visibility pipeline
- **RED** `bf48f3d`: `config/site.ts` (page IDs/paths/navLabelKey), `routes.ts` (ROOT_ROUTE), `site-routes.ts` stub (ignores visibility) + 6 tests; 5 fail.
- **GREEN** `ad1684d`: `site-routes.ts` `resolveRoutes` filters by `isRoutable` (Object.hasOwn), skips missing records, includes public+noindex, excludes draft. Sitemap endpoint async, consumes `getCollection("pages")` + `resolveRoutes` instead of hardcoding ROUTES as public. ROUTES stays empty (root code-owned noindex, Child 2). M1 output unchanged.

### A3 — Phase-aware output verifier
- **RED** `0e84a15`: 7 verifier tests; 4 fail (bidirectional sitemap, duplicate loc, _astro allowlist).
- **GREEN** `f0dfb8a`: `verify-build.mjs` adds `ALLOWED_ASTRO_EXTENSIONS` (CSS/SVG/image/font), `_astro/` branch in unexpected-file check, duplicate `<loc>` detection, bidirectional sitemap (every expectedDiscoverableRoute must appear). 80/80 tests.

## Review History

- **Round 1** (3/5): 2 important findings — (1) glob loader default `generateId` lets frontmatter `slug` override filename-derived ID; (2) verifier trusts `expectedDiscoverableRoutes` independently of `expectedHtmlRoutes` (orphan sitemap URL without HTML passes). Both fixed in `1b0ca30`.
- **Round 2 re-review** (4/5): both findings resolved; 1 minor nit — slug-override fix lacked a loader-level regression test (prior review explicitly required one). Fixed in `8cf77ab` (real Astro fixture build proving `about.md` with `slug: bio` loads as ID `about`).

## Goal-Backward Verification

- **sc-1** (schemas validate/reject): `npm run check` 0 errors; `npm test` schema tests pass (invalid frontmatter and partial settings rejected). ✓
- **sc-2** (single resolver, three visibility states): `npm test` route-visibility tests pass (draft→no route, noindex→route+no discovery, public→route+discovery). ✓
- **sc-3** (phase-aware verifier, read-only, exits 0): `npm run verify` ok; verifier tests pass (rejects missing/duplicate/wrong-origin canonicals, leaks, unexpected routes, disallowed assets; read-only snapshot test passes). ✓

## Final Gate Evidence

- `npm run check`: 0 errors, 0 warnings, 4 hints (pre-existing docs/ brand `execCommand` deprecations).
- `npm test`: 82/82 pass.
- `npm run build`: 0 pages built; dist/ = sitemap.xml (empty urlset) + robots.txt only (M1 output unchanged).
- `npm run verify`: ok.

## Commits

`3273d34` `cff5f6d` `bf48f3d` `ad1684d` `0e84a15` `f0dfb8a` `1b0ca30` `8cf77ab`

## Deviations

- `astro/zod` import in `content-schemas.ts` is correct (Node-resolvable); only `astro:content` is runtime-only (kept in `content.config.ts`).
- `generateId` fix added after review: pages loader uses `({ entry }) => entry.replace(/\.[^.]+$/, "")` to always derive ID from filename, ignoring frontmatter slug that would break `site.ts` ID mapping.

## Discoveries

- Astro 5.18.2 `glob()` default `generateId` uses `data.slug` if present (runs before schema validation strips it). Custom `generateId` required for filename-derived IDs.
- `file()` loader treats top-level object keys as entry IDs; settings envelope `{"site": <SettingsData>}` gives entry ID `site`.
- `getCollection("pages")` on empty/missing collection warns but returns `[]` (non-blocking); sitemap endpoint made async to call it.
