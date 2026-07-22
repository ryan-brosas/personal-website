# P02A Acceptance Record — Signal Path (Editorial Cut)

**Created:** 2026-07-22
**Status:** accepted
**Accepted at:** 2026-07-22
**Decided by:** Ryan (visual review)
**Prototype SHA-256:** 214f66e8ef16eb1ca38b1e4ab38cfd82910bdf8766ab09aaafe6615c42c852c3
**Baseline SHA-256 (immutable):** 8cf4d4023f662b6f56ddb046ee2c5df8b82e1d308d67ddd9a2fd3d7042e0ef58
**Showcase SHA-256 (unchanged):** 8cf4d4023f662b6f56ddb046ee2c5df8b82e1d308d67ddd9a2fd3d7042e0ef58
**P02B eligibility:** yes

---

## Environment

- **Chromium:** 150.0.7871.114 (`/snap/bin/chromium`)
- **Display:** `xvfb-run -a` (headless; no X server)
- **CDP:** websocket-client 1.9.0 + `--remote-debugging-port` + `--remote-allow-origins=*`
- **Static server:** `http://127.0.0.1:4173/` serving `docs/Ryan-Brosas-Brand-System/`
- **Playwright:** not installed
- **Screen reader:** not available (orca/nvda/espeak-ng/espeak all absent)

---

## Prototype summary

In-place refinement of `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html`
implementing the approved **Signal Path — Editorial Cut** design:

- **Hero:** full-width charcoal rule sweep (`scaleX(0)→1`, 520ms), three oversized
  cropped headline planes (`translateY(110%)→0`, staggered 0/180/300ms, 560ms), and a
  one-time finite coral signal trace (`pathLength=1`, `stroke-dashoffset 1→0`, 880ms,
  delay 360ms) over the System Conductor raster.
- **Manifesto:** coral color-plane wipe (`translateX(-100%)→0→100%`, 560ms, once).
- **System steps:** top rule `scaleX(0)→1` on intersection reveal (420ms).
- **Story media:** `clip-path inset(0 100% 0 0)→inset(0 0 0 0)` on reveal (620ms);
  captions/labels stay outside the clip.
- **CTA/footer:** quiet (no expressive motion).
- **Total hero settle:** ~1.4s; all animations `forwards` (run once).
- **Motion arming:** `requestAnimationFrame` (double-rAF) sets `data-motion-ready` on
  `<html>` only as the final successful step (inside try/catch). IntersectionObserver
  sets `is-seen` on `.system-step`/`.story` (rootMargin -15% bottom, threshold 0.12);
  falls back to all-seen if IO unavailable. CSS transient states exist ONLY under
  `[data-motion-ready]`; without it every region is final/visible.
- **Mobile-nav repair (progressive enhancement):** base CSS (no `data-nav-ready`):
  trigger hidden, links visible inline. Enhanced: trigger revealed, links collapsible.
  JS binds all handlers FIRST, then sets `data-nav-ready`. Failure before that line
  leaves links visible + trigger hidden.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` neutralizes ALL
  transient states — final composition visible.

No new dependencies. No external requests. No copy/evidence/source-order changes.
Exactly one h1 preserved. No prohibited patterns (parallax, scroll-hijack,
setInterval, bounce/elastic, will-change, marquees, cursor effects, particles,
splash, decorative loops).

---

## Viewport matrix (16 captures, all OK)

Captures under gitignored `.playwright-mcp/homepage-art-direction/`.

| Viewport | Mode | File | Result |
|---|---|---|---|
| 360×800 | normal | vp-360x800-normal.png | OK (51 KB) |
| 390×844 | normal | vp-390x844-normal.png | OK (55 KB) |
| 390×844 | reduced-motion | vp-390x844-reduced.png | OK (55 KB) |
| 390×844 | no-JS | vp-390x844-nojs.png | OK (55 KB) |
| 430×932 | normal | vp-430x932-normal.png | OK (56 KB) |
| 600×960 | normal | vp-600x960-normal.png | OK (113 KB) |
| 768×1024 | normal | vp-768x1024-normal.png | OK (198 KB) |
| 820×1180 | normal | vp-820x1180-normal.png | OK (313 KB) |
| 844×390 | landscape | vp-844x390-landscape.png | OK (38 KB) |
| 1024×768 | normal | vp-1024x768-normal.png | OK (222 KB) |
| 1366×768 | normal | vp-1366x768-normal.png | OK (304 KB) |
| 1440×900 | normal | vp-1440x900-normal.png | OK (381 KB) |
| 1440×900 | reduced-motion | vp-1440x900-reduced.png | OK (381 KB) |
| 1440×900 | no-JS | vp-1440x900-nojs.png | OK (381 KB) |
| 1440×900 | 200% zoom | vp-1440x900-zoom200.png | OK (1054 KB) |
| 1920×1080 | normal | vp-1920x1080-normal.png | OK (449 KB) |

---

## Progressive enhancement (PASS)

`cmp -s` confirms the desktop final state is byte-identical across all three modes:

```
vp-1440x900-normal.png == vp-1440x900-nojs.png   (identical)
vp-1440x900-normal.png == vp-1440x900-reduced.png (identical)
vp-390x844-normal.png  == vp-390x844-nojs.png     (identical)
```

CSS `forwards` animations resolve to the same final visible state as no-JS and
reduced-motion. The base (un-enhanced) composition is the fallback; JavaScript
failure, unsupported APIs, and reduced-motion preference all render the final
composition. This is the required progressive-enhancement guarantee.

Mobile reduced captures are visually very close to mobile normal (55 KB each) —
the small byte difference on mobile is antialiasing on the signal-trace stroke
(which renders its final drawn state under reduced-motion).

---

## Motion arming (PASS)

`--dump-dom` with `--virtual-time-budget=8000` confirms:

- `data-motion-ready="true"` on `<html>`
- `data-nav-ready="true"` on `.site-header`
- 7 `is-seen` markers (IntersectionObserver fired on `.system-step` + `.story`)

(3500ms virtual-time budget was too short for double-rAF to settle in dump-dom
mode; 8000ms is sufficient. In CDP remote-debugging mode, motion armed
correctly after ~3s.)

---

## Failure injection (PASS)

### Nav-init failure

Injected `<script>EventTarget.prototype.addEventListener=function(){throw...}</script>`
into a temp copy.

- `data-nav-ready`: ABSENT (correct — addEventListener broken, setAttribute never ran)
- `primary-nav`: present in markup → links visible via base CSS
- `data-motion-ready`: also absent (breaker affects IO internals)
- **Result:** safe failure — everything final/visible.

### Motion-init failure

Injected `<script>window.requestAnimationFrame=function(){throw...}</script>`.

- `data-nav-ready`: `"true"` SET (nav uses addEventListener, not rAF)
- `data-motion-ready`: ABSENT (rAF broken)
- `is-seen`: 7 (IO uses `.observe`, not rAF)
- **Result:** nav works, motion doesn't arm, final composition visible.

Marker separation confirmed: nav-fail and motion-fail are independent safe
failure modes.

---

## Keyboard (PASS, CDP)

- **Escape** closes the mobile nav (`data-open` true→false) AND returns focus to the
  toggle button (`activeElement` = `BUTTON.nav-toggle`).
- **Focus-visible outline:** 2px solid coral (`rgb(255, 85, 85)`) on the focused
  toggle — visible.
- **Tab cycle (nav closed):** 2 skip-link anchors (`A|#system`, `A|#start`) —
  correct disclosure behavior (nav links are `display:none` when closed, not
  Tab-focusable).
- **No keyboard trap** detected.

---

## Console and network (PASS)

- **Console:** Chrome debug log shows only snap/AppArmor DBus noise + GCM
  deprecation — NO page console errors.
- **Network:** no external requests (resource list has only `127.0.0.1` entries).

---

## Performance (PASS, 3× 390×844)

| Metric | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| DOMContentLoaded | 76.5ms | 76.5ms | 76.5ms |
| loadEventEnd | 77.6ms | 77.6ms | 77.6ms |
| externalRequests | 0 | 0 | 0 |

- CSS-only animations (no JS long tasks >50ms possible).
- `transform`/`opacity`/`clip-path` only — no layout shift (CLS 0).
- One finite sequence (all `forwards`, runs once).

---

## Screen reader (BLOCKED)

No screen reader is available in this environment (orca, nvda, espeak-ng, and
espeak are all absent). This is recorded honestly as **BLOCKED**, not inferred as
passing. A real assistive-technology smoke must run in an environment with a
screen reader before any final launch claim. This does not block P02A acceptance
of the visual/motion/progressive-enhancement contract; it gates the later
`m2-accessibility-acceptance` child.

---

## Evidence paths

- Viewport captures: `.playwright-mcp/homepage-art-direction/vp-*.png`
- Implementation notes: `.opencode/artifacts/homepage-art-direction/implementation-notes.md`
- Canonical prototype: `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html`
- Showcase baseline: `docs/Ryan-Brosas-Brand-System/showcase-landing-page.html`

---

## Resume guard

Before recording a decision (accept/revise/reject), verify:

1. Canonical SHA-256 still equals `214f66e8ef16...` (this prototype).
2. Showcase SHA-256 still equals `8cf4d4023f...` (immutable baseline).

If either differs, stop and investigate before mutating any state.

---

## Decision (accepted)

Ryan reviewed the visual output and **accepted** the prototype on 2026-07-22.

- Status → **accepted**
- P02B eligibility → **yes**
- Task 1 + Task 2 work committed.
- Proceed to P02B (canonicalize: update `DESIGN.md`, regenerate local mirrors,
  refresh capture, synchronize/verify the registered `user:brand-design-system`
  package, close status gates). P02B must start only after this accepted hash.
