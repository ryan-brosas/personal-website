# Plan: M2 Content and Route Contracts (Child 1 of Plan 03)

**Slug:** m2-content-route-contracts
**Created:** 2026-07-22
**Status:** In Progress
**Parent:** `m2-accessible-core-shell` (aggregate)
**Depends on:** M1 complete (`9fd70ce`)
**Blocks:** `m2-semantic-shell`

## Goal

Establish the content/route contracts that all later M2 children consume: page/settings
schemas, a single visibility-driven route pipeline, and a phase-aware verifier. No
production HTML pages are created -- ROUTES stays empty and the root build remains
unchanged until Child 2 activates the root shell.

## Non-goals

- No production HTML pages (Child 2).
- No brand tokens or CSS (brand child).
- No Contact security validation (Contact child).
- No Markdown body safety guard (core-pages child).

## Tasks (ordered)

### Task A1 -- Content and settings schemas

**Files (4-file cohesive exception):**
- `tests/policy.test.mjs`
- `src/lib/content-schemas.ts` (NEW: pure importable schemas)
- `src/content.config.ts` (consume schemas, narrow page loader to `.md`)
- `src/content/settings/site.json` (envelope `{"site": <SettingsData>}`)

**TDD:**
1. **RED** -- Write `content-schemas.ts` with intentionally permissive stubs
   (`PageSchema = z.object({}).passthrough()`, `SettingsDataSchema = z.any()`).
   Add tests: invalid page frontmatter (missing title) is rejected; partial settings
   (nav labels missing) is rejected; valid page/settings pass; settings file envelope
   `{"site": {...}}` resolves with entry ID `site`.
   Run: `node --test tests/policy.test.mjs`
   Expected: RED -- invalid records accepted by the stub.
2. **GREEN** -- Implement:
   - `PageSchema` extends `RecordBase` with `title: z.string().min(1)`,
     `description: z.string().min(1)`.
   - `SettingsDataSchema`: `siteTitle`, `navLabels` (object), optional all-or-none
     `contact: { schedulerUrl?, emailFallback?, privacyRequired? }`.
   - `content.config.ts` imports schemas from `content-schemas.ts` (no restatement);
     narrows `pages` loader to `pattern: "**/*.md"` (remove `.mdx`, `.json`).
   - `site.json` becomes `{"site": {"siteTitle": "...", "navLabels": {...}}}`.
   Run: `npm run check && npm test` -- both exit 0.

**Risk:** Settings file-loader treats top-level object keys as entry IDs. The
envelope must be `{"site": <SettingsData>}`; the schema validates inner `SettingsData`
only, not the outer `{"site": ...}` wrapper.

### Task A2 -- Single route-visibility pipeline

**Files (5-file cohesive exception):**
- `tests/policy.test.mjs`
- `src/config/site.ts` (NEW: page IDs, paths, nav order)
- `src/lib/routes.ts` (add ROOT_ROUTE type, keep ROUTES empty)
- `src/lib/site-routes.ts` (NEW: single resolver)
- `src/pages/sitemap.xml.ts` (consume resolver, not hardcoded ROUTES)

**TDD:**
1. **RED** -- Write `site-routes.ts` stub: `resolveRoutes = () => []`,
   `isRoutable`/`isDiscoverable` re-exported but resolver ignores visibility.
   Add tests: draft record returns a route (should return none); noindex record
   included in discoverable set (should be excluded); public record missing from
   routes (should be present).
   Run: `node --test tests/policy.test.mjs`
   Expected: RED -- visibility assertions fail.
2. **GREEN** -- Implement:
   - `src/config/site.ts`: page IDs (`about`, `services`, `contact`), route paths,
     navigation order. No `home` entry (root is code-owned).
   - `src/lib/site-routes.ts`: `resolveRoutes(collections)` returns
     `{path, visibility}[]` filtered by `isRoutable`; consumed by `getStaticPaths()`,
     sitemap, and verifier.
   - `src/lib/routes.ts`: add `ROOT_ROUTE = "/"` type constant; keep `ROUTES = []`
     (root activated in Child 2).
   - `src/pages/sitemap.xml.ts`: consume `resolveRoutes` instead of hardcoding
     `ROUTES.map(... public)`.
   Run: `npm run check && npm test && npm run build` -- all exit 0. M1 output unchanged
   (empty sitemap, no HTML routes).

**Risk:** The sitemap endpoint must not derive discoverability from `ROUTES` alone.
`resolveRoutes` must classify each route by its record's visibility.

### Task A3 -- Phase-aware output verifier

**Files:**
- `tests/policy.test.mjs`
- `scripts/verify-build.mjs`

**TDD:**
1. **RED** -- Write verifier stub: `verifyBuild = () => ({ ok: true, errors: [] })`.
   Add tests: missing expected sitemap URL passes (should fail); duplicate `<loc>`
   passes (should fail); unexpected `noindex` passes (should fail); unexpected
   `_astro/foo.js` asset passes (should fail); read-only snapshot passes.
   Run: `node --test tests/policy.test.mjs`
   Expected: RED -- failure-case tests assert `ok: false` but stub returns `ok: true`.
2. **GREEN** -- Implement:
   - Manifest gains: `expectedHtmlRoutes`, `expectedDiscoverableRoutes`,
     `expectedFileEndpoints`, `allowEmptySitemap`, `_astro` allowlist (extensions only).
   - Sitemap URL sets compared in both directions (no missing public route).
   - `_astro/` allowlist accepts only CSS/SVG/image extensions; rejects HTML/JS/unknown.
   - Read-only: only `existsSync`/`readFileSync`/`readdirSync`.
   - CLI entry: M1-compatible (empty HTML routes, `sitemap.xml` + `robots.txt` endpoints,
     `allowEmptySitemap: true`).
   Run: `npm run check && npm test && npm run build && npm run verify` -- all exit 0.

**Risk:** The `_astro/` allowlist must be narrow (extension-based) to avoid hiding
genuinely unexpected files while accepting valid hashed CSS/SVG/image output.

## Open Questions

None -- this child is fully unblocked by M1.

## Stop Conditions

- Task A1 must complete before A2 (shared `tests/policy.test.mjs` and schema imports).
- Task A2 must complete before A3 (verifier consumes the route pipeline).
- No production HTML route may be activated in this child (root stays empty).

## Next Command

```bash
printf '%s\n' 'm2-content-route-contracts' > .opencode/artifacts/.active
/ship m2-content-route-contracts
```
