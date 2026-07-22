# M2 Brand Shell (Child 4 of Plan 03)

**Slug:** m2-brand-shell
**Created:** 2026-07-22
**Status:** In Progress (artifact created; ready for `/plan` then `/ship`)
**Parent:** `m2-accessible-core-shell` (aggregate)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:313-322` (Plan 03 Task 1)

## Slug Metadata

```yaml
depends_on: ["m2-core-pages", "p02a", "p02b"]
parallel: false
conflicts_with: []
blocks: ["m2-accessibility-acceptance"]
estimated_hours: 5
```

---

## Problem Statement

Children 1-3 shipped the policy kernel, the semantic shell, and the first content routes — but the shell runs on structural CSS (`system-ui` font, no brand tokens, no brand mark, no favicon) and the SiteHeader has no mobile disclosure toggle (just an always-visible tree, which works but doesn't scale to a denser nav). P02A/P02B accepted the Signal Path motion contract and the canonical brand assets. This child imports the approved brand tokens + selected assets into the production shell, derives a favicon from the R/lightning mark, wires the icon sprite into a progressively-enhanced mobile nav toggle, and replaces the structural CSS with token-driven styling. No homepage choreography (Plan 04), no hero/illustrations (Plan 04), no dark mode (site is light-only for now), no Contact page (separate child).

---

## Scope

**In scope:**

1. **Token channel:** `src/styles/global.css` imports the canonical root `tokens.css` once (the registered token entry per `DESIGN.md:405`). Astro bundles it. `BaseLayout` imports `global.css` so tokens reach every page.
2. **Favicon:** derive `public/favicon.svg` from the charcoal R/lightning mark (`docs/Ryan-Brosas-Brand-System/logos/Logo---Ryan-1.svg`, the approved charcoal variant). `SeoHead` emits `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` on every page.
3. **Brand assets (selected, minimal):** copy the charcoal R/lightning logo → `src/assets/brand/logo-charcoal.svg`; copy the 10-symbol icon sprite → `src/assets/brand/icons.svg`. Exclude the other 3 logo color variants, the hero, the 11 illustrations, revisions, previews, and the browser component kit (per master plan Task 1 + `brand-assets-iconography-plan.md`).
4. **BaseLayout token-driven CSS:** replace the structural `<style is:global>` block with token-driven styling consumed from `global.css`: `--font-body`/`--font-display`/`--font-mono`, `--color-paper`/`--color-charcoal`/`--color-coral`, `--space-*` 8px rhythm, `--radius-*`, `--duration-fast` for focus/hover transitions. Keep the existing skip-link, focus-visible, landmark, and responsive behavior. No expressive motion on internal routes (P02B rule); only functional 150ms hover/focus.
5. **SiteHeader brand mark + mobile nav toggle:** add the R/lightning logo to the header brand lockup (logo + siteTitle). Add a progressively-enhanced mobile nav disclosure toggle (the P02A-proved pattern): base CSS (no `data-nav-ready`) → links visible inline, trigger hidden; enhanced (`[data-nav-ready]`) → trigger revealed with menu icon, links collapse into a disclosure that opens/closes; JS binds handlers FIRST (click toggle, link close, Escape+focus-return), THEN sets `data-nav-ready`. Wire `icon-menu`/`icon-close` from the sprite into the toggle button. `aria-expanded`/`aria-controls` on the toggle. No-JS = links visible, no toggle. Reduced-motion respected.
6. **No regression:** existing `/`, `/about/`, `/services/`, `/404.html`, sitemap, robots, verifier, and the 106-test suite stay green. The only new client script is the nav-toggle IIFE (progressively enhanced; base works without it).

**Non-goals:**

- No hero illustration or 11 operational illustrations (Plan 04 homepage content).
- No expressive homepage choreography / Signal Path motion (Plan 04).
- No dark mode wiring (tokens support it; site is light-only for now).
- No Contact page or Contact inputs (separate gated child).
- No new logo variants, no new icon family (iconography plan: add only when a screen exposes a need).
- No changes to content records, route policy, sitemap logic, or the verifier's route inventory (all stay green).
- No browser accessibility acceptance (separate child; this child verifies static structure + no-JS + reduced-motion only).

---

## Success Criteria

1. **Tokens flow into the shell:** `global.css` imports `tokens.css`; built pages consume `--font-body`/`--color-paper`/`--color-charcoal`/`--space-*` (not `system-ui`/hardcoded values); the bundled CSS is emitted under `_astro/` and the verifier accepts it. Verify: `npm run build && npm run verify`; `tests/shell.test.mjs` asserts built HTML/CSS uses brand tokens.
2. **Favicon serves the R/lightning mark:** `dist/favicon.svg` exists (copied from `public/`); every built page's `<head>` has `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`; the SVG is the charcoal R/lightning geometry. Verify: `npm run build`; `tests/shell.test.mjs` asserts the link + file.
3. **Brand mark + no-JS mobile nav toggle:** SiteHeader renders the R/lightning logo in the brand lockup; the toggle uses `icon-menu`/`icon-close` from the sprite; no-JS build shows links visible + no toggle; JS build shows toggle revealed + disclosure works + Escape closes + focus returns to toggle; reduced-motion respected. Verify: `tests/shell.test.mjs` (no-JS + normal + reduced captures; failure injection: nav-init failure leaves links visible).
4. **No regression:** 106+ tests pass; `check`/`build`/`verify` green; `/`, `/about/`, `/services/`, `/404.html`, sitemap, robots unchanged in behavior. Verify: `npm test && npm run check && npm run build && npm run verify`.

---

## Technical Context

- **Approved asset inventory** (`docs/Ryan-Brosas-Brand-System/brand-assets-iconography-plan.md:22-69`): 4 logos (charcoal/coral/yellow/white, 255×211 viewBox SVGs in `logos/`); 1 hero PNG; 11 operational illustration PNGs; 1 icon sprite `assets/icons.svg` (10 symbols: menu, close, arrow-right, chevron-down, copy, check, refresh, alert, info, file-plus; 24px viewBox, 1.75px `currentColor` outline).
- **No canonical favicon export** (`README:61`): "No runtime application, tray, installer, or favicon exports were present, so none were invented." This child derives one from the approved charcoal mark — faithful extension, not new identity.
- **Tokens** (`docs/Ryan-Brosas-Brand-System/tokens.css`): `--color-paper #FEFEFE`, `--color-charcoal #1A1A1A`, `--color-coral #FF5555`, `--color-signal #ECC90F`; `--font-display`/`--font-body`/`--font-mono` (Segoe UI Variable + Inter/Cascadia fallbacks); `--space-1..24` 8px rhythm; `--radius-editorial 0`/`--radius-control 4`/`--radius-panel 8`/`--radius-pill 999`; `--duration-fast` for functional motion. Light mode is the default (`:root, [data-theme="light"]`).
- **P02B motion contract** (`DESIGN.md` Motion section, extended): internal routes use only functional 150-220ms motion (hover/focus/panel); expressive 400-700ms editorial band is homepage-only (Plan 04). Reduced-motion = final composition.
- **Current shell** (Children 1-2): `BaseLayout.astro` structural `<style is:global>` (system-ui, no tokens); `SiteHeader.astro` always-visible `<nav>` tree, no toggle, no brand mark; `SeoHead.astro` no favicon link; `SiteFooter.astro` copyright + Home link. 106 tests in `tests/shell.test.mjs` + `tests/policy.test.mjs`.
- **P02A mobile-nav fix pattern** (proven on canonical landing page): `data-nav-ready` on `.site-header` only after handlers bind; base CSS links visible + trigger hidden; enhanced CSS trigger revealed + links collapse; Escape closes + returns focus to toggle; `prefers-reduced-motion` respected.
- **Verifier** (`scripts/verify-build.mjs`): `_astro/` allowlist accepts CSS/SVG/image/font; rejects JS/HTML/unknown. The new `global.css` bundle + favicon.svg + logo SVG + icon sprite must all be allowed (CSS under `_astro/`, SVGs as endpoints or `_astro/`).
- **Astro 5.18.2:** `public/favicon.svg` copies as-is to `dist/favicon.svg` (slashless file endpoint). `global.css` imported in `BaseLayout` frontmatter bundles under `_astro/`. SVG `<use href="/assets/brand/icons.svg#icon-menu">` references the sprite (or inline the sprite).

---

## Risks

- **Nav-toggle script regression:** adding a client IIFE is the first production client script. Mitigation: progressive enhancement (base works without it); failure injection test (addEventListener throws → `data-nav-ready` absent → links visible, trigger hidden); no-JS build stays green.
- **Token CSS bundle size:** `tokens.css` is large (~600 lines with all roles). Mitigation: import only what the shell consumes; Astro tree-shakes unused custom properties? Verify the bundled CSS is reasonable and the verifier accepts it.
- **Favicon SVG fidelity:** the 255×211 mark must render legibly at 16×16. Mitigation: the geometry is bold (R + lightning bolt, thick strokes); test the favicon at favicon size in the browser matrix (or accept the full mark; browsers scale viewBox).
- **Inherited test conflict:** B2's "no client script" assertion (`tests/shell.test.mjs:191`) will break once the nav-toggle IIFE ships. Mitigation: update B2 atomically — the toggle script is progressively enhanced, not a hydration script; the assertion becomes "no script outside the nav-toggle IIFE" or "no script that gates content".
- **Sprite reference strategy:** external `icons.svg` referenced via `<use href>` requires the file served at a stable URL; inlining the sprite into BaseLayout avoids a network round-trip but duplicates markup. Mitigation: inline the sprite once in BaseLayout (it's small, 10 symbols) OR reference via absolute `/assets/brand/icons.svg#...`. Pick one and test.

---

## Open Questions

None — favicon derivation (R/lightning charcoal) and icon-sprite wiring (menu/close in toggle) approved by user. Plan decomposition may surface sprite-reference strategy (inline vs external `<use>`).

---

## Related Tracks

- **Parent:** `m2-accessible-core-shell` (aggregate-close after all children + accessibility evidence).
- **Depends on:** `m2-core-pages` (complete), P02A (accepted), P02B (complete, local authoritative).
- **Next children:** `m2-accessibility-acceptance` (all UI children + browser evidence). `m2-contact-page` is parallel/unordered (gated by contact inputs, not by brand-shell).
- **Close handoff:** after this child closes, mark parent ledger `m2-brand-shell` → complete; activate `m2-accessibility-acceptance` only if all UI children (incl. contact) are done. Update `.opencode/state.md`.
