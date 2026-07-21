# Spec: Signal Path Canonicalization and Distribution

**Artifact:** `homepage-art-direction-canonicalization`
**Slice:** P02B
**Status:** Planned; blocked until P02A is accepted
**Effort:** M (1–3h plus external package checkpoint)

## Goal

Turn the accepted Signal Path prototype into the authoritative motion contract, local
brand-package mirrors/capture, and verified published `user:brand-design-system` record
before production translation.

## Problem

An accepted P02A prototype intentionally leaves the canonical landing page ahead of its
distributed surfaces. Local parity alone is insufficient: the brand contract says an
in-place refinement is incomplete until the existing registered package contains the
current files, retains the same id, is published, and renders correctly. This repository
does not currently contain a proven local publish command, so remote synchronization is
an explicit checkpoint rather than an assumed step.

## Observable Truths

1. Maintainers can read one exact homepage-only editorial-motion contract in `DESIGN.md`.
2. Canonical, showcase, renderer, and applied capture represent the same accepted page.
3. The existing `user:brand-design-system` record—not a duplicate—is current, published,
   and renders the production logo and landing proof with working resources.
4. Downstream status points Plan 03 visual integration and Plan 04 homepage choreography
   at the accepted, distributed contract.

## Scope

### In

- Codify homepage-only motion/fallback/timing/prohibition rules in `DESIGN.md`.
- Regenerate the byte-identical showcase mirror and renderer mirror with only the
  documented two-level resource rebase.
- Refresh the accepted 1800px-wide full-page capture.
- Run the documented package audit when Open Design tooling is available.
- Synchronize and verify the existing published `user:brand-design-system` record.
- Close P02A/P02B status gates in the master plan, checklist, and live state.

### Out

- Further art-direction changes; a new visual decision returns to P02A.
- Astro implementation, production routes/styles, new assets/fonts/icons, package
  dependencies, or changes to unrelated design-system components/tokens.
- Inventing a repository-local publish command or claiming remote parity from local
  files alone.

## Required Artifacts

| Path/system | Provides |
|---|---|
| `docs/Ryan-Brosas-Brand-System/DESIGN.md` | Accepted homepage editorial-motion contract |
| `docs/Ryan-Brosas-Brand-System/showcase-landing-page.html` | Byte-identical indexed mirror |
| `docs/Ryan-Brosas-Brand-System/system/artifacts/landing.html` | Renderer mirror with resource-only rebase |
| `docs/Ryan-Brosas-Brand-System/assets/source-previews/ryan-brosas-landing-page-applied.png` | 1800px-wide accepted full-page capture |
| `user:brand-design-system` | Existing published remote record with current package |
| `.opencode/artifacts/homepage-art-direction/acceptance.md` | P02A decision plus P02B audit/sync evidence |
| `.opencode/state.md` | Live pending-human-action, blocked, verified, and completed status |

## Distribution Record Contract

The single **P02B Distribution** section appended to P02A `acceptance.md` must contain
exactly one `Distribution` field:

- `Distribution: pending-human-action` after local capture/audit passes and before the
  operator is asked to authorize or perform the in-place sync;
- `Distribution: blocked` when tooling, authorization, synchronization, remote
  inspection, hash parity, publication status, or resource checks cannot be proved;
- `Distribution: verified` only after the existing record is synchronized and every
  local/remote assertion passes.

The section also records capture dimensions/hash, audit command/result, non-secret sync
method, unchanged id, `Registered package status: published`, changed-file hashes,
URL/render checks, and reviewer/date. It must not add another generic `Status` field,
because that field belongs to P02A acceptance. Updating distribution state replaces the
field; it must never create duplicate `Distribution` fields.

At every transition, `.opencode/state.md` must agree with the distribution field. A
blocked or pending-human-action distribution must not be described as complete or merely
left at an older generic pending state.

## Success Criteria

- [ ] P02A `acceptance.md` says `Status: accepted` and its prototype hash matches the
  current canonical file programmatically before any P02B edit.
- [ ] `DESIGN.md` states the homepage-only exception, timing bands, once-only behavior,
  fallback contract, mobile-navigation baseline, and prohibited patterns.
- [ ] One fail-fast verifier confirms canonical/showcase byte parity and verifies that
  forward generation plus reversing only `../../tokens.css`, `../../logos/`, and
  `../../assets/` reproduces canonical renderer bytes exactly.
- [ ] Active canonical/mirror text passes UTF-8 corruption scans and all local resources
  resolve.
- [ ] Applied capture is a readable full-page PNG exactly 1800px wide.
- [ ] Package audit exits 0 with no warnings when tooling exists.
- [ ] Existing remote id remains `user:brand-design-system`, status is published,
  current changed-file hashes are confirmed, Showcase uses the production logo, and
  registered stylesheet/logo/image URLs return 200.
- [ ] The distribution record is persisted as `pending-human-action` before the external
  checkpoint and reaches `verified` only after remote verification.
- [ ] Master plan/checklist/live state record P02A and P02B complete and point downstream
  work to the accepted contract.

## Blocking Behavior

- Missing Open Design environment variables, CLI, UI/API access, sync permission, or
  verifiable remote state leaves P02B **blocked**. Record the exact missing capability;
  do not mark distribution complete or unblock Plans 03/04 visual work.
- Audit warning, mirror mismatch, encoding corruption, broken resource, wrong/draft id,
  placeholder logo, or stale remote hash blocks closeout.
- Remote sync failure does not roll back the accepted canonical prototype; local accepted
  surfaces remain staged but explicitly undistributed until retry.

## Privacy & Security

- Never record Open Design credentials, tokens, cookies, or private API responses.
- The capture contains only approved public-safe package content and no browser chrome or
  local path.
- Verify remote metadata and hashes, not secrets. Use the existing record; creating a
  duplicate id is a failure.

## Dependency and Handoff

- **Needs:** committed P02A `Status: accepted` and matching canonical hash.
- **Creates:** distributed motion contract consumed by Plan 03 Task 1 and Plan 04.
- **Status closeout:** only after local and registered-package checks both pass.

## Open Question

- `[UNCERTAIN: Which authorized Open Design UI/API/CLI path will perform the in-place
  sync? No executable repository-local publish mechanism was found. Resolve at Task 2;
  do not invent one.]`
