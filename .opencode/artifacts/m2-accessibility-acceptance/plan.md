# M2 Accessibility Acceptance Implementation Plan

> **For Claude:** Implement this plan task-by-task.

**Goal:** Produce truthful, reproducible browser accessibility evidence for all five M2 routes and a durable acceptance record tied to the exact audited commit, without changing production code or adding dependencies.

**Discovery Level:** 3 — user-selected Deep. Research uncovered and resolved three contract issues:

1. Standalone Playwright modules are not installed or resolvable; use the repository's existing dependency-free Chromium/CDP pattern.
2. A committed document cannot contain its own final commit SHA; record the A1 audited commit and enforce a production-drift guard.
3. Headless CDP cannot prove real browser-menu zoom; require a manual headed 200% checkpoint.

**Context Budget:** Approximately 48%: A1 33%, A2 12%, final verification 3%.

**Effort:** L — approximately one working day, primarily due to the CDP harness and manual evidence review.

## Constraints

- No production changes under `src/`, `public/`, runtime configuration, or brand CSS.
- No new package or system dependencies.
- Use Node 24 built-ins and installed Chromium, not an unresolved Playwright import.
- Retain required 360px, 768px, and desktop coverage; add 320px as the normative WCAG 1.4.10 reflow gate.
- Automated zoom emulation is evidence only; actual WCAG 1.4.4 acceptance requires manual browser zoom at 200%.
- Real screen-reader smoke remains a documented BLOCKED sub-gate.
- Any accessibility defect stops this child and creates a separate fix slice.
- Transient evidence remains under gitignored `.playwright-mcp/`.
- Do not touch `.opencode/state/session-summary.md` or `astro.config.preview.mjs`.

## Non-goals

- No permanent `tests/e2e/` suite.
- No accessibility remediation inside this child.
- No broad WCAG certification or launch-compliance claim.
- No M3, homepage, route, copy, CMS, or deployment work.
- No external scheduler or mail-link navigation during capture.

## Must-Haves

### Observable Truths

1. Every route supports logical keyboard traversal, reverse traversal, visible focus, skip navigation, and no keyboard trap.
2. Mobile navigation opens by keyboard, closes with Escape, and returns focus to its toggle.
3. Content does not horizontally overflow or visibly clip at 320, 360, 768, or 1440 CSS-pixel widths.
4. Real 200% browser zoom preserves content and functionality on every route.
5. No-JS and reduced-motion modes retain usable content and navigation.
6. Applicable text and non-text color pairs pass automated ratios and visual review.
7. Evidence identifies its audited commit, environment, failures, blocked gates, and regeneration path.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Capture runner | Build, CDP, assertions, screenshots, fail-closed exit | `scripts/a11y-capture.mjs` |
| Machine evidence | Environment, matrix, assertions, focus traces, errors | `.playwright-mcp/m2-accessibility-acceptance/manifest.json` |
| Evidence summary | Reviewable result overview | `.playwright-mcp/m2-accessibility-acceptance/summary.md` |
| Automated captures | Matrix and keyboard screenshots | `.playwright-mcp/m2-accessibility-acceptance/screenshots/` |
| Manual zoom record | Real 200% zoom result for five routes | `.playwright-mcp/m2-accessibility-acceptance/manual-zoom200.json` |
| Acceptance record | Durable P02A-style decision and resume guard | `.opencode/artifacts/m2-accessibility-acceptance/acceptance.md` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| Capture script | Audited output | Build and verify before preview | Capturing stale output |
| Node script | Chromium | Loopback CDP WebSocket | Mistaking static inspection for browser evidence |
| Keyboard commands | Focus trace | Real CDP key events | Synthetic DOM events hiding interaction defects |
| Browser events | Manifest | Runtime, Log, Network domains | Missing exceptions or HTTP failures |
| Computed styles | Contrast results | WCAG luminance and alpha compositing | False pass on layered backgrounds |
| Headless zoom proxy | Manual zoom | Explicit operator checkpoint | Calling DPR or page scale real zoom |
| A1 SHA | Acceptance record | Recorded audited commit | Self-referential or stale hash |
| Evidence | Decision | Fail/blocked/pass rules | Cherry-picking successful captures |

## Dependency Graph

```text
Task A1:
  needs: approved CDP, hash, and manual-zoom decisions
  creates: capture script, audited A1 commit, transient evidence
  has_checkpoint: yes — real 200% browser zoom

Task A2:
  needs: A1 committed and recaptured; manual zoom passed
  creates: durable acceptance.md
  has_checkpoint: yes — final acceptance/close confirmation

Wave 1: A1
Wave 2: A2
```

## Task A1: Capture Reproducible Browser Evidence

**Files:**

- `.opencode/artifacts/m2-accessibility-acceptance/spec.md`
- `.opencode/artifacts/m2-accessibility-acceptance/prd.json`
- `scripts/a11y-capture.mjs`

**Risk:** A plausible screenshot generator could miss browser errors, use fake zoom, capture dirty source, or silently retain stale evidence.

### Steps

1. **Align the active contract with the approved decisions.**
   - Replace "Playwright via npx" with dependency-free Node 24 + Chromium CDP.
   - Add 320x800 as the normative reflow viewport.
   - Separate headless zoom proxy from mandatory manual 200% browser zoom.
   - Define the audited SHA as the final A1 commit, not the later acceptance commit.
   - Verify only the declared A1 files appear in the scoped diff.

2. **Establish the baseline.**

   ```bash
   npm run check && npm test && npm run build && npm run verify
   ```

   Expected: zero check errors, 122 tests passing, five HTML pages built, and `verify: ok`. Stop on any failure.

3. **RED — write self-test contracts before helper implementations.**
   - Add `--self-test` using `node:assert/strict`.
   - Cover: locked output-path containment; 45-scenario matrix construction; route-slug sanitization; black/white contrast = 21:1; alpha compositing; local versus external request classification; expected `/404.html` document handling.
   - Run:

   ```bash
   node scripts/a11y-capture.mjs --self-test
   ```

   Expected RED: assertion failure from unimplemented helpers.

4. **GREEN — implement and pass pure helper contracts.**
   - Implement `buildMatrix`, `assertEvidencePath`, `parseCssColor`, `compositeColor`, `relativeLuminance`, `contrastRatio`, and response classification.
   - Rerun `--self-test`; expect all named contracts to pass without launching Chromium.

5. **RED — exercise one browser scenario before the harness exists.**

   ```bash
   CHROME_BIN=/snap/bin/chromium node scripts/a11y-capture.mjs --routes / --viewports 360x800 --modes normal --strict
   ```

   Expected RED: explicit missing preview/CDP capability, nonzero exit, and no false PASS manifest.

6. **GREEN — implement the isolated process and CDP harness.**
   - Use only Node built-ins: child processes, filesystem, temporary directories, crypto, `fetch`, and `WebSocket`.
   - Run `npm run build`, then `npm run verify`.
   - Start Astro preview on loopback; fail rather than terminating an unrelated process if the selected port is occupied.
   - Launch the first available `CHROME_BIN`, `/snap/bin/chromium`, `/usr/bin/google-chrome`, or `/usr/bin/chromium-browser`.
   - Bind remote debugging to loopback and use a temporary browser profile.
   - Use browser-level `Target` sessions plus `Page`, `Runtime`, `Network`, `Log`, `Input`, and `Emulation`.
   - Wait on lifecycle and in-flight request state, not arbitrary sleep intervals.
   - Close only child processes created by the script; always clean up in `finally`.
   - Rerun the root scenario; expect one capture and zero failures.

7. **RED — run the full strict contract before all modes exist.**

   ```bash
   CHROME_BIN=/snap/bin/chromium node scripts/a11y-capture.mjs --strict
   ```

   Expected RED: missing scenario/assertion identifiers and nonzero exit.

8. **GREEN — implement the complete automated matrix.**

   | Mode | Routes | Viewports | Scenarios |
   |---|---:|---|---:|
   | Normal/reflow | 5 | 320x800, 360x800, 768x1024, 1440x900 | 20 |
   | Reduced motion | 5 | 360x800, 1440x900 | 10 |
   | No JavaScript | 5 | 360x800, 1440x900 | 10 |
   | 200% headless proxy | 5 | 720x450 CSS at DPR 2 | 5 |
   | **Total** | | | **45** |

   For every applicable scenario, record: navigation status and final URL; `html[lang]`, one `main#main`, one `h1`, and skip-link target; horizontal-overflow metrics with a one-pixel rounding allowance; visible-element bounding boxes plus screenshot review requirement; real `Input.dispatchKeyEvent` focus traversal; first-Tab skip-link exposure and meaningful bypass behavior; nav Enter/Space operation, Escape close, and focus return; Shift+Tab recovery and trap detection; focus outline style, width, and contrast; no-JS toggle hidden, primary links visible and keyboard reachable; reduced-motion media-query match and suppressed motion durations; body, navigation, link, control, and focus contrast ratios; page exceptions, console errors, HTTP failures, and external requests.

   Never activate the Calendly or mail links; inspect only semantics, text, `href`, and `rel`.

9. **Write deterministic evidence.**
   - Write `manifest.json` even on failure, then exit nonzero.
   - Write `summary.md`.
   - Produce exactly 45 matrix screenshots plus one keyboard/focus screenshot per route.
   - Remove stale files only after confirming the target is the locked ignored evidence directory.

10. **Validate and review the provisional evidence.**

   ```bash
   node --input-type=module -e '
   import { readFile } from "node:fs/promises";
   const m = JSON.parse(await readFile(
     ".playwright-mcp/m2-accessibility-acceptance/manifest.json",
     "utf8"
   ));
   if (m.summary.failed !== 0) throw new Error(JSON.stringify(m.summary));
   if (m.captures.length !== 45) throw new Error("expected 45 captures, got " + m.captures.length);
   if (m.summary.screenshots < 50) throw new Error("keyboard screenshots missing");
   console.log("a11y evidence: 45 scenarios, zero automated failures");
   '
   ```

   Review all captures with a human or vision reviewer for clipping, overlap, readable focus, and suspicious two-axis scrolling. Any defect stops A1.

11. **Commit A1, then recapture the exact audited revision.**
   - Commit label: `chore(m2): add accessibility evidence capture script`.
   - Record the resulting A1 SHA.
   - Rerun:

   ```bash
   CHROME_BIN=/snap/bin/chromium node scripts/a11y-capture.mjs --strict --expected-commit "$(git rev-parse HEAD)"
   ```

   The manifest's `auditedCommit` must equal current HEAD, and no build-relevant working change may be included.

12. **Manual headed 200% checkpoint.**
   - At the recorded A1 SHA, open all five routes in a visible Chromium/Chrome session.
   - Set actual browser zoom to 200%.
   - Check text clipping, overlap, loss of content, horizontal scrolling, and keyboard functionality.
   - Record five route results, browser environment, operator, audited SHA, and screenshots in `manual-zoom200.json`.

   Outcomes: PASS → proceed to A2; UNAVAILABLE → record zoom as BLOCKED, do not accept or close M2; DEFECT → stop and create an accessibility-fix child.

   Finally rerun the four static gates.

## Task A2: Record the Durable Acceptance Decision

**File:** `.opencode/artifacts/m2-accessibility-acceptance/acceptance.md`

**Needs:** A1 committed, strict capture green, visual review complete, and real 200% browser zoom passed.

**Risk:** Acceptance text could overstate WCAG coverage, conceal blocked AT testing, or point at stale evidence.

### Steps

1. **Verify A2 preconditions.**
   - `manifest.json` reports zero automated failures.
   - Its `auditedCommit` equals current A1 HEAD.
   - Manual zoom evidence reports PASS for all five routes and the same SHA.
   - Screen reader is the only expected blocked sub-gate.
   - If manual zoom is blocked, change the record's overall status to `blocked` and stop before M2 close.

2. **RED — run the durable-record contract before creating it.**

   ```bash
   node --input-type=module -e '
   import { readFile } from "node:fs/promises";
   const text = await readFile(
     ".opencode/artifacts/m2-accessibility-acceptance/acceptance.md",
     "utf8"
   );
   const required = [
     "## Environment", "## Audited revision", "## Route and viewport matrix",
     "## Keyboard", "## Reflow", "## Resize text at 200%", "## Reduced motion",
     "## No-JavaScript", "## Contrast", "## Console and network",
     "## Screen reader (BLOCKED)", "## Evidence paths", "## Resume guard", "## Decision"
   ];
   for (const heading of required) {
     if (!text.includes(heading)) throw new Error("missing " + heading);
   }
   '
   ```

   Expected RED: missing file.

3. **Create P02A-style metadata and environment sections.**
   - Created/status/accepted-at/decided-by.
   - Audited A1 commit SHA.
   - Manifest SHA-256.
   - Node, npm, Chromium version/path, operating environment, CDP mechanism, and preview origin.
   - Explicit statement that Playwright packages were not installed or used.

4. **Record all evidence and limitations.**
   - Route/viewport/mode result matrix.
   - Keyboard, bypass, focus order, focus visibility, and trap results.
   - 320px normative reflow and requested viewport results.
   - Headless proxy clearly distinguished from the real manual 200% check.
   - Reduced-motion, no-JS, contrast, console, and network results.
   - Dedicated `Screen reader (BLOCKED)` section with the exact environment probe and re-open trigger.
   - State that this is an M2 acceptance record, not a full WCAG certification or launch claim.

5. **Add evidence paths, resume guard, and decision.**
   - Resume guard verifies: recorded A1 SHA exists; manifest and manual-zoom records carry that SHA; the commit that introduces `acceptance.md` has A1 as its first parent; subsequent changes outside `.opencode/` invalidate the evidence.
   - Decision is `accepted` only when all browser and manual gates pass.
   - Screen-reader testing remains explicitly blocked.

6. **GREEN — rerun the heading and SHA validators.**
   - Required sections must all exist.
   - Recorded SHA must equal current A1 HEAD before the acceptance commit.
   - Review the uncommitted record for truthful wording and evidence correspondence.
   - Commit label: `docs(m2): record accessibility acceptance (screen-reader BLOCKED)`.

7. **Verify the immutable relationship and final gates.**
   - Identify the commit that first added `acceptance.md`.
   - Assert its first parent equals the recorded A1 SHA.
   - Assert all later changes are artifact documentation only; any production drift requires a full recapture.
   - Run `npm run check && npm test && npm run build && npm run verify`.
   - Ask the user for final child acceptance. Do not perform the M2 aggregate close without separate confirmation.

## Verification

The child is ready for acceptance only when:

- `node scripts/a11y-capture.mjs --self-test` passes.
- Strict capture produces 45 scenarios, at least 50 automated screenshots, and zero automated failures.
- All five manual 200% zoom checks pass.
- Visual review finds no clipping, overlap, invisible focus, or unexplained overflow.
- `acceptance.md` passes its section and audited-SHA checks.
- All four repository gates exit zero.
- Review finds no production changes, new dependencies, external navigation, stale evidence, or overstated claims.

## Risks and Failure Behavior

- Chromium/CDP unavailable: record A1 blocked; M2 remains open.
- Manual browser zoom unavailable: record browser-zoom blocked; do not accept.
- Screen reader unavailable: retain the approved BLOCKED sub-gate and re-open trigger.
- Accessibility defect: stop; create a separate fix child and rerun all evidence after its commit.
- Ambiguous contrast or visual clipping: require human review; unresolved evidence blocks acceptance.
- Evidence SHA mismatch or production drift: discard stale evidence and recapture.
- Expected 404 behavior: distinguish the `/404.html` document response from unexpected subresource failures; record the actual status.
- Process failure: write partial diagnostic evidence, exit nonzero, and terminate only owned child processes.

## Privacy and Security

- Bind preview and CDP to loopback.
- Use an isolated temporary browser profile.
- Do not navigate to external Contact destinations.
- Abort on unexpected non-local requests.
- Do not commit browser profiles, screenshots, logs, or environment dumps.
- Evidence contains public site output only; reject credentials or private records.
- Keep the two unrelated user-owned workspace changes untouched.

## Aggregate-Close Handoff

The parent's literal "recorded hash equals current HEAD" wording is self-referential once `acceptance.md` is committed. At aggregate close, clarify it to: (1) the acceptance record identifies the A1 audited commit; (2) the acceptance-creating commit has A1 as its first parent; (3) no production files changed after A1 without a complete recapture.

## Constitutional Compliance

Proposed-content scan: 8/8 PASS — no unsafe Git operations; no dependency additions; no type-safety suppressions; no credentials or private evidence; no production edits; A1 has exactly three tracked files and A2 has one; transient evidence remains ignored; user-owned workspace changes remain untouched.

## Open Questions

None. The user resolved: capture runtime (dependency-free CDP); revision identity (A1 audited commit plus drift guard); resize-text proof (manual headed 200% checkpoint).
