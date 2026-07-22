# M2 Semantic Shell (Child 2 of Plan 03)

**Slug:** m2-semantic-shell
**Created:** 2026-07-22
**Status:** In Progress (artifact created; ready for `/plan` then `/ship`)
**Parent:** `m2-accessible-core-shell` (aggregate)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:313-331`

## Slug Metadata

```yaml
depends_on: ["m2-content-route-contracts"]
parallel: false
conflicts_with: []
blocks: ["m2-core-pages", "m2-contact-page", "m2-brand-shell", "m2-accessibility-acceptance"]
estimated_hours: 4
```

---

## Problem Statement

Child 1 established content/route contracts but rendered no HTML — `ROUTES` is empty
and the verifier CLI expects zero HTML routes. This child builds the accessible
semantic shell that all later M2 children render into: an atomic code-owned
`noindex` root (`/`), a no-JavaScript header/footer with settings-driven navigation
filtered through the visibility resolver, and a recoverable 404 page. It consumes
Child 1's `resolveRoutes`, `SettingsDataSchema`, `canonicalHref`, and the phase-aware
verifier, and activates the first production HTML route (`/`) and the `404.html`
file endpoint atomically with verifier expectations. No brand tokens, motion, client
scripts, favicon, or substantive page copy — those are gated to later children.

---

## Scope

**In scope:**

1. **Atomic root shell** (`/`): `src/pages/index.astro` renders code-owned approved
   identity copy only, `noindex`, exactly one `<h1>`, canonical, skip link, and
   landmarks. Activates `/` as `expectedHtmlRoutes: ["/"]`, `expectedDiscoverableRoutes:
   []`, `allowEmptySitemap: true`. No Home Markdown record is consumed.
2. **SeoHead + BaseLayout**: typed props (`title`, `description`, `canonicalPath?`,
   `noindex`); `<slot />`; canonical via `canonicalHref(canonicalPath ?? Astro.url.pathname,
   Astro.site.href)`. The `canonicalPath` override enables the 404 file-endpoint
   canonical (`/404.html`) under `trailingSlash: "always"`, which would otherwise
   produce `/404/`.
3. **No-JS header/footer**: one always-visible responsive `<nav aria-label="Primary">`
   tree (no `<details>`/JS toggle); `getEntry("settings", "site")` for labels (missing
   record fails the build, no silent fallback); `getCollection("pages")` -> visibility
   map -> `resolveRoutes` -> filter by `NAV_ORDER` -> prepend `ROOT_ROUTE` link;
   `aria-current="page"` on the current route; visible `:focus-visible`; structural
   CSS in component `<style>` blocks only (no brand tokens, no `global.css`).
4. **Recoverable 404**: `src/pages/404.astro` passes `canonicalPath="/404.html"`,
   renders `noindex`, "Page not found" `<h1>`, and a normal recovery link to `/`.
   Activates `404.html` in `expectedFileEndpoints`.
5. **Verifier CLI manifests**: B1 updates the CLI to expect `/`; B3 adds `404.html`
   to `expectedFileEndpoints`. Each route/endpoint activates atomically with its
   page file so every GREEN boundary passes the full gate.
6. **Structural accessibility only**: skip link, landmarks, one nav tree, no client
   script, `noindex`/canonical metadata, focus CSS. Browser evidence (keyboard path,
   reflow, 200% zoom, reduced-motion, screen-reader smoke) is deferred to
   `m2-accessibility-acceptance`.

**Non-goals:**

- No brand tokens, `global.css`, motion, or favicon (brand-shell child, gated by P02B).
- No About/Services/Contact page content (core-pages/contact children, gated by copy
  approval).
- No browser accessibility evidence (accessibility-acceptance child).
- No Markdown body safety guard (core-pages child).
- No Home Markdown record consumed (`/` is code-owned identity copy only).
- No modification of `src/config/site.ts` (Child 1 owns page IDs/paths/order; B2 reads
  but does not modify it).

---

## Success Criteria

1. **Atomic root shell:** `/` renders exactly one self-canonical
   `https://example.com/`, `noindex` meta, one `<h1>` with approved identity copy, a
   skip link to `#main`, and landmarks; no client script. Verify: `npm run build &&
   npm run verify` exit 0; `tests/shell.test.mjs` asserts built `dist/index.html`.
2. **No-JS navigation:** header renders one always-visible `<nav>` filtered by
   `resolveRoutes` (no links to absent or draft routes), `aria-current="page"` on `/`,
   settings-driven labels, footer present, no client script. Verify: `npm test`;
   `tests/shell.test.mjs` asserts built HTML.
3. **Recoverable 404:** `dist/404.html` has exactly one canonical
   `https://example.com/404.html`, `noindex`, "Page not found" `<h1>`, and a recovery
   link to `/`. Verify: `npm run build && npm run verify` exit 0; `tests/shell.test.mjs`
   asserts.

---

## Technical Context

- **Child 1 APIs consumed:**
  - `resolveRoutes(pageVisibilities)` -> `ResolvedRoute[]` (`src/lib/site-routes.ts:24-34`);
    filters by `isRoutable` (public/noindex), skips missing/draft.
  - `SettingsDataSchema` (`src/lib/content-schemas.ts:34-48`): `siteTitle`, `navLabels`
    `{about, services, contact}`, optional `contact` block. Settings envelope
    `{"site": <SettingsData>}`, entry ID `site` (`src/content/settings/site.json`).
  - `canonicalHref(path, site)` (`src/lib/routes.ts:28-37`): HTML routes get trailing `/`,
    file endpoints stay slashless. `ROOT_ROUTE="/"` (`src/lib/routes.ts:11-13`).
  - `PAGES` + `NAV_ORDER` (`src/config/site.ts:16-23`): about/services/contact, order
    `[about, services, contact]`; no home entry.
  - `verifyBuild(manifest)` (`scripts/verify-build.mjs:60-68`): manifest supports
    noindex-as-routable-but-not-discoverable; CLI default (`:226-235`) still expects
    `[]` html routes + `[sitemap.xml, robots.txt]`, `allowEmptySitemap: true`.
- **404 canonical trap:** Astro models the 404 route as `/404/` under
  `trailingSlash: "always"` but emits `404.html` (special-cased). The default
  `new URL(Astro.url.pathname, Astro.site)` would yield `https://example.com/404/`;
  the required canonical is `https://example.com/404.html` (file endpoint). The
  `canonicalPath` override on SeoHead/BaseLayout resolves this so B3 does not touch
  shared components.
- **Approved identity copy (renderable on `/`):**
  - `Ryan Brosas`, `Agent Systems Builder`, `I build agent systems so repetitive work
    stops coming back to you.` (`DESIGN.md:478-481`).
  - Title `Ryan Brosas — Agent Systems Builder`; description `Ryan Brosas builds
    practical agent systems with clear context, checks, handoffs, and recovery paths.`
    (`ryan-brosas-landing-page.html:6-7`).
  - Skip-link text `Skip to content` (`docs/Ryan-Brosas-Brand-System/index.html:11-13`).
  - Nav label `Work With Me` for `/services/` (`src/content/settings/site.json`,
    `docs/sitemap.md:44`).
- **No approved About/Services/Contact substantive copy** — identity language only on
  `/`; substantive page copy is a separate gated approval (core-pages/contact children).
- **Test pattern:** `spawnSync(astroBin, ["build"], {cwd: repoRoot})` for the real root
  build; read `dist/index.html` / `dist/404.html`; regex canonical assertions; `finally`
  cleanup. No root-build test exists yet — `tests/shell.test.mjs` is a new file
  (the existing `tests/policy.test.mjs` only builds fixtures, never the root site).
- **`/ship` UI detection gap (resolved in workspace prep):** `ship.md:273` UI glob
  omitted `*.astro`, so this child's UI changes would bypass the auto UI Quality Gate.
  `*.astro` was added to the glob as part of this `/create` workspace prep so the
  routine's UI gate fires for Astro components.

---

## Risks

- **404 canonical drift to `/404/`** if `canonicalPath` override is missing or bypassed.
  Mitigation: SeoHead always routes through `canonicalHref`; tests assert the exact
  `/404.html` canonical.
- **Nav linking to draft/absent routes** if SiteHeader maps `PAGES` directly instead of
  filtering via `resolveRoutes`. Mitigation: B2 RED asserts nav link count matches
  resolved routes only.
- **Verifier rejecting valid output** if the CLI manifest is not updated atomically with
  route activation. Mitigation: B1 and B3 each own `scripts/verify-build.mjs` and update
  the manifest in the same GREEN commit as the page file.

---

## Open Questions

None — this child is fully unblocked by Child 1 (`m2-content-route-contracts`,
complete) plus the workspace prep (`*.astro` added to `/ship` UI detection).

---

## Related Tracks

- **Parent:** `m2-accessible-core-shell` (aggregate-close after all children complete +
  accessibility evidence matches HEAD).
- **Depends on:** `m2-content-route-contracts` (complete at `638a99a`).
- **Next children:** `m2-core-pages` (copy approval + markdown safety), `m2-contact-page`
  (scheduler/email/privacy/copy), `m2-brand-shell` (P02B + allowlist + favicon),
  `m2-accessibility-acceptance` (all UI children + browser evidence).
