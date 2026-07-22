# m2-accessibility-acceptance — Progress

## 2026-07-22 — Shipped (A1 capture + A2 acceptance; Quality Loop R1→R4 5/5)

### Commits
| Task | Phase | Commit | Message |
| --- | --- | --- | --- |
| plan | docs | `11b2235` | docs(m2): plan accessibility acceptance (A1/A2 TDD + decisions) |
| A1 | GREEN | `3ded07b` | chore(m2): add accessibility evidence capture script |
| A2 | docs | `3ccbf1f` | docs(m2): record accessibility acceptance (screen-reader BLOCKED) |

A1 was iterated through the Quality Loop (3 script-revision rounds before the
final A1 SHA `3ded07b`); A2 was amended twice to keep the audited-SHA invariant
(A2 first parent == A1 == `manifest.auditedCommit`). The script and acceptance
record are the only committed feature files; all browser evidence binaries live
under gitignored `.playwright-mcp/m2-accessibility-acceptance/`.

### A1 — Accessibility evidence capture
- `scripts/a11y-capture.mjs`: dependency-free Node 24 built-ins + installed
  Chromium over the Chrome DevTools Protocol (no Playwright — not installed;
  no new deps). Builds the site, serves it on a loopback preview, captures real
  browser evidence.
- Matrix: 45 scenarios (normal 20 / reduced-motion 10 / no-js 10 / zoom200 5)
  + 5 keyboard captures = 50 captures, 50 screenshots.
  - viewports: 320x800, 360x800, 768x1024, 1440x900 (320 = normative WCAG 1.4.10
    reflow width); zoom200 = 720x450 at DPR 2 (headless proxy only).
  - modes: normal, reduced-motion (`Emulation.setEmulatedMedia`), no-js
    (`Emulation.setScriptExecutionDisabled` before navigate), zoom200 (proxy).
- Per-scenario assertions: lang, single `main#main`, skip link, single
  canonical, route robots, single h1, route aria-current, no horizontal
  overflow, no console errors, no network failures, no external-origin
  requests; Contact no-form/no-iframe/no-privacy-link; 404 recovery link.
- Keyboard (per route @360x800, real `Input.dispatchKeyEvent`): 13 assertions
  incl skip-bypass (derived from header position), escape-focus-return, and
  fail-closed safety gates — skip-activate `Enter` only on
  `.skip-link[href="#main"]`, toggle `Space` only on `button.nav-toggle`
  (so a focus-order regression can never activate an external link), plus
  `no-external-requests` + `no-console-errors` + `no-network-failures`.
- Contrast (`getComputedStyle` at 1440x900 normal, oklch→sRGB + alpha
  composite): required pairs body-text/nav-link/skip-link (an unresolved
  required pair blocks `--strict`); main-link optional (no-element is honest
  N/A, not a defect).
- Fail-closed: `send()` timers cleared in `onmessage`; `process.exit(0)` on
  success / `process.exit(1)` on any failure; browser + preview spawned
  `detached:true` and cleaned via process-group kill on every exit path
  (including preview-startup timeout and launchBrowser partial failure).
- Evidence contract: `manifest.json` + `summary.md` + `screenshots/*.png`
  under `.playwright-mcp/m2-accessibility-acceptance/` (gitignored, regenerable).
  Manifest records `auditedCommit = git rev-parse HEAD`; `--expected-commit`
  is a drift guard.

### A2 — Acceptance record
- `.opencode/artifacts/m2-accessibility-acceptance/acceptance.md` in P02A
  format: metadata + audited commit, Environment, route/viewport matrix,
  Keyboard, Skip link (pass with note), Reflow, 200% resize, Reduced motion,
  No-JS, Console/network, Contrast, Screen reader (BLOCKED), Evidence paths
  (with manifest + manual-zoom200 SHA-256s), Resume guard, Decision.
- Audited-SHA invariant holds: A2 (`3ccbf1f`) first parent == A1 (`3ded07b`)
  == `manifest.auditedCommit` == acceptance.md audited commit.
- 404 wording corrected: the `/404.html` route served **200** on direct
  navigation (Astro preview returns 200 for an existing file); no 404 response
  occurred in the run; `isExpected404` is exercised by `--self-test` only.
- Manual 200% zoom: operator-verified PASS (no clipping/loss) and recorded
  durably in `.playwright-mcp/m2-accessibility-acceptance/manual-zoom200.json`
  (gitignored, SHA-256 in acceptance.md). The headless zoom200 is a proxy.

### Verification gates (all exit 0)
- `node scripts/a11y-capture.mjs --self-test`: PASS (matrix 45, slugs, path
  guard, contrast, classify, 404).
- `CHROME_BIN=/snap/bin/chromium node scripts/a11y-capture.mjs --strict
  --expected-commit 3ded07b...`: 50 captures, 50 screenshots, 0 failed, 0
  blocked; manifest `auditedCommit = 3ded07b`.
- `npm run check`: 0 errors, 0 warnings, 4 hints.
- `npm test`: 122/122 pass.
- `npm run build`: 5 pages.
- `npm run verify`: `verify: ok`.
- Documented regen command runtime-proven via a worktree at the audited SHA
  (exit 0, 50/50, auditedCommit match, worktree cleaned).

### Review (Quality Loop)
| Round | Score | Findings | Outcome |
| --- | --- | --- | --- |
| R1 | 3/5 | 6 real (F1–F8) | All fixed |
| R2 | 3/5 | 3 (A preview-leak, B keyboard network, C regen command) | A+B fixed; C mis-fixed |
| R3 | 3/5 | 1 (C: `git checkout <SHA> -- <path>` leaves HEAD at A2 → mismatch) | C corrected + runtime-proven |
| R4 | 5/5 | none — all prior closed; no regressions | accepted |

Two same-score rounds (R2, R3) triggered Quality Loop escalation to the user;
the user authorized a fix+re-review each time. R4 reviewer independently ran
the documented worktree regen command (exit 0, 50/50, auditedCommit match,
worktree cleaned) and confirmed scope (only the 2 declared files) + invariant
(audited SHA + both SHA-256s). No production code changed anywhere in this
child (A1/A2 touch only `scripts/a11y-capture.mjs` + `acceptance.md`).

### Deviations / Discoveries
- Skip-link: activating "Skip to content" moves the focus starting point past
  the header (bypass achieved), but focus itself falls to `BODY` because
  `<main id="main">` (`src/layouts/BaseLayout.astro:33`) has no `tabindex="-1"`.
  Recorded honestly as **pass with note**; by operator decision the
  `tabindex="-1"` polish is deferred to a later slice and does not block
  acceptance. Not a silent pass, not a silent fix.
- Screen-reader smoke is **BLOCKED** (no reader installed: orca/nvda/espeak-ng/
  espeak all absent), recorded honestly with a re-open trigger. This is the
  only outstanding gate.
- The parent close-2 "recorded hash == HEAD" requirement is self-referential by
  construction; interpreted as audited-commit sense (acceptance descends from
  the A1 audited SHA) and flagged for reconciliation at the M2 aggregate close.

### Lifecycle (deferred — needs user decision)
The parent ledger still marks contact/accessibility as pending and M2 as in
progress (e.g. `.opencode/state.md` Active milestone line, parent
`m2-accessible-core-shell/prd.json`, `plan.md`, `spec.md`). A broader
parent-doc sync + M2 aggregate close (mark parent complete, reconcile the
self-referential hash wording) is a separate documentation-only step; not
mixed into A1/A2. Ask user before synchronizing.
