---
status: planned
effort: M
slice: P02A
depends_on:
  - "Plan 00 Task 1 repository baseline approved and committed"
gates:
  - "P02B canonicalization and registered-package distribution"
must_haves:
  truths:
    - "A reviewer can experience one expressive, finite homepage sequence without waiting for animation to access content or navigation."
    - "The complete page is readable, navigable, and correctly composed with JavaScript unavailable or reduced motion enabled."
    - "Mobile primary navigation remains available when JavaScript is unavailable or the enhancement script fails."
    - "Ryan's accept, revise, or reject decision survives the review session in a reproducible acceptance record."
  artifacts:
    - path: "docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html"
      provides: "Canonical in-place Signal Path prototype"
    - path: ".opencode/artifacts/homepage-art-direction/acceptance.md"
      provides: "Browser matrix, performance result, decision, and rollback evidence"
    - path: ".opencode/artifacts/homepage-art-direction/implementation-notes.md"
      provides: "Execution discoveries and justified deviations"
    - path: ".opencode/state.md"
      provides: "Live P02A decision and P02B eligibility"
  key_links:
    - from: "docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html"
      to: ".opencode/artifacts/homepage-art-direction/acceptance.md"
      via: "accepted prototype SHA-256 and reproducible review record"
    - from: ".opencode/artifacts/homepage-art-direction/acceptance.md"
      to: ".opencode/artifacts/homepage-art-direction-canonicalization/plan.md"
      via: "Status: accepted prerequisite"
    - from: ".opencode/artifacts/homepage-art-direction/acceptance.md"
      to: ".opencode/state.md"
      via: "accepted, revision-requested, or rejected live status"
---

# Plan: Signal Path Prototype and Acceptance

## Goal

Prove **Signal Path — Editorial Cut** in the canonical landing page and obtain a
durable visual/accessibility/performance decision before changing any distributed mirror
or production website file.

## Constraints

- Refine `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html` in place; do
  not create another landing-page variant or public route.
- Preserve existing copy, claims, evidence labels, image files, source order, and the
  single semantic H1. New wrappers may support crops only when reading order is unchanged.
- Default HTML/CSS is the final readable composition. Motion may animate from transient
  states only after JavaScript and the motion preference are known.
- Keep the existing raster System Conductor unchanged. A decorative signal overlay is
  `aria-hidden`, inert, and aligned in the image's `1254 × 1254` coordinate space.
- Add no font, runtime, analytics, package, route, claim, icon family, or network request.
- Prohibit parallax, pinned or hijacked scrolling, marquees, cursor effects, particles,
  splash screens, autoplay media, decorative loops, bounce/elastic easing, and content
  that requires animation to become available.
- P02A may modify the canonical page, its own two execution records, and live state only.
  `DESIGN.md`, local mirrors, capture, registered package, checklist closeout, and
  production Astro work belong to P02B or later plans.

## Dependency Graph

```text
Plan 00 Task 1 repository baseline commit
  -> Task 1: canonical prototype + no-JS navigation repair
       -> Task 2: reproducible review + Ryan decision
            -> accepted: P02B
            -> revise: return to Task 1
            -> rejected: restore accepted baseline; P02B remains blocked
```

## Task 1 — Build the Canonical Prototype

**Needs:** Plan 00 Task 1 repository baseline approved and committed; approved Signal
Path direction.
**Creates:** one reviewable prototype and an execution log.
**Checkpoint metadata:** `has_checkpoint: false`.
**Files:**

- `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html`
- `.opencode/artifacts/homepage-art-direction/implementation-notes.md`

### Steps

1. Prove and record the accepted baseline before first entry, or prove the last reviewed
   state before a bounded revision:

   ```bash
   python3 - <<'PY'
   from hashlib import sha256
   from pathlib import Path
   import re

   root = Path("docs/Ryan-Brosas-Brand-System")
   canonical = (root / "ryan-brosas-landing-page.html").read_bytes()
   showcase = (root / "showcase-landing-page.html").read_bytes()
   notes_path = Path(".opencode/artifacts/homepage-art-direction/implementation-notes.md")
   acceptance_path = Path(".opencode/artifacts/homepage-art-direction/acceptance.md")
   notes = notes_path.read_text(encoding="utf-8") if notes_path.exists() else ""

   def digest(data: bytes) -> str:
       return sha256(data).hexdigest()

   baselines = re.findall(r"^Baseline SHA-256: ([0-9a-f]{64})$", notes, re.MULTILINE)
   if not baselines:
       assert canonical == showcase, "initial canonical/showcase parity failed"
       print(f"Baseline SHA-256: {digest(canonical)}")
       print("entry mode: initialize")
   else:
       assert len(baselines) == 1, f"expected one baseline hash, found {len(baselines)}"
       baseline = baselines[0]
       assert digest(showcase) == baseline, "showcase no longer matches baseline"
       assert acceptance_path.exists(), "revision acceptance record missing"
       acceptance = acceptance_path.read_text(encoding="utf-8")
       statuses = re.findall(r"^Status: revision-requested$", acceptance, re.MULTILINE)
       prototypes = re.findall(
           r"^Prototype SHA-256: ([0-9a-f]{64})$", acceptance, re.MULTILINE
       )
       assert len(statuses) == 1, "acceptance is not uniquely revision-requested"
       assert len(prototypes) == 1, f"expected one prototype hash, found {len(prototypes)}"
       prototype = prototypes[0]
       assert digest(canonical) == prototype, "canonical changed since review"
       print("revision baseline: PASS")
   PY
   ```

   Expected on first entry: prints the full `Baseline SHA-256` and `entry mode:
   initialize`; record that exact field once under **Baseline** in
   `implementation-notes.md`. Expected on revision: prints `revision baseline: PASS`.
   Any other state stops the task for investigation.

2. Repair the existing mobile navigation as progressive enhancement before adding
   motion. The base mobile CSS keeps primary links visible and hides the disclosure
   trigger. Bind all disclosure handlers first; only then add a `data-nav-ready` state
   that reveals the trigger and permits the closed state to hide links. In enhanced
   mode, keep `aria-expanded` and open state synchronized; `Escape` closes the menu and
   returns focus to the trigger; ordinary links and Tab order remain usable. A failure
   before readiness must leave links visible and the inert trigger hidden.

3. Implement the approved sequence without changing meaning:
   - hero: two or three oversized cropped headline planes, one structural rule sweep,
     and one finite coral signal trace over the existing Conductor cable;
   - manifesto: one decisive color-plane cut;
   - five-step system: restrained number/rule choreography, with no pinning;
   - selected story media: grid-aligned masks while captions, labels, links, and status
     text stay outside clipping regions;
   - CTA/footer: quiet final composition.

4. Keep navigation readiness independent from motion readiness. Prepare every motion
   target and handler while the page remains in its final state; use
   `requestAnimationFrame` to arm the sequence and add `data-motion-ready` only as the
   final successful initialization step. CSS may expose transient states only under that
   marker. If `requestAnimationFrame`, an optional animation API, or initialization
   throws, the marker remains absent and every region stays final and visible.

5. Keep functional transitions at `150–220ms`; reserve `400–700ms` for editorial
   masks, crops, and rules. The hero settles in about one second, runs at most once per
   page load, and leaves no idle animation. Prefer transform, opacity, clipping, and a
   finite SVG stroke; remove any effect that needs layout animation, persistent
   `will-change`, expensive filters, or large travel.

6. Create/update `implementation-notes.md` with **Deviations** and **Discoveries**.
   Record headline breaks, trace geometry, any dropped effect, and every optional motion
   API used. If there is no optional API beyond CSS and `requestAnimationFrame`, record
   `Optional motion APIs: none`; do not silently widen scope.

### Verification

```bash
python3 -m http.server 4173 --bind 127.0.0.1 \
  --directory docs/Ryan-Brosas-Brand-System
```

Open `http://127.0.0.1:4173/ryan-brosas-landing-page.html`. Expected: HTTP 200;
all stylesheet, image, and SVG requests are local and 200; no console error; one H1;
no hidden copy, reading-order change, layout shift, repeated sequence, or animation
activity after settlement. Task 2 performs the complete matrix.

**Risk:** a raster-aligned trace can drift. Fit it in the source image coordinate system
and remove it rather than accept visible misalignment.

## Task 2 — Run the Acceptance Gate

**Needs:** Task 1.
**Creates:** `.opencode/artifacts/homepage-art-direction/acceptance.md` with one of
`accepted`, `revision-requested`, or `rejected`.
**Checkpoint metadata:** `has_checkpoint: true`; `checkpoint: decision`.
**Files:**

- `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html` (rejection rollback only)
- `.opencode/artifacts/homepage-art-direction/acceptance.md`
- `.opencode/state.md`

### Reproducible setup

1. Load the `browser-testing-with-devtools` and `accessibility-audit` skills. Start the
   static server from Task 1. Record the output of:

   ```bash
   /snap/bin/chromium --version
   sha256sum docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html
   ```

   If that browser path is unavailable, stop and record the blocker rather than
   substituting an unrecorded browser.

2. Use these exact CSS-pixel viewports:

   | Mode | Viewports |
   |---|---|
   | Layout/reflow | `360×800`, `390×844`, `430×932`, `600×960`, `768×1024`, `820×1180`, `1024×768`, `1366×768`, `1440×900`, `1920×1080` |
   | Visual decision | `390×844`, `1440×900` in normal and reduced motion |
   | No JavaScript | `390×844`, `1440×900` |
   | Zoom/reflow | `1440×900` at 200%; `844×390` mobile landscape |

3. Store transient review evidence under the M0-ignored directory
   `.playwright-mcp/homepage-art-direction/` using these exact names:
   `normal-390x844.png`, `normal-1440x900.png`, `reduced-390x844.png`,
   `reduced-1440x900.png`, `no-js-390x844.png`, `no-js-1440x900.png`, and
   `init-failure-390x844.png` and `motion-init-failure-390x844.png`, plus
   `performance-390x844-run-{1,2,3}.json`. If implementation notes name an optional
   motion API, also save `unsupported-api-390x844.png`. Do not commit traces or captures;
   the durable result is the acceptance record.

### Checks

- **Fallbacks:** emulate `prefers-reduced-motion: reduce` before navigation; disable
  JavaScript before navigation for the no-JS cases. Both show the final composition
  immediately. At 390px, all primary navigation links remain visible without JavaScript.
- **Initialization failure:** at `390×844`, inject before navigation:
  `EventTarget.prototype.addEventListener = () => { throw new Error("intentional nav-init failure") }`.
  Expected: the deliberate error appears, `data-nav-ready` is absent, primary links stay
  visible, and the disclosure trigger stays hidden. Remove the injection after capture.
- **Motion initialization failure:** in a separate `390×844` context, inject before
  navigation:
  `window.requestAnimationFrame = () => { throw new Error("intentional motion-init failure") }`.
  Expected: the enhanced navigation still works, `data-motion-ready` is absent, every
  animated region is in its final visible state, and only the deliberate error appears.
  Remove the injection after capture.
- **Unsupported optional API:** for each optional motion API named in
  `implementation-notes.md`, remove or replace it with `undefined` before navigation in
  a separate `390×844` context. Expected: final visible composition, working navigation,
  and no `data-motion-ready`. If notes say `Optional motion APIs: none`, record that this
  case is not applicable rather than inventing an API.
- **Keyboard:** traverse every link/button in DOM order. Focus is visible and unclipped;
  the enhanced mobile menu works by keyboard; `Escape` closes it and restores trigger
  focus; no trap exists.
- **Screen reader:** smoke-test headings, primary navigation, hero image/overlay, and
  masked story content with an available real screen reader (Orca, NVDA, or VoiceOver),
  recording product/version. If none is available, acceptance is blocked rather than
  inferred from ARIA alone.
- **Responsive:** no horizontal page scroll, obscured copy, inaccessible caption,
  clipped focus, changed document order, or animation-created layout shift at any matrix
  size.
- **Network/console:** outside the two deliberate failure-injection contexts, no external
  request, failed local request, console error, or new storage/analytics activity.
- **Performance:** at `390×844`, use Chromium DevTools Performance with cache disabled,
  local network/no network throttle, and 4× CPU slowdown. Record three cold navigations
  from trace start through two seconds after `load`. Each run must show no
  motion-attributable main-thread task over `50ms`, `CLS 0.00` during choreography, one
  finite sequence, and no post-settle animation work. Record the three results and any
  untested browser risk in `acceptance.md`.

### Decision and recovery

Before pausing, write the complete review record with baseline hash, environment, matrix,
screen-reader result, three trace results, and exact fields `Status: pending-review`,
`Prototype SHA-256: <hash>`, and `P02B eligibility: no`. Then show Ryan the
normal/reduced desktop and mobile states and ask for one decision. This persisted pending
record is the checkpoint handoff. Before asking, replace the prior live P02 status lines
in `.opencode/state.md` with exactly `**P02A status:** pending review` and
`**P02B status:** blocked by P02A`; never append duplicate status lines.

After Ryan responds, but before changing `Status` or the canonical file, run this resume
guard:

```bash
python3 - <<'PY'
from hashlib import sha256
from pathlib import Path
import re

root = Path("docs/Ryan-Brosas-Brand-System")
canonical = (root / "ryan-brosas-landing-page.html").read_bytes()
showcase = (root / "showcase-landing-page.html").read_bytes()
acceptance = Path(".opencode/artifacts/homepage-art-direction/acceptance.md").read_text(encoding="utf-8")
notes = Path(".opencode/artifacts/homepage-art-direction/implementation-notes.md").read_text(encoding="utf-8")

statuses = re.findall(r"^Status: pending-review$", acceptance, re.MULTILINE)
prototypes = re.findall(r"^Prototype SHA-256: ([0-9a-f]{64})$", acceptance, re.MULTILINE)
baselines = re.findall(r"^Baseline SHA-256: ([0-9a-f]{64})$", notes, re.MULTILINE)
assert len(statuses) == 1, "acceptance is not uniquely pending-review"
assert len(prototypes) == 1, f"expected one prototype hash, found {len(prototypes)}"
assert len(baselines) == 1, f"expected one baseline hash, found {len(baselines)}"
assert sha256(canonical).hexdigest() == prototypes[0], "canonical changed during review"
assert sha256(showcase).hexdigest() == baselines[0], "showcase baseline changed during review"
print("decision resume guard: PASS")
PY
```

Expected: prints `decision resume guard: PASS`. Any mismatch invalidates the displayed
review state; do not persist Ryan's decision until the prototype is reviewed again.

- **Accept:** after the resume guard passes, set `Status: accepted`; preserve the
  canonical prototype; do not edit
  mirrors or production files; set `P02B eligibility: yes`; replace the live lines with
  `**P02A status:** accepted` and `**P02B status:** pending distribution`.
- **Revise:** after the resume guard passes, set `Status: revision-requested`, list
  bounded changes, and return to Task 1; keep `P02B eligibility: no`; update live state.
  Replace the live lines with `**P02A status:** revision requested` and
  `**P02B status:** blocked by P02A`. Do not mark P02A complete.
- **Reject:** after the resume guard passes, restore the pre-prototype accepted source
  atomically from the untouched mirror before setting `Status: rejected`:

  ```bash
  python3 - <<'PY'
  from hashlib import sha256
  import os
  from pathlib import Path
  import re
  import stat

  root = Path("docs/Ryan-Brosas-Brand-System")
  canonical_path = root / "ryan-brosas-landing-page.html"
  canonical = canonical_path.read_bytes()
  showcase = (root / "showcase-landing-page.html").read_bytes()
  acceptance = Path(".opencode/artifacts/homepage-art-direction/acceptance.md").read_text(encoding="utf-8")
  notes = Path(".opencode/artifacts/homepage-art-direction/implementation-notes.md").read_text(encoding="utf-8")
  statuses = re.findall(r"^Status: pending-review$", acceptance, re.MULTILINE)
  prototypes = re.findall(r"^Prototype SHA-256: ([0-9a-f]{64})$", acceptance, re.MULTILINE)
  baselines = re.findall(r"^Baseline SHA-256: ([0-9a-f]{64})$", notes, re.MULTILINE)
  assert len(statuses) == 1, "acceptance is not uniquely pending-review"
  assert len(prototypes) == 1, f"expected one prototype hash, found {len(prototypes)}"
  assert len(baselines) == 1, f"expected one baseline hash, found {len(baselines)}"
  baseline = baselines[0]
  assert sha256(canonical).hexdigest() == prototypes[0], "canonical changed during review"
  assert sha256(showcase).hexdigest() == baseline, "showcase baseline drifted"
  temporary = canonical_path.with_name(f".{canonical_path.name}.rollback.tmp")
  assert not temporary.exists(), f"remove stale rollback file before continuing: {temporary}"
  try:
      temporary.write_bytes(showcase)
      os.chmod(temporary, stat.S_IMODE(canonical_path.stat().st_mode))
      os.replace(temporary, canonical_path)
  finally:
      if temporary.exists():
          temporary.unlink()
  restored = canonical_path.read_bytes()
  assert restored == showcase
  assert sha256(restored).hexdigest() == baseline
  print(f"rollback restored: {baseline}")
  PY
  ```

  Expected: prints `rollback restored: <baseline>`. Only then set `Status: rejected`,
  record rollback proof, keep `P02B eligibility: no`, and update live state to
  exactly `**P02A status:** rejected; canonical baseline restored` and
  `**P02B status:** blocked by P02A`; P02B remains blocked.

## Verification

P02A succeeds only when `acceptance.md` says `Status: accepted`, names the exact
prototype hash and review environment, all required checks pass, and no tracked
repository file outside the canonical page, P02A acceptance record, implementation
notes, and live state changed. Acceptance intentionally leaves the canonical page ahead
of its mirrors until P02B; that controlled divergence blocks distribution and production
translation.

## Risks & Failure Behavior

- Script/API failure or reduced motion leaves the final composition visible; motion has
  no retry or recovery UI because it is nonessential.
- A misaligned signal trace is removed, not patched with fragile breakpoint-specific
  offsets.
- A failed browser, screen-reader, network, or performance check keeps P02A in progress.
- Rejection restores canonical/showcase parity before the slice stops.
- Motion must never relabel Proposed/Open evidence as Verified or imply an unsupported
  workflow state.

## Privacy & Security

- The page makes no external request and collects no analytics, interaction, device, or
  preference data.
- Transient traces/captures are not committed because they can contain local URLs or
  machine details. `acceptance.md` contains summarized results only.
- Decorative overlays are inert and `aria-hidden`; no new script, link, upload, or
  credential surface is introduced.

## Open Questions

- `[UNCERTAIN: Headline breaks and trace geometry require responsive tuning; they are
  not permission to change copy, assets, or brand identity.]`

## Next Command

Do not change `.opencode/artifacts/.active`; it continues to track M0 until M0 closes.
Do not use `/ship` for this static-package slice: that command requires npm gates and
writes lifecycle files outside these task contracts. After Plan 00 Task 1 approves and
commits the repository baseline, hand this exact scoped instruction to a build agent:

> Execute `.opencode/artifacts/homepage-art-direction/plan.md` sequentially. Modify only
> each task's declared files, run only its named static/browser gates, make no Astro or
> dependency changes, and stop after persisting Task 2's decision checkpoint.
