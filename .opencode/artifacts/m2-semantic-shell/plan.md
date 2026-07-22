---
slug: m2-semantic-shell
status: planned
depends_on:
  - m2-content-route-contracts
---

# Plan: M2 Semantic Shell

## Must-haves

### Observable truths

1. `/` renders an identity-only, code-owned noindex page.
2. Root visibility drives page metadata, sitemap behavior, and navigation.
3. The shell provides standards-mode HTML, metadata, landmarks, and no-JS navigation.
4. Navigation never links to missing or draft pages.
5. `/404.html` is a noindex, self-canonical recovery page.
6. Every generated route and endpoint passes the read-only verifier.

### Required artifacts

| Path | Provides |
|---|---|
| `src/lib/routes.ts` | Code-owned root route policy |
| `src/pages/index.astro` | Minimal noindex homepage |
| `src/components/SeoHead.astro` | Canonical, robots, description, OG metadata |
| `src/layouts/BaseLayout.astro` | Shared document shell and landmarks |
| `src/components/SiteHeader.astro` | Visibility-safe no-JS navigation |
| `src/components/SiteFooter.astro` | Copyright and secondary navigation |
| `src/pages/404.astro` | Recoverable 404.html endpoint |
| `tests/shell.test.mjs` | Real-build semantic-shell contract |
| `src/pages/sitemap.xml.ts` | Root-policy discovery integration |
| `scripts/verify-build.mjs` | Phase-specific output contract |

### Key links

| From | To | Via | Failure prevented |
|---|---|---|---|
| `src/lib/routes.ts` | `src/pages/index.astro` | `ROOT_ROUTE_POLICY` | Drifted root metadata |
| `src/lib/routes.ts` | `src/pages/sitemap.xml.ts` | `ROOT_ROUTE_POLICY` visibility | Plan 04 promotion miss |
| `src/content/settings/site.json` | `src/components/SiteHeader.astro` | `getEntry("settings","site")` | Missing labels |
| `src/lib/site-routes.ts` | `src/components/SiteHeader.astro` | `resolveRoutes` filtering | Draft/absent nav links |
| `src/layouts/BaseLayout.astro` | `src/components/SeoHead.astro` | typed metadata props | Metadata duplication |
| `src/pages/404.astro` | `src/components/SeoHead.astro` | `canonicalPath="/404.html"` | `/404/` canonical |
| `tests/shell.test.mjs` | generated output | isolated real Astro build | Shared dist races |

## Goal

Ship the first semantic HTML surfaces: a minimal `noindex` `/`, a no-JavaScript shell, and a correctly canonicalized `/404.html`, while preserving the visibility and output contracts established by Child 1.

## Constraints

- No brand tokens, `global.css`, motion, favicon, or visual acceptance.
- No Home Markdown record.
- No About, Services, or Contact content/routes.
- No client-side JavaScript.
- `/` remains `noindex,follow` and absent from sitemap until Plan 04 promotes it (`docs/sitemap.md:43`).
- `/404.html` remains a slashless file endpoint (`docs/sitemap.md:25,66`).
- Browser keyboard/reflow/zoom/screen-reader acceptance remains owned by `m2-accessibility-acceptance`.
- All three 5-file cohesive slices were explicitly approved by the user; none exceeds the hard five-file split threshold.

## Pre-execution Planning Sync

Before `/ship`, persist this plan and synchronize:

- `spec.md`: replace unsafe shared-root build wording with the isolated repo-local `--outDir` contract; add centralized root policy, basic OG metadata, footer requirements, exact 404 recovery text, and close handoff.
- `prd.json`: replace the current B1/B2/B3 file allocations and RED wording with the slices below.

The parent ledger remains `semantic-shell: active` until confirmed child close.

## Dependency Graph

```text
B1 Root policy + direct root + discovery/verifier activation
  ↓
B2 SeoHead/BaseLayout extraction + visibility-safe header
  ↓
B3 Footer + recoverable 404
  ↓
Full gate → UI Quality Gate → review → confirmed child close
```

No parallel execution: all tasks extend `tests/shell.test.mjs`; B2 refactors B1 output, and B3 extends B2's layout.

## Wave 1 — B1: Atomic Root Policy and Shell

**Files — approved cohesive 5-file slice:**

- `tests/shell.test.mjs`
- `src/lib/routes.ts`
- `src/pages/sitemap.xml.ts`
- `scripts/verify-build.mjs`
- `src/pages/index.astro`

```yaml
needs: m2-content-route-contracts complete
creates: root policy, / output, root sitemap wiring, shell test harness
has_checkpoint: false
```

### RED

Create `tests/shell.test.mjs` only.

The test must:

1. Create a unique ignored parent `node_modules/.shell-test-XXXX/`.
2. Use `<temp-parent>/dist` as the absolute `--outDir`.
3. Assert `path.relative(repoRoot, distDir)` is neither absolute nor prefixed by `..`.
4. Run the real project build with Astro's binary and `--outDir`.
5. Call `verifyBuild()` with `expectedHtmlRoutes: ["/"]`, `expectedDiscoverableRoutes: []`, `expectedFileEndpoints: ["sitemap.xml", "robots.txt"]`, `allowEmptySitemap: true`.
6. Fail on the exact current error `missing-route: /`.
7. Clean only its owned temporary parent in `after`/`finally`.

```bash
node --test --test-name-pattern="B1 root shell" tests/shell.test.mjs
```

Expected: assertion failure for `missing-route: /`, not `ENOENT`, syntax failure, or shared `dist` mutation.

RED commit: `test(m2): define root noindex shell contract`

### GREEN

1. Add `ROOT_ROUTE_POLICY` to `src/lib/routes.ts`: `path: "/"`, `visibility: "noindex"`. Preserve existing `ROOT_ROUTE`, `canonicalHref`, and endpoint classification APIs.
2. Include `ROOT_ROUTE_POLICY` in `src/pages/sitemap.xml.ts` alongside content-derived routes. `renderSitemap()` excludes it while it remains `noindex`; Plan 04 can later promote the same policy to `public`.
3. Implement `src/pages/index.astro` directly as a complete standards-mode document: `<!doctype html>`, `<html lang="en">`, charset, zoom-safe viewport, title, description, one canonical `https://example.com/`, `<meta name="robots" content="noindex,follow">`, basic OG (title, description, type, url), "Skip to content" link, `<main id="main">`, exactly one H1, approved identity copy only (`Ryan Brosas`, `Agent Systems Builder`, `I build agent systems so repetitive work stops coming back to you.`), no `<script>`.
4. Update the verifier CLI manifest: `expectedHtmlRoutes: ["/"]`, `expectedDiscoverableRoutes: []`, endpoints remain sitemap/robots, `allowEmptySitemap: true`.

### Verification

```bash
node --test --test-name-pattern="B1 root shell" tests/shell.test.mjs
npm run check && npm test && npm run build && npm run verify
```

Expected: isolated shell build passes; normal root build emits `/`; `/` is absent from sitemap; verifier accepts the new inventory; no client script or Home content record.

GREEN commit: `feat(m2): add atomic root noindex shell`

## Wave 2 — B2: Shared Head, Layout, and No-JS Header

**Files — approved cohesive 5-file slice:**

- `tests/shell.test.mjs`
- `src/components/SeoHead.astro`
- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/pages/index.astro`

```yaml
needs: B1
creates: reusable metadata/layout API and visibility-safe navigation
has_checkpoint: false
```

### RED

Extend `tests/shell.test.mjs` against B1 output. Expected failing assertions: no `<header>`, no `<nav aria-label="Primary">`, no root link with `aria-current="page"`, no applicable visible-focus CSS. The test must not fail due to a missing build file.

```bash
node --test --test-name-pattern="B2 shared shell" tests/shell.test.mjs
```

RED commit: `test(m2): define shared no-JS shell contract`

### GREEN

1. Extract metadata into `SeoHead.astro` with typed props: `title`, `description`, `canonicalPath?`, `noindex`; canonical always through `canonicalHref()`; exact robots `noindex,follow`; basic OG metadata.
2. Create `BaseLayout.astro`: typed props forwarded to `SeoHead`; standards-mode document; skip link; `SiteHeader`; one `<main id="main"><slot /></main>`; structural styles only.
3. Implement `SiteHeader.astro`: fail the build if `getEntry("settings","site")` is missing; load `pages` with `getCollection()`; construct the page visibility map; call `resolveRoutes()`; join resolved paths to `PAGES` in `NAV_ORDER`; use settings-provided labels; prepend the code-owned root link; render exactly one `<nav aria-label="Primary">`; mark exactly one current item when applicable; do not emit links to absent/draft routes; no JS toggle or duplicate mobile navigation.
4. Refactor `index.astro` to use `BaseLayout` while preserving B1's metadata, identity copy, root policy, and noindex behavior.
5. Structural CSS: component-local rules or `:global(:focus-visible)` where rules cross component boundaries; non-`none`, nonzero outline and nonzero outline offset; wrapping/fluid layout rules; no brand tokens or motion.
6. CSS test: collect inline `<style>` content; follow any emitted stylesheet links and read those files; do not require `_astro/` (Astro may inline small styles); assert an applicable visible-focus rule.

### Verification

```bash
node --test --test-name-pattern="B2 shared shell" tests/shell.test.mjs
npm run check && npm test && npm run build && npm run verify
```

Expected: root output behavior unchanged; navigation contains only the root link while no page records exist; root link has `aria-current="page"`; no links to `/about/`, `/services/`, or `/contact/`; one nav tree, no script; visible-focus CSS contract passes.

GREEN commit: `feat(m2): extract shared no-JS semantic shell`

## Wave 3 — B3: Footer and Recoverable 404

**Files — approved cohesive 5-file slice:**

- `tests/shell.test.mjs`
- `scripts/verify-build.mjs`
- `src/components/SiteFooter.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/404.astro`

```yaml
needs: B2
creates: shared footer and verified 404.html endpoint
has_checkpoint: false
```

### RED

Extend `tests/shell.test.mjs` to assert: footer copyright present; footer has a secondary Home link; `dist/404.html` exists before reading it; 404 canonical equals `https://example.com/404.html`; exact robots `noindex,follow`; main contains an H1 `Page not found`; `<main id="main">` contains a link with `href="/"` and text `Return to the home page`; the 404 header has no `aria-current="page"` item.

```bash
node --test --test-name-pattern="B3 footer and 404" tests/shell.test.mjs
```

Expected: assertion failures for missing footer and `missing-endpoint: 404.html`, never raw `ENOENT`.

RED commit: `test(m2): define footer and recoverable 404 contract`

### GREEN

1. Create `SiteFooter.astro`: copyright text `© Ryan Brosas`; secondary `<nav aria-label="Footer">`; normal Home link; no inactive or privacy links.
2. Integrate `SiteFooter` into `BaseLayout`.
3. Create `404.astro`: use `BaseLayout`; `canonicalPath="/404.html"`; `noindex`; title and utility description; H1 `Page not found`; recovery link inside main `Return to the home page`; no current navigation item.
4. Update verifier CLI endpoints to include `404.html`.

### Verification

```bash
node --test --test-name-pattern="B3 footer and 404" tests/shell.test.mjs
npm run check && npm test && npm run build && npm run verify
```

Expected output inventory: `/`, `sitemap.xml`, `robots.txt`, `404.html`, optional allowed `_astro` CSS only.

GREEN commit: `feat(m2): add shared footer and recoverable 404`

## Final Verification

```bash
npm ci
npm run check
npm test
npm run build
npm run verify
```

Required evidence: zero type/check errors; every test passes; root is `noindex,follow`, canonical, and sitemap-excluded; 404 is `noindex,follow` and canonical to `/404.html`; no client script; no inactive page links; verifier remains read-only; UI Quality Gate runs because `*.astro` is now detected at `.opencode/command/ship.md:273`.

## Close Handoff

After clean review and user confirmation:

1. Create `.opencode/artifacts/m2-semantic-shell/progress.md`.
2. Mark the child PRD complete.
3. Update the parent `m2-accessible-core-shell` ledger: `m2-semantic-shell` → complete; `m2-core-pages` → next-active only if its copy/safety gates are ready; otherwise leave pending.
4. Update `.opencode/state.md`.
5. Commit and push the scoped close files.

## Risks and Failure Behavior

- Missing settings entry: fail the build; do not duplicate labels in code.
- Missing `Astro.site`: fail the build; do not emit relative canonicals.
- Unsafe test outDir: fail before spawning Astro.
- Missing/duplicate/wrong canonical: fail the test and verifier.
- Draft/absent navigation target: omit the link.
- CSS inlining: test both inline and linked stylesheets.
- Browser acceptance unavailable: does not block this structural child, but parent M2 remains open until `m2-accessibility-acceptance`.

## Privacy and Security

- No credentials, analytics, customer data, forms, scheduler data, or private approval records.
- No client script or runtime CMS.
- No unapproved claims or substantive page copy.
- `noindex` pages remain crawlable; robots.txt must not disallow them.

## Open Questions

None.

## Plan Report

- Discovery Level: 3 — Deep
- Observable truths: 6
- Required artifacts: 10
- Key links: 7
- Tasks: 3
- Execution waves: 3 sequential
- Unique implementation/test files: 10
- Context budget: approximately 45–50%
- Effort: L (1–2 days)
- Constitutional compliance: PASS by inspection — no task exceeds five files; all three cohesive exceptions explicitly approved; no new dependencies; no implementation checkpoints; RED precedes GREEN; every GREEN runs the full gate.
