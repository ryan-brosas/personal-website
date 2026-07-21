# Spec: Signal Path Prototype and Acceptance

**Artifact:** `homepage-art-direction`
**Slice:** P02A
**Status:** Planned; not active
**Effort:** M (1–3h plus user checkpoint)

## Goal

A reviewer can experience and explicitly accept or reject the approved **Signal Path —
Editorial Cut** homepage direction in the canonical applied proof without risking the
distributed brand package or production website.

## Problem

The brand system has a strong static landing proof and a restrained functional-motion
contract, but no executable homepage choreography or visual gate. The canonical page
also hides mobile primary navigation at `<=820px` unless JavaScript opens it, which
violates the project's no-JavaScript requirement. Translating an unproven direction into
Astro would make visual, accessibility, and performance mistakes expensive.

## Observable Truths

1. The hero communicates signal flow through one expressive, finite sequence that never
   delays access to content.
2. Manifesto, system steps, and selected media feel editorial rather than like generic
   staggered fade-ups.
3. CTA/footer settle into a quiet composition and nothing loops.
4. Complete content and primary navigation work with JavaScript disabled and with
   reduced motion.
5. Ryan's decision, browser environment, checks, and prototype hash are durable and
   reproducible.

## Scope

### In

- In-place prototype in
  `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html`.
- Progressive-enhancement repair for the canonical page's mobile navigation.
- Oversized cropped hero type, structural rule, one Conductor signal trace, manifesto
  color-plane cut, restrained system-step choreography, and selected media masks.
- Responsive, keyboard, real-screen-reader smoke, no-JS, reduced-motion, console,
  network, layout-stability, and representative mobile performance review.
- Durable result at `.opencode/artifacts/homepage-art-direction/acceptance.md`.
- Live P02A/P02B eligibility in `.opencode/state.md` after the decision.
- Reversible restoration from the untouched showcase mirror after rejection.

### Out

- `DESIGN.md`, `showcase-landing-page.html`, `system/artifacts/landing.html`, the applied
  capture, and the registered `user:brand-design-system` package (P02B).
- Astro scaffold, production routes/components/styles, package installation, content or
  claim changes, new assets/icons/fonts, analytics, and external requests.
- Expressive motion on internal routes.

## Requirements

- The static DOM/CSS is the final readable state; enhancement never begins from a
  persistently hidden page.
- The base mobile navigation is visible without JavaScript. Only a confirmed script
  enhancement may expose a disclosure trigger and collapse links.
- Enhanced menu state keeps `aria-expanded` accurate, supports `Escape`, restores
  trigger focus, and introduces no keyboard trap.
- The System Conductor raster is unchanged; any signal overlay is decorative, inert,
  and fitted in its `1254 × 1254` coordinate system.
- Functional motion remains `150–220ms`; editorial cuts may use `400–700ms`; the hero
  settles in about one second and runs once per page load.
- Reduced motion, unsupported APIs, or script failure render final states immediately.
- Navigation and motion use separate readiness markers. Motion transient states exist
  only under `data-motion-ready`, which is added after successful initialization; an
  unavailable API or exception before that point leaves final states visible.
- No animation changes meaning, reading order, labels, evidence status, or source claims.
- No parallax, scroll hijacking/pinning, marquees, cursor effects, particles, splash,
  autoplay, loops, bounce/elastic easing, or layout-driven long-distance movement.

## Required Artifacts

| Path | Provides |
|---|---|
| `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html` | Reviewable canonical prototype |
| `.opencode/artifacts/homepage-art-direction/acceptance.md` | Exact environment, matrix, results, decision, hash, and rollback proof |
| `.opencode/artifacts/homepage-art-direction/implementation-notes.md` | Deviations and discoveries |
| `.opencode/state.md` | Live accepted/revision/rejected state and P02B eligibility |

## Acceptance Record Contract

`acceptance.md` must contain:

- `Status: pending-review | revision-requested | accepted | rejected`;
- baseline canonical/showcase hashes and `Prototype SHA-256: <hash>`;
- Chromium product/version, server URL, viewport/mode matrix, and screen-reader/version;
- keyboard, focus, no-JS navigation, reduced-motion, responsive, console, network, and
  resource results;
- navigation-initialization failure, motion-initialization failure, and every optional
  motion API's unavailable path (or an explicit `Optional motion APIs: none` result);
- three `390×844`, 4× CPU mobile trace results with long-task/CLS/settlement findings;
- Ryan's dated decision and bounded revision notes, if any;
- rejected-work restoration command result and restored hash;
- `P02B eligibility: yes|no` (`yes` only when status is accepted).

At the pending checkpoint and after every decision, `.opencode/state.md` must contain
exactly one P02A status line and one P02B status line matching `plan.md`; updating a
transition replaces those lines rather than appending another status.

## Success Criteria

- [ ] Canonical and showcase files match before the first Task 1 entry; a revision entry
  instead proves the untouched showcase still matches that immutable baseline and the
  canonical file still matches the last reviewed prototype hash.
- [ ] Approved choreography is visible at `390×844` and `1440×900` without obscuring
  content, changing source order, or looping.
- [ ] No-JS mobile navigation exposes all primary links; enhanced disclosure passes
  keyboard and Escape/focus-return behavior.
- [ ] Reduced motion and no-JS render final composition immediately.
- [ ] Full viewport/reflow matrix, real screen-reader smoke test, console/network checks,
  and three mobile traces pass the thresholds in `plan.md`.
- [ ] Ryan's decision is written to `acceptance.md` with the exact prototype hash.
- [ ] `.opencode/state.md` reflects the decision before the session ends.
- [ ] Rejection restores canonical/showcase byte parity; acceptance leaves mirrors
  untouched and gates P02B.

## Failure, Privacy, and Security

- Any failed required check blocks acceptance and production handoff.
- A trace that cannot align robustly is removed; the unchanged raster remains the hero.
- Review traces/captures remain under `.playwright-mcp/homepage-art-direction/` and are
  not committed. The durable record summarizes public-safe results without local paths,
  credentials, private evidence, or raw analytics.
- The prototype adds no external data collection or active security surface.

## Dependency and Handoff

- **Needs:** Plan 00 Task 1 repository baseline approved and committed. It may run while
  the remaining M0 inputs and M1/P01 proceed because it does not change `.active`, the
  application scaffold, or shared production files.
- **Accepted outcome creates:** exact accepted hash and review contract consumed by P02B.
- **Does not unblock directly:** Plan 03 or Plan 04; P02B must canonicalize and verify
  distribution first.

## Open Question

- `[UNCERTAIN: Exact crop breaks and cable geometry are prototype tuning decisions. Copy,
  imagery, routes, and visual scope are already fixed.]`
