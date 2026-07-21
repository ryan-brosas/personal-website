# Next Visual Asset Plan

## Objective

Make the design system feel evidence-led rather than illustration-led. The current light/dark proof is structurally complete; its missing visual layer is owned operational evidence showing how an agent system is checked, handed off, and recovered.

## Placement map

| Priority | File | Use | Evidence status | Format |
|---|---|---|---|---|
| 1 | `assets/evidence/system-map-context-to-recovery.png` | Showcase and applied UI evidence module | Open — capture from a real workflow | 16:10, 1600px wide |
| 2 | `assets/evidence/recovery-handoff-capture.png` | Dark-mode feedback and recovery examples | Open — capture a real failure/retry state | 16:10, 1600px wide |
| 3 | `assets/evidence/build-log-terminal-capture.png` | Voice, provenance, and project proof | Open — owned terminal or run log | 16:10, 1600px wide |
| 4 | `assets/social/systems-before-spectacle-og.png` | Open Graph / social share | Proposed — derived from verified copy and owned evidence | 1.91:1, 1200×630 |

## Capture briefs

### 1. System map — highest value

Capture one real workflow as five labelled stages: **Context → Work → Checks → Handoffs → Recovery**. Show only the actual source, action, check, owner, and retry/fallback. Redact credentials and client data. This becomes the primary visual proof in `preview/applied-ui-surfaces.html` and the Showcase evidence module.

### 2. Recovery handoff

Capture a moment where an agent cannot safely continue: the failure message, what stayed safe, the human owner, and the retry or escalation action. Do not simulate a red error screen for aesthetics—the artifact must come from a real run.

### 3. Build-log terminal capture

Use a clean terminal window from an owned project: short command, observed result, and one useful failure or verification line. Crop out machine-specific paths, keys, unrelated tabs, and noisy setup output. This is proof texture, not a dashboard replacement.

## Generation fallback — supporting texture only

Use this only if a section needs a non-evidentiary visual surface while real captures are still Open. Never label it as workflow proof.

```text
Editorial technical texture for an agent-systems brand: cropped charcoal workbench surface, fine near-white construction rules, one restrained coral registration mark, a single scarce signal-yellow square, subtle paper grain, no text, no logos, no people, no robots, no glowing AI imagery, no gradients, no dashboard cards. Calm modular instruction-board energy, high contrast, flat graphic print texture, composition leaves a clean lower-right caption area. 16:10 landscape.
```

Suggested dispatcher target:

```text
assets/generated/agent-systems-workbench-texture.png
```

## Social asset composition

Use the exact phrase **“Systems before spectacle.”** on near-white or charcoal, the approved R/lightning SVG, and a cropped strip of owned workflow evidence. Keep the descriptor secondary. No fabricated metric, client logo, or generic AI imagery.

## Pre-placement checks

- Keep labels outside the evidence crop; captions must say what source created the capture.
- Use `Verified` only after the owned capture is present; otherwise retain `Open — owned evidence needed`.
- Preserve the light/dark proof’s sparse coral and scarce yellow behavior.
- Fix the dark error-panel text contrast before using that panel as a recovery-evidence frame; the current rendered sample reads too low-contrast at small size.
