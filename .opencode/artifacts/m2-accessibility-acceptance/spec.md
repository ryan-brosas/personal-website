# M2 Accessibility Acceptance (Child 6 of Plan 03)

**Slug:** m2-accessibility-acceptance
**Created:** 2026-07-22
**Status:** In Progress (artifact created; ready for `/plan` then `/ship`)
**Parent:** `m2-accessible-core-shell` (aggregate)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md` (M2 accessibility exit; `m2-accessible-core-shell/plan.md:60-68`)

## Slug Metadata

```yaml
depends_on: ["m2-contact-page"]
parallel: false
conflicts_with: []
blocks: []
estimated_hours: 3
```

---

## Problem Statement

All five M2 UI-producing children are shipped (content-route-contracts, semantic-shell, core-pages, brand-shell, contact-page; 122/122 tests). The `all-ui-children-complete` gate is satisfied. The M2 parent close-2 (`m2-accessible-core-shell/plan.md:60-68`) requires an accessibility acceptance record — `acceptance.md` in the accessibility child artifact — with environment, route/viewport matrix, results, and exact tested commit hash, with **browser evidence (not inferred from static inspection)**. Real assistive-technology smoke (screen reader) cannot run in this environment (no `orca`/`espeak-ng`/`espeak`/`nvda` installed; probe confirmed), so it is recorded as a **BLOCKED sub-gate** per the P02A pattern (`homepage-art-direction/acceptance.md:180-187`) and the parent spec (`spec.md:104-105`, "blocked record if not"). A blocked browser environment keeps M2 in progress; it does not close the milestone (`spec.md:139-142`).

## Scope

**In scope:**

1. **Browser accessibility evidence capture** (A1): a reproducible capture script using dependency-free Node 24 + Chromium via the Chrome DevTools Protocol (installed `/snap/bin/chromium`/`/usr/bin/google-chrome`; NO new deps — Playwright packages are not installed/resolvable) builds the site (isolated pattern) and captures real browser evidence across all built routes (`/`, `/about/`, `/services/`, `/contact/`, `/404.html`) for: keyboard navigation (Tab/Shift+Tab order, visible focus, skip-link target, Escape/focus-return on the nav toggle), reflow at 320/360/768/desktop CSSpx (320 is the normative WCAG 1.4.10 reflow gate; no horizontal scroll, no clipped content), 200% zoom (headless CDP proxy at 720x450 CSS + DPR 2 for automated evidence, PLUS a mandatory manual headed 200% browser-zoom checkpoint — WCAG 1.4.4 requires real browser zoom, which headless CDP cannot prove), reduced-motion (`prefers-reduced-motion: reduce`), no-JS (content + nav usable with script disabled), console errors + network 4xx harvest, and a color-contrast spot-check of the token pairings. Evidence binaries written to `.playwright-mcp/m2-accessibility-acceptance/` (gitignored, regenerable).
2. **Acceptance evidence record** (A2): `acceptance.md` in P02A format (header metadata, Environment, route/viewport matrix, per-check PASS results, a dedicated BLOCKED screen-reader section with re-open trigger, Evidence paths, Resume guard, exact tested commit hash, Decision) committed under `.opencode/artifacts/m2-accessibility-acceptance/`.
3. **Screen-reader smoke**: recorded as BLOCKED (env: no reader installed); re-open trigger = install `orca`/`espeak-ng`/`nvda` and re-run the smoke.
4. **Capture script committed for reproducibility** (evidence binaries gitignored, regenerable from the script).

**Non-goals:**

- No screen-reader smoke (BLOCKED — no reader; recorded honestly, not inferred as passing).
- No new pinned dependencies (no `@axe-core/playwright`, no `playwright` in `package.json` — use dependency-free Node 24 + Chromium CDP; `npx playwright` cannot run an arbitrary standalone script and Playwright packages are not installed). The master-plan `tests/e2e/` regression suite + pinned browser-test deps (`website-build/plan.md:427`) is a later/repeatable gate, NOT this acceptance.
- No `tests/e2e/` permanent regression suite (this is a point-in-time evidence gate per parent close-2, not a CI regression layer).
- No fixing accessibility defects found during the audit (any defect is a separate fix child; this child only RECORDS evidence). If a defect blocks acceptance, STOP and escalate — do not silently fix.
- No M3/homepage/P02B scope; no brand/favicon/CSS/route changes; no production code changes (acceptance is evidence-only).
- No inferring a pass from static inspection (parent spec `spec.md:139-142`).

---

## Success Criteria

1. **Browser evidence is real, not inferred:** the capture script runs and produces browser evidence (screenshots/keyboard traces/console+network logs) for all 5 routes across the matrix (keyboard, reflow 360/768/desktop, 200% zoom, reduced-motion, no-JS, contrast). Verify: `node scripts/a11y-capture.mjs` runs; evidence artifacts exist under `.playwright-mcp/m2-accessibility-acceptance/`.
2. **acceptance.md satisfies parent close-2:** `.opencode/artifacts/m2-accessibility-acceptance/acceptance.md` exists in P02A format with environment, route/viewport matrix, per-check results, BLOCKED screen-reader section, evidence paths, resume guard, decision, and exact tested commit hash matching the audited code commit. Verify: parent close-2 (`m2-accessible-core-shell/plan.md:60-68`) — `acceptance.md` recorded commit hash matches the audited HEAD.
3. **Static gates stay green (no code changed):** `npm run check && npm test && npm run build && npm run verify` all exit 0 (acceptance touches no production code).

---

## Technical Context

- **Tooling:** dependency-free Node 24 built-ins (`child_process`, `fs`, `crypto`, `fetch`, `WebSocket`) + Chromium via the Chrome DevTools Protocol. Browser: installed `/snap/bin/chromium` (150.0.7871.114), `/usr/bin/google-chrome`, `/usr/bin/chromium-browser`. Playwright packages are NOT installed/resolvable (`import('playwright')` returns `ERR_MODULE_NOT_FOUND`); `npx playwright` cannot execute an arbitrary standalone script, so CDP is the reproducible path. NO new deps.
- **Built routes:** `/` (noindex), `/about/`, `/services/`, `/contact/` (public), `/404.html` (noindex); plus `sitemap.xml`, `robots.txt`, `favicon.svg`. Per-route elements: skip link → `#main` (`BaseLayout.astro:31-35`), `<header>` + nav toggle button (`SiteHeader.astro:54-120`), `<main id="main">`, footer nav; Contact scheduler+mailto links (`[page].astro:74-83`); 404 recovery link (`404.astro:14-17`).
- **No-JS baseline:** base CSS keeps nav visible + toggle hidden until `data-nav-ready` (`global.css:122-170`, `SiteHeader.astro:8-13,90-119`); with JS off the site is fully navigable. Audit must disable JS and confirm this.
- **Focus-visible:** token ring `outline: var(--focus-width) solid var(--focus-color); outline-offset: var(--focus-offset)` (`tokens.css:542-544`); skip-link `:focus-visible` (`global.css:30-43`).
- **Reduced-motion:** token reset `transition-duration/animation-duration: 0.01ms; animation-iteration-count: 1` (`tokens.css:547-554`); site CSS (`global.css:173-178`). Audit emulates `prefers-reduced-motion: reduce`.
- **Motion tokens:** `--duration-fast: 150ms`, `--duration-panel: 220ms`, `--motion-press-distance: 2px` (`tokens.css:481-491`). Note: the runtime shell has no explicit panel motion beyond the reduced-motion reset.
- **Build isolation:** reuse the `buildShell()` outDir-guard pattern (`tests/shell.test.mjs:38-58`) or build to `dist/` via `npm run build`.
- **Contrast pairings:** canvas/text-1, nav-bg/nav-fg, nav-hover-bg/nav-hover-fg, link-fg, focus-color (`global.css:16-20,56-96`; tokens `tokens.css:104-120,200-236`). No automated contrast checker exists; spot-check via computed styles.
- **WCAG SC:** Reflow 1.4.10 (AA, 320 CSSpx), Resize Text 1.4.4 (AA, 200%), Keyboard 2.1.1 (A), Focus Visible 2.4.7 (AA), Bypass Blocks 2.4.1 (A), Focus Order 2.4.3 (A), Contrast 1.4.3 (AA), Non-text Contrast 1.4.11 (AA).
- **P02A acceptance.md format** (`homepage-art-direction/acceptance.md`): header metadata (Created/Status/Accepted at/Decided by/SHA-256s), Environment block, evidence sections, BLOCKED sub-gate section, Evidence paths, Resume guard, Decision. Overall `Status: accepted` while a specific gate is `BLOCKED` in its own section.
- **Evidence binary policy:** screenshots/logs → `.playwright-mcp/m2-accessibility-acceptance/` (gitignored, regenerable); `acceptance.md` + capture script → committed. `.playwright-mcp/` is gitignored (`.gitignore`).
- **Screen-reader BLOCKED:** probe confirmed no `orca`/`espeak-ng`/`espeak`/`nvda`. Re-open trigger: install a reader and re-run the smoke.

## Risks

- **Evidence stales on code change:** any code change after the audit invalidates the record. Mitigation: regenerate + re-commit `acceptance.md` at M2 close so the recorded hash matches the audited code; the acceptance is the M2-exit gate, not a permanent regression.
- **Blocked screen-reader keeps M2 honest:** the AT-smoke gap is a tracked re-open (install a reader), not a silent skip. A blocked browser environment keeps M2 in progress; it does not close the milestone (`spec.md:139-142`).
- **Capture script flakiness:** Chromium headless rendering can differ from headed; flaky timing. Mitigation: record environment, deterministic steps, wait on lifecycle events (not sleeps), screenshots as evidence, allow re-runs.
- **Audit finds a real defect:** STOP and escalate as a fix child; do not silently fix in this acceptance (scope discipline). A defect blocks acceptance until fixed.
- **False-pass zoom:** 200% zoom via CSS transform or `deviceScaleFactor` (DPR) is NOT WCAG 1.4.4 — both are raster/transform proxies, not browser-menu zoom. Mitigation: headless CDP produces a 720x450 + DPR-2 proxy for automated evidence, but real 200% acceptance requires a mandatory manual headed browser-zoom checkpoint; capture screenshots in both.

## Open Questions

Resolved during `/plan` (2026-07-22):

1. **Close-2 hash semantics:** a committed document cannot contain its own final commit SHA. Resolved invariant: `acceptance.md` records the **A1 audited commit** (the final A1 commit immediately before the acceptance docs commit); the acceptance-creating commit's first parent must equal that SHA, and no production files may change after A1 without a full recapture. The parent's literal "recorded hash equals current HEAD" wording will be clarified to this invariant at M2 aggregate close.

2. **Capture runtime:** dependency-free Node 24 + Chromium CDP (Playwright packages are not installed; `npx` cannot run a standalone script).

3. **Resize-text proof:** headless CDP cannot prove real browser-menu zoom; the 200% check is a mandatory manual headed checkpoint (headless proxy is evidence only).

---

## Related Tracks

- **Parent:** `m2-accessible-core-shell` (aggregate-close after this child + accessibility evidence).
- **Depends on:** `m2-contact-page` (complete `c6dfdf7`) — the last UI child; satisfies `all-ui-children-complete`.
- **Unblocks:** M2 aggregate close (close-1: all children complete; close-2: acceptance.md hash matches HEAD). No later UI child follows this.
- **Close handoff:** after this child closes, run the M2 aggregate close (verify all child ledgers complete + `acceptance.md` hash matches HEAD); update `.opencode/state.md` to mark M2 complete and activate the next milestone.
