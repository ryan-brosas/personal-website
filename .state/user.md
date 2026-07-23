---
purpose: User identity, preferences, communication style
updated: 2026-07-24
---

# User Profile

## Identity

- **Name:** Ryan Brosas
- **Role:** Operator and sole builder of the personal website; positioned as "Agent Systems Builder."
- **Stance:** Evidence-aware; distinguish Verified, Proposed, and Open claims. Never fabricate proof.

## Communication Preferences

- **Detail level:** Concise. State outcomes and decisions directly; cut filler, restatements, and running commentary.
- **Confidence:** Calibrate in the first sentence when uncertainty matters — "I am sure" or "I am not sure, here's why," not confident-sounding prose that requires probing.
- **Cite evidence:** edits, reviews, and architecture claims cite `path:line`.
- **Source conflicts:** state them; prefer official documentation, source code, maintainer material, community evidence, then inference.

## Workflow Preferences

- Build incrementally, slice by slice, with verification at each boundary — not one-shot.
- Planning artifacts may be edited freely within scope; application features require explicit lifecycle scope.
- Preserve no-JavaScript content/navigation completeness, one canonical visibility policy, stable trailing slashes, and evidence/privacy gates across all work.
- Prefer root-cause fixes, surgical diffs, and generated-output evidence.
- Concurrent agent changes are normal. Never stash, revert, overwrite, or otherwise disturb them.

## Technical Preferences

- Static Astro + strict TypeScript; semantic HTML + plain CSS; no UI framework.
- Fail-closed visibility (`draft | public | noindex`); no-JS accessibility first.
- Markdown-first Astro Content Collections; Git is the source of truth for content.

## Git Workflow

- **Permission gate:** `git commit` and `git push` proceed without a per-action confirmation prompt (per `AGENTS.md`), but surgical staging and the close routine remain the control.
- **Close routine:** after an artifact closes, commit the close changes as one scoped close commit and push to `origin`. Close changes typically include progress notes, `state.md`, `project-status.md`, and any other close-touched files.
- **Surgical diffs only** — every changed line traces to the current request. Never `git add .`; stage close files individually.
- **Git safety:** never force-push main/master, never bypass hooks, never `reset --hard` / `checkout .` / `clean -fd` without explicit request.

## Things to Remember

- `.state/` is the canonical OMP-native state; `.pi/` and `.opencode/` are legacy planning roots.
- The homepage evidence/curation is owned by P4 (M3), not P3 (M2).
- Remote brand-package sync (P02B) is deferred by the operator — local repo is the brand source of truth.
- Screen-reader smoke is blocked on no reader installed; it is a pre-release gate, not an M2 code gate.
