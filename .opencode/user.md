# User Profile

On-demand reference, not injected. Read this when personalizing responses or commits.

## Identity

- **Name:** Ryan Brosas
- **Role:** Operator and sole builder of the personal website; "Agent Systems Builder" by positioning.
- **Stance:** evidence-aware; claims must be backed (Verified / Proposed / Open). No fabricated proof.

## Communication

- **Detail level:** Concise. State outcomes and decisions directly; cut filler, restatements, and running commentary. (Mirrors `.opencode/AGENTS.md` communication rules.)
- **Confidence:** Calibrate in the first sentence. "I am sure" or "I am not sure, here's why" — not confident-sounding prose that requires probing.
- **Cite evidence:** edits, reviews, and architecture claims cite `path:line`.

## Git Workflow

- **Permission gate:** `git commit *` and `git push *` are `allow` in `.opencode/opencode.json`, so commits and pushes proceed without a confirmation prompt. Initiate commits/pushes as the routine below requires; surgical staging and the close routine remain the control, not a per-action prompt.
- **Close routine:** After an artifact closes — `/ship` Phase 6 confirmed, or a standalone P02 slice acceptance — commit the close changes as one scoped close commit and push to `origin`. Close changes typically include `.opencode/artifacts/todo.md`, `.opencode/artifacts/<slug>/progress.md`, `<slug>/prd.json` status, `.opencode/state.md`, and any other close-touched files. One commit, then push the current branch.
- **Surgical diffs only** — every changed line traces to the current request. Never `git add .`; stage close files individually.
- **Git safety:** never force-push main/master, never bypass hooks, never `reset --hard` / `checkout .` / `clean -fd` without explicit request.

## Working Preferences

- Build incrementally, slice by slice, with verification at each step — not one-shot.
- Planning artifacts may be edited freely; never scaffold application code without explicit approval.
- Preserve no-JS content/navigation completeness, one canonical visibility policy, stable trailing slashes, and evidence/privacy gates across all work.

## Project Context

- Repository: `personal-website` (greenfield). Planning root: `.opencode/artifacts/website-build/`.
- Master plan: `.opencode/artifacts/website-build/plan.md`. Decisions: `decisions.md`.
- Read `AGENTS.md` for binding stack, architecture, SEO/AI, and workflow constraints.
