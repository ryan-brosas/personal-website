# M2 Accessibility Acceptance Record

**Created:** 2026-07-22
**Status:** accepted
**Accepted at:** 2026-07-22
**Decided by:** Ryan (manual 200% zoom review + skip-link decision)
**Audited commit:** `3ded07b20557dc4c2f237364ae0907cfa30053a3`
**Capture script:** `scripts/a11y-capture.mjs` (committed at the audited commit above)
**Milestone:** M2 (accessible core shell) — accessibility acceptance child
**Parent:** `m2-accessible-core-shell`

---

## Environment

- **Chromium:** 150.0.7871.114 (`/snap/bin/chromium`)
- **Display:** headless via CDP (no X server; `xvfb-run` available but unused)
- **Automation:** dependency-free Node 24 built-ins + Chrome DevTools Protocol (WebSocket). No Playwright, no `@axe-core/playwright`, no new dependencies.
- **Node:** v24.16.0 / npm 11.13.0
- **Static server:** `http://127.0.0.1:32791/` serving the built `dist/` (loopback only; port auto-assigned)
- **Screen reader:** not available (orca, nvda, espeak-ng, espeak all absent)

---

## Scope and routes audited

Real browser evidence captured for all five built HTML routes:

| Route | Visibility | Canonical | Robots | h1 | Nav current |
|---|---|---|---|---|---|
| `/` | noindex | `https://example.com/` | `noindex,follow` | Ryan Brosas | brand (not primary nav) |
| `/about/` | public | `https://example.com/about/` | — | About Ryan Brosas | About |
| `/services/` | public | `https://example.com/services/` | — | Work With Me | Work With Me |
| `/contact/` | public | `https://example.com/contact/` | — | Contact | Contact |
| `/404.html` | noindex | `https://example.com/404.html` | `noindex,follow` | Page not found | none |

This child is **evidence-only**. No production code was modified to produce this
record. If a defect had been found, the spec required stopping and escalating a
separate fix slice; no defect was found (see notes per check).

---

## Viewport / mode matrix (45 scenarios + 5 keyboard = 50 captures, all PASS)

Captures under gitignored `.playwright-mcp/m2-accessibility-acceptance/`.
Screenshots: `screenshots/<routeSlug>__<w>x<h>__<mode>.png` (45) plus
`screenshots/<routeSlug>__keyboard.png` (5). routeSlug ∈ root, about, services,
contact, 404.

| Mode | Routes | Viewports (CSS px) | Count |
|---|---|---|---|
| `normal` | 5 | 320x800, 360x800, 768x1024, 1440x900 | 20 |
| `reduced-motion` | 5 | 360x800, 1440x900 | 10 |
| `no-js` | 5 | 360x800, 1440x900 | 10 |
| `zoom200` (headless proxy) | 5 | 720x450 (DPR 2) | 5 |
| `keyboard` | 5 | 360x800 | 5 |

**Summary:** `{ total: 50, passed: 50, failed: 0, blocked: 0, screenshots: 50 }`

Per-scenario assertions (lang, main#main, skip link, single canonical,
route-appropriate robots, single h1, route-appropriate aria-current, no
horizontal overflow, no console errors, no network failures, no external-origin
requests; plus Contact no-form/no-iframe/no-privacy-link and 404 recovery link)
all PASS across every scenario. The `/404.html` route was served with **HTTP 200**
on direct navigation in this run (the file exists, so Astro preview returns 200,
not 404); no network-failure assertion fired. The `isExpected404` helper — which
would classify a genuine 404 document response as expected — is exercised by
`--self-test` and was not triggered at runtime because no 404 response occurred.

---

## Keyboard (PASS, CDP `Input.dispatchKeyEvent`)

One keyboard capture per route at 360x800, JS on. 13 assertions per route, all
PASS:

1. `first-tab-skip` — first Tab lands on `.skip-link` (href `#main`, "Skip to
   content"). Visible `:focus-visible` outline 2px.
2. `skip-bypass` — activating the skip link moves the focus starting point past
   the header (on Contact, the next focusable is the scheduler link in `<main>`).
   Status is **derived** from whether the next focused element is inside
   `<header>` (fail-closed: pass only when the next tab is past the header).
3. `tab-brand` — Tab reaches the brand anchor.
4. `tab-toggle` — Tab reaches the `button.nav-toggle`.
5. `nav-closed-initial` — nav starts closed (`data-open=false`,
   `aria-expanded=false`).
6. `toggle-open` — activating the toggle opens the nav (`data-open=true`,
   `aria-expanded=true`).
7. `nav-link-tabbable` — nav links become keyboard-reachable when open.
8. `escape-close` — Escape closes the nav (`data-open=false`).
9. `escape-focus-toggle` — Escape returns focus to the toggle button.
10. `shift-tab-reverse` — Shift+Tab reverses order without trapping.
11. `no-external-requests` — 0 requests to a non-loopback origin during the
    keyboard walk.
12. `no-console-errors` — 0 page console errors/exceptions during the walk.
13. `no-network-failures` — 0 failed requests or local HTTP 4xx/5xx during the
    walk (mirrors the matrix scenario gate).

No keyboard trap detected. External Contact links (Calendly, mailto) are
reached by Tab order but **never activated**: the skip-activate `Enter` is only
dispatched when the first focus is exactly `.skip-link[href="#main"]`, and the
toggle `Space` is only dispatched when the toggle button is focused (both are
safety gates so a focus-order regression can never activate an external link).

---

## Skip link (PASS with note)

Activating "Skip to content" achieves the bypass: the next Tab lands past the
header (the focus starting point moves into the page content). Focus itself
falls to `BODY` rather than `#main`, because `<main id="main">` in
`src/layouts/BaseLayout.astro:33` has no `tabindex="-1"` and is therefore not a
focus target. This is recorded honestly as **pass with note**, not silently
fixed and not a hard failure. By operator decision (2026-07-22), the
`tabindex="-1"` polish is deferred to a later slice and does not block this
acceptance.

---

## Reflow (PASS, WCAG 1.4.10 AA)

No horizontal overflow at any audited width: `scrollWidth == clientWidth`
across all 45 matrix scenarios (0 non-pass). 320 CSS px is the normative WCAG
1.4.10 reflow width and is included as a first-class viewport. All content and
functionality are available without two-axis scrolling at 320/360/768/1440.

---

## 200% text resize (PASS, WCAG 1.4.4 AA)

The headless `zoom200` scenarios (720x450 at DPR 2) are a layout proxy only and
are **not** real browser-menu zoom. The authoritative 1.4.4 evidence is the
**manual headed 200% browser-zoom check**, human-verified by Ryan on
2026-07-22 across all five routes: no clipped text, no truncated content, no
lost functionality at 200% zoom. The manual result is recorded durably in
`.playwright-mcp/m2-accessibility-acceptance/manual-zoom200.json` (operator,
date, per-route PASS, criteria; SHA-256 in Evidence paths). The headless proxy
is retained as supporting evidence (no overflow at the reduced viewport).

---

## Reduced motion (PASS)

`prefers-reduced-motion: reduce` emulated via CDP `Emulation.setEmulatedMedia`
(`reduced-motion-mq = true`). The runtime shell has no decorative motion: the
site disables transitions under reduced motion (`src/styles/global.css`) and
the token sheet resets durations to 0.01ms. Final state equals the normal
state across all 10 reduced-motion scenarios.

---

## No-JS (PASS)

JavaScript disabled via CDP `Emulation.setScriptExecutionDisabled` before
navigation. The progressive-enhancement contract holds: `data-nav-ready` is
absent (`no-js-not-ready` PASS), so the nav toggle stays hidden and primary nav
links remain visible and keyboard-reachable at all widths. Skip link, single
`main#main`, single canonical, correct robots, single h1, and route-appropriate
`aria-current` all remain present without JavaScript. All 10 no-JS scenarios
PASS.

---

## Console and network (PASS)

Across all 50 captures: 0 page console errors, 0 failed network requests, 0
requests to a non-loopback origin. Browser-process startup noise (snap,
AppArmor, DBus, GPU) is ignored per the evidence contract; only page-originated
console errors and request failures are counted. The `/404.html` route served
200 on direct navigation (no 404 response occurred in this run).

---

## Contrast (PASS, WCAG 1.4.3 AA)

Computed from real painted colors via CDP `getComputedStyle` at 1440x900
normal, with alpha composited over the painted background and oklch→sRGB
conversion where Chrome serializes colors as `oklch(...)`. Required pairs
(body-text, nav-link, skip-link) all resolved and pass; an unresolved required
pair would block `--strict`.

| Pair | Ratio | Result |
|---|---|---|
| body text on canvas | 17.26 | PASS (≥4.5) |
| skip link on canvas | 17.26 | PASS (≥4.5) |
| nav link — current (opaque charcoal) | 17.26 | PASS (≥4.5) |
| nav link — non-current (charcoal @ 0.68 over paper) | 5.96 | PASS (≥4.5) |
| main link on canvas (where a link exists in `<main>`) | 17.26 | PASS (≥4.5) |

`main-link` is recorded as **blocked — "no element"** on `/`, `/about/`, and
`/services/` because those routes have no `<a>` inside `<main>` (the root
homepage has no in-main link; About and Services are prose-only). `main-link`
is an **optional** pair, so "no element" is an honest not-applicable block,
not a contrast failure, not a site defect, and does not block `--strict`.

---

## Screen reader (BLOCKED)

No screen reader is available in this environment (orca, nvda, espeak-ng, and
espeak are all absent). This is recorded honestly as **BLOCKED**, not inferred
as passing from the DOM or accessibility tree. A real assistive-technology smoke
must run in an environment with a screen reader before any final launch claim.

**Re-open trigger:** install a screen reader and run an AT smoke across all
five routes. This is the only outstanding gate for this acceptance record.

---

## Evidence paths

All evidence under `.playwright-mcp/m2-accessibility-acceptance/` is gitignored
and regenerable; SHA-256s bind the audited run:

- Manifest: `.playwright-mcp/m2-accessibility-acceptance/manifest.json`
  (SHA-256 `040e44322bc156a99ce04064896da1151af2eff6c8c008c72fd3e71c70dbc1b7`)
- Manual 200% zoom record: `.playwright-mcp/m2-accessibility-acceptance/manual-zoom200.json`
  (SHA-256 `0662d31e5059eeb88194035f7b61dfdc1d60628f174fb56d21012d7f39219594`)
- Human-readable summary: `.playwright-mcp/m2-accessibility-acceptance/summary.md`
- Screenshots: `.playwright-mcp/m2-accessibility-acceptance/screenshots/*.png` (50)
- Capture script: `scripts/a11y-capture.mjs`

Regenerate the automated evidence from a checkout at the audited commit
(`--expected-commit` is a drift guard, so HEAD must equal the audited SHA — a
path-only checkout leaves HEAD elsewhere and will mismatch; use a worktree or
detach at the audited SHA):

```bash
git worktree add /tmp/a11y-regen 3ded07b20557dc4c2f237364ae0907cfa30053a3
ln -s "$PWD/node_modules" /tmp/a11y-regen/node_modules   # or run `npm ci` there
cd /tmp/a11y-regen
CHROME_BIN=/snap/bin/chromium node scripts/a11y-capture.mjs --strict \
  --expected-commit 3ded07b20557dc4c2f237364ae0907cfa30053a3
cd - && git worktree remove /tmp/a11y-regen --force
```

---

## Resume guard

Before relying on this record, verify:

1. The audited commit exists: `git rev-parse 3ded07b20557dc4c2f237364ae0907cfa30053a3` resolves.
2. The acceptance-creating commit's first parent equals `3ded07b` (no production
   drift between the A1 capture and this record).
3. If any production code under `src/` changed after `3ded07b`, re-run the
   capture at the new HEAD before relying on this record.

The parent close-2 requirement that "the acceptance record's commit hash
matches current HEAD" is satisfied in the **audited-commit** sense: the audited
code HEAD (`3ded07b`) is recorded above, and this acceptance commit descends
directly from it. The literal self-referential reading (the record's own SHA ==
HEAD) is impossible by construction and will be reconciled at the aggregate M2
close.

---

## Decision (accepted)

Ryan reviewed the evidence and **accepted** M2 accessibility acceptance on
2026-07-22:

- Manual headed 200% zoom: **PASS** (human-verified, no clipping or loss;
  recorded in `manual-zoom200.json`).
- Skip-link focus target: **accept and record** (bypass works via focus
  starting point; `tabindex="-1"` polish deferred to a later slice).
- Status → **accepted** (screen-reader smoke remains **BLOCKED**).

No production code was changed to produce this record. The shell passes
keyboard, reflow, 200% resize, reduced motion, no-JS, console/network, and
contrast. The only outstanding gate is a real screen-reader smoke in an
environment with a reader installed.
