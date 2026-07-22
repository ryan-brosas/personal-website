# M2 Brand Shell Implementation Plan

> **For Claude:** Implement this plan task-by-task.

**Goal:** Apply the approved local brand system to the production shell, including a faithful favicon, semantic token styling, header identity, and a failure-safe mobile navigation disclosure.

**Discovery Level:** 3 — Deep. This introduces the first production client script, canonical cross-directory CSS, SVG component/raw handling, progressive enhancement, and runtime keyboard verification.

**Context Budget:** ~48%

**Effort:** L

---

## Constraints

- Local `docs/Ryan-Brosas-Brand-System/` files are authoritative.
- No new dependencies.
- No Contact changes, content edits, hero imagery, illustrations, homepage choreography, dark mode, footer changes, or new icon family.
- Internal routes retain only restrained functional interaction.
- `astro.config.preview.mjs` is user-created and remains untouched.
- D1/D2/D3 cohesive scopes of 4/5/4 files are explicitly user-approved.

## Must-Haves

### Observable Truths

1. Every generated page references one valid favicon whose bytes match the approved charcoal R/lightning mark.
2. The shell visibly consumes semantic brand tokens rather than `system-ui`, raw pigment variables, or duplicate token definitions.
3. The header displays the approved mark beside "Ryan Brosas," while retaining correct route visibility and current-page semantics.
4. With JavaScript unavailable or initialization failing, mobile users see all navigation links and no unusable toggle.
5. With JavaScript active, mobile users can open and close navigation, identify the Menu control, tab forward into the links, and close with Escape while focus returns to the toggle.
6. Menu/close icons come from the approved sprite, inherit the control color, and remain decorative to assistive technology.
7. Existing routes, discovery output, root/404 semantics, focus styling, and generated-output verification remain green.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Favicon | Approved browser identity endpoint | `public/favicon.svg` |
| Head integration | Favicon declaration on all pages | `src/components/SeoHead.astro` |
| Canonical token channel | Brand tokens and shell styling | `src/styles/global.css` |
| Shared layout | Global stylesheet integration | `src/layouts/BaseLayout.astro` |
| Header | Brand lockup and progressive navigation | `src/components/SiteHeader.astro` |
| Logo asset | Approved charcoal mark | `src/assets/brand/logo-charcoal.svg` |
| Icon sprite | Approved utility symbols | `src/assets/brand/icons.svg` |
| Output verifier | Favicon inventory and unchanged JS policy | `scripts/verify-build.mjs` |
| Contract tests | Static output, asset integrity, fallback, CSS, and script assertions | `tests/shell.test.mjs` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| Approved logo | Production logo/favicon | Byte-identical copies | Asset is edited or replaced |
| `SeoHead.astro` | `/favicon.svg` | `<link rel="icon">` | Endpoint exists but pages omit it |
| Canonical `tokens.css` | Shared shell | Direct CSS import through `global.css` | Token fork or import drift |
| `BaseLayout.astro` | Brand styling | One global CSS import | Pages receive declarations but never use them |
| SiteHeader | Logo | Inline Astro SVG component | Duplicate or accessible-name noise |
| Approved sprite | Toggle icons | Vite `?raw`, trusted `set:html`, local fragments | Component import fails or external sprite loses color |
| Inline nav script | CSS disclosure states | `data-nav-ready`, `data-open`, `aria-expanded` | Script failure hides navigation |
| Tests/verifier/browser | Built output | Static assertions plus CDP runtime evidence | False-green interaction contract |

---

## Pre-Execution Contract Synchronization

Before D1, persist this plan and reconcile lifecycle documents in one planning-only commit:

1. `.opencode/artifacts/m2-brand-shell/{spec.md,prd.json,plan.md}` — replace the task matrix with D1/D2/D3 below; remove custom-property tree-shaking claims; use semantic token roles; record `?raw` sprite injection and targeted runtime verification.
2. `.opencode/artifacts/m2-accessible-core-shell/{spec.md,prd.json,plan.md}` — permit the approved progressive button disclosure; set `m2-brand-shell` to `in-progress`, `tasks: 3`; retain only completed `m2-core-pages` as the historical dependency; record local P02B, asset-allowlist, and favicon decisions as resolved.
3. `.opencode/artifacts/homepage-art-direction-canonicalization/{spec.md,plan.md}` — add the operator amendment: local mirrors and contract are authoritative; mark local canonicalization complete; remote hosted synchronization is deferred.
4. `.opencode/artifacts/website-build/decisions.md` — append a superseding local-authority amendment to ADR-004.
5. `.opencode/artifacts/website-build/plan.md` — remove stale P02 pending/remote-gate wording.
6. `.opencode/roadmap.md` — record the committed scaffold, completed M1, active M2, and locally satisfied P02B dependency.
7. `.opencode/state.md` — remove "both pending" and remote distribution blocker wording; record brand-shell active; Contact remains independently gated.
8. `.opencode/artifacts/MEMORY.md` — record the local-authoritative brand decision.

Validation:

```bash
node -e "JSON.parse(require('node:fs').readFileSync('.opencode/artifacts/m2-brand-shell/prd.json'))"
node -e "JSON.parse(require('node:fs').readFileSync('.opencode/artifacts/m2-accessible-core-shell/prd.json'))"
git diff --check
```

Confirm no production files are part of this synchronization commit.

---

## Dependency Graph

```text
D1 Favicon endpoint and integrity
  → D2 Canonical token channel and header identity
    → D3 Progressive navigation and approved sprite

Wave 1: D1
Wave 2: D2
Wave 3: D3
```

All tasks serialize because they modify `tests/shell.test.mjs`.

## Tasks

### D1 — Favicon Endpoint and Integrity

**Needs:** Approved charcoal logo source
**Creates:** Faithful favicon endpoint and all-page head declaration
**Checkpoint:** None
**Files:** 4 — approved cohesive exception

- `tests/shell.test.mjs`
- `src/components/SeoHead.astro`
- `public/favicon.svg`
- `scripts/verify-build.mjs`

#### RED

1. Add a dedicated `D1 favicon` test block that performs a successful isolated root build.
2. Use existence assertions before reading missing files.
3. Require:
   - `dist/favicon.svg`;
   - exactly one favicon link on `/`, `/about/`, `/services/`, and `404.html`;
   - `rel="icon"`, `type="image/svg+xml"`, `sizes="any"`, and `href="/favicon.svg"`, independent of attribute order;
   - canonical source, public copy, and generated file to have identical bytes and SHA-256;
   - source hash to remain `a5e1589808b8c2a27a021bceef787ca7198e968273fe6a567c58e68515aa8cf8`.
4. Add a verifier call expecting `favicon.svg`; it should fail with `missing-endpoint: favicon.svg`.
5. Extend the copied-noindex variant contract to require favicon parity.
6. Leave inherited manifests unchanged until GREEN.

```bash
node --test --test-name-pattern="D1 favicon" tests/shell.test.mjs
```

**Expected RED:** assertion failure that `dist/favicon.svg` is missing, not a filesystem exception.

**RED commit:** `test(m2): define favicon integrity contract`

#### GREEN

1. Create `public/` and copy `Logo---Ryan-1.svg` byte-for-byte to `public/favicon.svg`.
2. Add to `SeoHead.astro`:

```astro
<link rel="icon" type="image/svg+xml" sizes="any" href="/favicon.svg" />
```

3. Add `favicon.svg` to:
   - B1, B3, C2, and C3 real-root manifests;
   - the D1 manifest;
   - the copied-noindex variant manifest;
   - the CLI manifest in `scripts/verify-build.mjs`.
4. Update copied-variant setup to copy `public/` when it exists.
5. Keep the `_astro` allowlist unchanged.

```bash
node --test --test-name-pattern="D1 favicon" tests/shell.test.mjs
npm run check
npm test
npm run build
npm run verify
```

**Expected GREEN:** source/public/dist favicon bytes match; all pages link it once; verifier accepts the endpoint.

**GREEN commit:** `feat(m2): add approved favicon endpoint`

---

### D2 — Canonical Tokens and Header Identity

**Needs:** D1
**Creates:** Token-driven global shell and approved header lockup
**Checkpoint:** None
**Files:** 5 — approved cohesive exception

- `tests/shell.test.mjs`
- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/assets/brand/logo-charcoal.svg`

#### RED

1. Add `D2 token shell` tests.
2. Safely assert `src/styles/global.css` exists before reading.
3. Require exactly one direct import:

```css
@import "../../docs/Ryan-Brosas-Brand-System/tokens.css";
```

4. Inspect built CSS by selector, not by merely finding token declarations:
   - `body`: `var(--canvas)`, `var(--text-1)`, `var(--font-body)`, `var(--leading-body)`;
   - headings: `var(--font-display)`;
   - header/navigation: semantic `--nav-*`;
   - links: semantic `--link-*`;
   - focus: semantic `--focus-*`;
   - layout spacing and width: `--space-*`, `--content-max`.
5. Assert `system-ui` is no longer the body declaration.
6. Require a header brand anchor containing:
   - inline SVG with `viewBox="0 0 255 211"`;
   - `aria-hidden="true"` and `focusable="false"`;
   - adjacent visible "Ryan Brosas" text;
   - root `aria-current="page"` only on `/`.
7. Require source and production logo copies to be byte-identical.
8. Existing route/current-page, one-primary-nav, skip-link, focus, footer, and no-script assertions remain green.

```bash
node --test --test-name-pattern="D2 token shell" tests/shell.test.mjs
```

**Expected RED:** missing global stylesheet and missing brand mark assertions.

**RED commit:** `test(m2): define token-driven brand shell contract`

#### GREEN

1. Copy the approved charcoal logo byte-for-byte to `src/assets/brand/logo-charcoal.svg`.
2. Create `src/styles/global.css` with the one canonical import.
3. Move the structural global CSS from `BaseLayout.astro` into `global.css`.
4. Import `global.css` once in `BaseLayout.astro` frontmatter.
5. Use semantic tokens for brand-critical selectors; structural constants such as percentages, zero, and layout modes remain allowed.
6. Restructure `SiteHeader.astro`:
   - root brand anchor outside the Primary nav;
   - imported inline logo component, decorative to assistive technology;
   - visible site title;
   - brand anchor owns root current-page state;
   - Primary nav contains only visibility-filtered page routes.
7. Preserve CSS-only wrapping/stacking on mobile.
8. Update copied-noindex variant setup to create `<temp>/docs/Ryan-Brosas-Brand-System/tokens.css` from the canonical token file before building.
9. Record emitted CSS byte size; do not impose a speculative threshold.

```bash
node --test --test-name-pattern="D2 token shell" tests/shell.test.mjs
npm run check
npm test
npm run build
npm run verify
```

**Expected GREEN:** every page uses the canonical token bundle; brand-critical selectors consume semantic roles; header identity and all existing route semantics pass.

**GREEN commit:** `feat(m2): apply canonical brand tokens and header identity`

---

### D3 — Progressive Navigation and Approved Sprite

**Needs:** D2
**Creates:** Failure-safe mobile disclosure using approved menu/close symbols
**Checkpoint:** None
**Files:** 4 — approved cohesive exception

- `tests/shell.test.mjs`
- `src/components/SiteHeader.astro`
- `src/styles/global.css`
- `src/assets/brand/icons.svg`

#### RED

1. Add `D3 progressive navigation` static-output tests.
2. Require final DOM order: `brand anchor → toggle button → Primary nav`.
3. Require the toggle:
   - `type="button"`;
   - stable visible name `Menu`;
   - `aria-expanded="false"`;
   - `aria-controls="primary-navigation"`;
   - minimum 44×44 target.
4. Require `id="primary-navigation"` on the nav.
5. Require one approved sprite definition and local uses for `#icon-menu` and `#icon-close`.
6. Require icon hosts to be decorative.
7. Require CSS contracts:
   - base/unready: toggle hidden, nav visible;
   - ready mobile: toggle visible, closed nav hidden;
   - `data-open="true"`: nav visible;
   - desktop: nav visible and toggle hidden;
   - reduced motion: no spatial panel transition.
8. Require exactly one marked script and no generated `_astro/*.js`.
9. Leave all inherited no-script assertions unchanged during RED.

```bash
node --test --test-name-pattern="D3 progressive navigation" tests/shell.test.mjs
```

**Expected RED:** toggle, sprite, CSS state, and marked-script assertions fail; inherited tests remain green.

**RED commit:** `test(m2): define progressive navigation contract`

#### GREEN

1. Copy the approved sprite byte-for-byte to `src/assets/brand/icons.svg`.
2. Import it as trusted raw local markup:

```ts
import iconSprite from "../assets/brand/icons.svg?raw";
```

3. Inject it once using `set:html` inside an absolutely positioned, zero-size wrapper.
   - Do not use `hidden` or `display:none` on the definitions.
   - `set:html` is permitted only for this byte-pinned local asset.
4. Reference same-document symbols from decorative button SVGs:

```html
<use href="#icon-menu"></use>
<use href="#icon-close"></use>
```

5. Insert the toggle between brand anchor and nav.
6. Add exactly one plain-JavaScript enhancement:

```astro
<script is:inline data-nav-enhancement>
```

7. The IIFE must:
   - locate header, button, and controlled nav;
   - define open/close state synchronization;
   - bind toggle, every nav-link close, and document Escape handlers;
   - return focus to the toggle after Escape;
   - initialize closed state;
   - set `data-nav-ready` only after all handlers bind successfully;
   - catch initialization failure without hiding navigation.
8. Base CSS keeps links visible and the toggle hidden.
9. Only under `max-width: 820px` and `data-nav-ready` does the disclosure collapse.
10. Keep the visible and accessible name `Menu` stable; only icons change.
11. Replace all inherited "no script" checks with one helper requiring:
    - exactly one script;
    - that script has `data-nav-enhancement`;
    - no other scripts;
    - no `_astro/*.js`.
12. Assert copied source sprite:
    - matches canonical bytes;
    - contains exactly the approved ten IDs;
    - contains no script or external references.

Static verification:

```bash
node --test --test-name-pattern="D3 progressive navigation" tests/shell.test.mjs
npm run check
npm test
npm run build
npm run verify
```

#### Runtime GREEN Evidence

Start the built site:

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Use Chromium/CDP through the browser-testing skill. Save ignored evidence under `.playwright-mcp/m2-brand-shell/`.

Verify:

1. **390×844, normal** — readiness marker present; toggle visible, at least 44×44; nav initially closed; keyboard Space/Enter opens it; next Tab reaches the first nav link; click changes `aria-expanded`, nav state, and menu/close icons; link activation closes; Escape closes and returns focus; icon and button colors agree; console clean.
2. **390×844, JavaScript disabled** — readiness marker absent; toggle hidden; all links visible and keyboard-accessible.
3. **390×844, reduced motion** — disclosure still works; computed panel transition has no spatial motion.
4. **390×844, initialization failure** — inject an `addEventListener` failure before page scripts; readiness marker absent; toggle hidden; links visible; no uncaught page error.
5. **1440×900, normal** — navigation visible; toggle hidden; layout and current-page semantics preserved.

Record browser version and results in the child close progress. Full zoom/reflow/screen-reader acceptance remains in `m2-accessibility-acceptance`.

**Expected GREEN:** progressive fallback and interaction behavior pass, with exactly one marked inline script and no generated JS asset.

**GREEN commit:** `feat(m2): add progressive mobile navigation`

---

## Final Verification

```bash
npm run check
npm test
npm run build
npm run verify
```

Confirm:

- `/`, `/about/`, `/services/`, and `/404.html` behavior is unchanged.
- `dist/favicon.svg` exactly matches the approved source.
- Every page declares the favicon once.
- Token CSS is imported once and semantic tokens are applied.
- Header contains one decorative approved mark and one Primary nav.
- Contact remains absent.
- No hero, illustration, dark mode, homepage motion, or footer change appears.
- Exactly one marked inline enhancement script exists.
- No generated JavaScript asset exists.
- Runtime evidence passes all five scenarios.

## Risks and Failure Behavior

- Asset hash mismatch blocks the task.
- Missing favicon inventory causes verifier failure.
- Missing copied token/public inputs blocks the copied-noindex variant rather than weakening it.
- If enhancement initialization fails, navigation remains visible and the toggle remains hidden.
- If browser runtime evidence cannot run, D3 stays incomplete; static inspection is not substituted.
- A future CSP must explicitly hash or nonce the inline enhancement script.
- Any Contact, homepage-motion, dark-mode, footer, or broad-JS change is out of scope.

## Privacy and Security

- No credentials, analytics, customer information, or private evidence.
- No new dependency.
- SVG sources must contain no scripts or external resources.
- `set:html` is restricted to the approved byte-pinned local sprite; never authored or user-controlled content.
- The verifier continues rejecting generated JavaScript.
- All content and navigation remain usable without JavaScript.

## Stop Conditions

- D2 cannot start until favicon integrity and copied-variant checks pass.
- D3 cannot start until canonical tokens and header identity pass all gates.
- Stop if any inherited route, sitemap, robots, root, 404, focus, or content test regresses.
- Stop if D3 runtime evidence fails or is unavailable.
- Do not expand into Contact, hero assets, homepage choreography, dark mode, or final accessibility acceptance.

## Constitutional Compliance

- [x] No broad staging or destructive Git operations.
- [x] No hook bypass.
- [x] No new dependency.
- [x] No type suppression.
- [x] D1/D2/D3 4/5/4 scopes explicitly approved.
- [x] No task exceeds five tracked files.
- [x] Trusted `set:html` use is narrowly justified and byte-pinned.
- [x] No secrets or private evidence.

**Constitutional compliance: PASS**
