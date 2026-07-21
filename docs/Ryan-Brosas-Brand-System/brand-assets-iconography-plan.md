# Brand Assets and Iconography Plan

## Intent

Confirm whether the current Ryan Brosas asset library is production-ready and decide whether another icon set would solve a real design-system gap.

## Reconciliation status

The implementation in `preview/brand-assets.html` now matches this plan: it proves the four asset roles, the canonical hero, eleven approved operational illustrations, all ten utility symbols, and the explicit Open status of the three remaining illustration candidates and the optional pixel-badge module.

## Recommendation

**Keep the current asset library as the V1 production set. Do not add a broad new icon family now.**

The system already has the two layers it needs for current work:

1. **Narrative imagery** — one canonical hero plus eleven approved operational illustrations.
2. **Interface utility icons** — one coherent ten-symbol outline sprite for navigation, disclosure, direction, copy, recovery, evidence requests, and written-state reinforcement.

Adding another general-purpose icon family would create overlap without a demonstrated component need. New icons should be added only when an actual screen or reusable component exposes a missing meaning.

## Current production inventory

### Identity

- **Verified:** Four adopted R/lightning SVG variants under `logos/`.
- Use the mark for identity only. It must not become a generic app or workflow icon.

### Hero illustration

- **Verified:** `assets/illustrations/agent-operator-hero-system-conductor-clean-print.png`
- Role: primary expressive image for website heroes, presentation covers, campaign openers, and major section introductions.
- Preserve the complete pose, cable sweep, connected modules, yellow junction signal, and transparent margin.
- Default placement: light semantic surface; use a protected light plate on charcoal.

### Operational illustration library

- **Verified:** Eleven approved production scenes:
  - Context Assembly
  - Recovery Loop
  - Guardrail Check
  - Evidence Review
  - Memory Update
  - Budget Boundary
  - Scheduled Run
  - Failure Triage
  - Checked Handoff
  - Work Execution
  - System Choice
- Role: narrative explanation and campaign rhythm, not operating proof and not control iconography.
- **Open:** Trigger Intake, Queue Routing, and Human Escalation remain candidates. Promote them only when a real content need justifies their use.

### Utility icon sprite

- **Verified:** `assets/icons.svg`
- Construction: 24px viewBox, 1.75px `currentColor` outline, round caps and joins.
- Current symbols:
  - menu
  - close
  - arrow-right
  - chevron-down
  - copy
  - check
  - refresh
  - alert
  - info
  - file-plus
- Current coverage is sufficient for the registered component kit and Showcase, and the complete ten-symbol set is now proven in `preview/brand-assets.html`.

## Asset hierarchy

| Layer | Job | Approved use | Do not use as |
|---|---|---|---|
| R/lightning mark | Identity | Brand stamp and name lockup | Workflow or app icon |
| System Conductor | Hero narrative | Covers, heroes, campaign openers | Product evidence or control |
| Operational illustrations | Explain systems work | Editorial sections and story beats | Functional icon or proof |
| Utility outline icons | Interface actions | Navigation, disclosure, recovery, evidence requests | Decorative heading ornaments |

This separation is the important part. It keeps the illustration work expressive while the interface remains compact and legible.

## Icon addition gate

Add a new utility icon only when all checks pass:

- [ ] A real screen or reusable component needs the meaning.
- [ ] The meaning appears in at least two product surfaces, or is essential to one high-frequency control.
- [ ] None of the existing ten symbols communicates it accurately.
- [ ] It remains recognizable at 16px, 24px, and 32px.
- [ ] It follows the same 24px grid, 1.75px stroke, `currentColor`, round-cap construction.
- [ ] The component keeps a visible text label by default.
- [ ] An icon-only control has an explicit accessible name and a minimum 44px target.
- [ ] The symbol does not duplicate the R/lightning mark or turn a mascot scene into a tiny icon.

## Potential gaps to validate later

These are **Proposed**, not approved production additions:

| Candidate meaning | Add only if | Likely alternative today |
|---|---|---|
| Evidence/view source | Repeated evidence browsing needs a dedicated control | `file-plus`, `info`, or a written link |
| Checked handoff | A reusable handoff action appears across product screens | `arrow-right` plus a visible label |
| Human escalation | A recurring escalation control becomes part of the product | `alert` plus explicit escalation copy |
| Run/execution | A real run control needs distinction from navigation | A labelled button without an icon |

Do not create these as a speculative batch. Validate them against a concrete screen first.

## Pixel-badge decision

The current package does not contain a separate production pixel-badge asset set or a registered pixel-badge component contract. Therefore:

- Do not describe pixel badges as shipped V1 assets yet.
- If pixel badges are still desired, treat them as a separate future module for reusable system-stage language.
- Build that module only from an approved semantic map, with literal pixel construction and legibility checks at small sizes.
- Keep it visually and functionally separate from the outline UI sprite.

### TODO — only if the pixel module is resumed

- [ ] Confirm the exact stage list and whether infrastructure concepts are secondary.
- [ ] Locate or approve the canonical source files.
- [ ] Define 16px, 24px, and 32px export behavior.
- [ ] Register anatomy, usage, accessibility, and responsive rules in `component-manifest.json`.
- [ ] Add a proof surface to the Showcase before calling the set production-ready.

## Acceptance checks

- [x] Canonical hero path is documented and distinct from operational illustrations.
- [x] Eleven approved operational illustrations are documented as narrative assets.
- [x] Utility icon sprite exists and its ten symbols match the written design-system contract.
- [x] Identity, narrative, and functional asset roles do not overlap.
- [x] No speculative icon has been promoted as production-ready.
- [x] Remaining illustration candidates stay visibly Open in the preview.
- [x] A concrete gate exists for any future icon addition.
- [x] The preview shows the confirmed asset hierarchy and keeps the pixel-badge module explicitly Open.

## Open decision

- [ ] **Recommended:** Keep the current V1 set and add icons only when a real screen exposes a gap.
- [ ] Resume a separate pixel-badge module after approving its semantic map and source assets.

## Next step

Review the two Open decision options above. Unless the pixel-badge module is explicitly selected, use the current hero, eleven operational illustrations, and ten utility icons as the V1 production asset library. If the pixel-badge module is selected later, identify its canonical source files before generation or registration.
