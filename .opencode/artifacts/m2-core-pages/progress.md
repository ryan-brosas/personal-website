# M2 Core Pages — Execution Progress

**Slug:** m2-core-pages
**Parent:** m2-accessible-core-shell (aggregate)
**Status:** complete
**Completed:** 2026-07-22
**HEAD:** 333c074

## Goal

Safely publish substantive About and Work With Me pages through the existing visibility-aware Astro shell, with a Markdown body safety guard landing before any public content.

## Tasks

### C1 — Markdown body safety guard

- **RED** (`f5f24cc`): no-op stub `src/lib/markdown-safety.ts`; 14 C1 tests in `tests/policy.test.mjs` (8 fail: raw-html, event-handler on*, javascript:/data: protocol unit cases + production-chain unsafe-build-must-fail; 6 pass: safe controls + safe production build). Fixture at `tests/fixtures/markdown-safety/`.
- **GREEN** (`aa7a4c8`): dependency-free recursive HAST guard — throws on `raw` nodes (`markdown-safety: raw-html`), `on*` properties (`markdown-safety: event-handler`), `javascript:`/`data:` in href/src/xlinkHref (`markdown-safety: unsafe-protocol`); `assertMarkdownRendered(entry)` throws `markdown-safety: render-failed` when `entry.rendered.html` is not a string. Registered in root `astro.config.mjs` via `markdown.rehypePlugins`. `allowDangerousHtml` stays default true (false silently strips).
- **Production-chain fixture**: copies fixture to temp root, writes temp `content.config.ts` importing real `PageSchema`, builds via `astro build --root <temp> --config ../../../astro.config.mjs` (root production config). Two-layer defense: guard throws during glob render → glob catches → rendered:undefined → probe's `assertMarkdownRendered` throws → build fails.

### C2 — Dynamic route and About activation

- **Cycle 1 RED** (`9bd8729`): C2 test block expecting `/about/` routable+noindex. Failed: `missing-route: /about/`.
- **Cycle 1 GREEN** (`6a1ed8c`): created `src/pages/[page].astro` — `getStaticPaths` uses `getCollection`, `assertMarkdownRendered` on every entry, `resolveRoutes`, joins through `PAGES`, validates one-segment path, renders `<Content/>` in `BaseLayout` with `noindex={route.visibility==="noindex"}` (derived, not hardcoded). `about.md` as noindex. Inherited manifests updated to `['/', '/about/']`.
- **Cycle 2 RED** (`4c057ba`): changed C2 to public assertions + added permanent copied-production noindex variant (copies src+configs, rewrites copied about to noindex, builds, asserts route+noindex+no sitemap+nav). Failed: about still noindex.
- **Cycle 2 GREEN** (`8085633`): about.md → public. Manifests updated to discoverable `['/about/']` + `allowEmptySitemap:false`. Noindex variant retained permanently.

### C3 — Services activation

- **RED** (`a5dae28`): C3 test block expecting `/services/` public+Work With Me label. Failed: `missing-route: /services/`.
- **GREEN** (`7850a64`): created `services.md` (public, Work With Me copy). All manifests updated to `['/', '/about/', '/services/']` + discoverable `['/about/', '/services/']`. Noindex variant updated to assert services stays public.

## Review History

### Round 1 (4/5, fix-then-close)

- **P2 finding:** C2/C3 tests checked route presence + href but not the rendered h1, body paragraph, exact nav label, or `aria-current` on dynamic pages. A blank or mislabeled page could regress silently.
- **Fix** (`333c074`): added assertions to C2/C3 for: exactly one h1 with approved title, approved body paragraph renders (proves `<Content/>` wired), exact settings-derived nav label (About / Work With Me), `aria-current="page"` on the corresponding anchor.
- All 106/106 tests pass after fix.

## Goal-Backward Verification

- **SC-1 (markdown safety):** unsafe Markdown fails build; safe Markdown builds. Unit + production-chain fixture tests pass.
- **SC-2 (about public+wired):** `/about/` canonical `https://example.com/about/`, no noindex, in sitemap, in nav with "About" label, `aria-current=page` on `/about/`, h1 "About Ryan Brosas", body paragraph renders.
- **SC-3 (services public+wired):** `/services/` canonical `https://example.com/services/`, no noindex, in sitemap, in nav with "Work With Me" label, `aria-current=page` on `/services/`, h1 "Work With Me", body paragraph renders.
- **10 required artifacts:** all exist.
- **Key links verified:** markdown guard registered in production config; `assertMarkdownRendered` wired in `[page].astro`; getStaticPaths constrained through PAGES+resolveRoutes (unknown public record → no route); copied-noindex variant proves noindex behavior through real dynamic route.

## Final Gate Evidence

- `npm run check`: 0 errors, 0 warnings, 5 hints (pre-existing docs/ brand deprecations)
- `npm test`: 106/106 pass, 0 fail
- `npm run build`: 4 pages (/, /about/, /services/, /404.html)
- `npm run verify`: ok
- dist/: index.html, about/, services/, 404.html, sitemap.xml, robots.txt
- sitemap: about + services (root excluded — noindex)

## Commits

- `df1fd6d` plan + pre-execution sync
- `f5f24cc` C1 RED
- `aa7a4c8` C1 GREEN
- `9bd8729` C2c1 RED
- `6a1ed8c` C2c1 GREEN
- `4c057ba` C2c2 RED
- `8085633` C2c2 GREEN
- `a5dae28` C3 RED
- `7850a64` C3 GREEN
- `333c074` review fix (full visible-page contract)

## Privacy and Security

- No raw HTML, event-handler properties, `javascript:`, or `data:` URLs survive the Markdown pipeline.
- No new dependency or transitive-package import.
- No credentials, customer data, analytics, client names, metrics, testimonials, or evidence claims.
- `src/data/sources.json` unchanged.
- Content is static; no runtime CMS or JavaScript.

## Deviations

- None. All tasks followed the approved plan. Copy is honest positioning only (user waiver: "approved I can just rewrite that later").

## Discoveries

- Astro 5.18.2 glob loader catches renderer exceptions and stores `rendered: undefined` — `assertMarkdownRendered` converts this to a fatal build failure.
- Custom rehype plugins run BEFORE `rehypeRaw`, so the guard sees `raw` nodes and can reject them before parsing.
- `allowDangerousHtml: false` silently strips raw HTML instead of failing the build — keeping the default `true` and throwing on `raw` nodes is the correct fail-build approach.
