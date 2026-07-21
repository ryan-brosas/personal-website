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

- **Ask first** before commit or push. (Matches `.opencode/opencode.json` permissions: `git commit *` and `git push *` are `ask`.)
- **Surgical diffs only** — every changed line traces to the current request. Never `git add .`; scope commits to your changes.
- **Git safety:** never force-push main/master, never bypass hooks, never `reset --hard` / `checkout .` / `clean -fd` without explicit request.

## Working Preferences

- Build incrementally, slice by slice, with verification at each step — not one-shot.
- Planning artifacts may be edited freely; never scaffold application code without explicit approval.
- Preserve no-JS content/navigation completeness, one canonical visibility policy, stable trailing slashes, and evidence/privacy gates across all work.

## Project Context

- Repository: `personal-website` (greenfield). Planning root: `.opencode/artifacts/website-build/`.
- Master plan: `.opencode/artifacts/website-build/plan.md`. Decisions: `decisions.md`.
- Read `AGENTS.md` for binding stack, architecture, SEO/AI, and workflow constraints.
