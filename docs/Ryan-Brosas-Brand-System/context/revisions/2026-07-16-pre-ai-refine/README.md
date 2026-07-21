# Ryan Brosas Brand System Package

This is the reusable Open Design package extracted from the source project **Brand Design System**. It preserves the source workbook, real logo assets, palette evidence, review screenshots, written voice rules, and applied interface patterns in one inspectable workspace.

## Product Overview

Ryan Brosas is an Agent Systems Builder who helps overworked founders remove recurring dependence from real operating work. The source application is an operational brand workbook with three primary surfaces: Brand Strategy defines audience, positioning, principles, and voice; Brand Presentation turns those rules into a concentrated editorial story; Brand Guidelines exposes exact tokens, logo use, component states, and AI handoff instructions. The package also supports a Personal Branding and Client Branding track without promoting either to a primary page. Its core capability is evidence-aware reuse: verified facts are safe to apply, proposed decisions stay labelled, and open media inputs are never replaced with fabricated screenshots or outcomes.

## Source Context

- Source project: `Brand Design System`
- Source project id: `826ae961-1707-4719-8146-6b6aa312b6f8`
- Package project id: `4c103428-67e3-485d-9213-4bcf97c890eb`
- Original handoff: `context/source-context.md`
- Evidence and preservation map: `context/provenance.md`
- Canonical source specification: `brand-spec.md`
- Long-form voice and AI rules: `AI-BRAND-GUIDE.md`

No linked repository or external local folder was supplied. The copied project files are the primary evidence set. No font files or runtime app/tray icons were present, so this package intentionally has no `fonts/` or `build/` directory.

## Package Contents

- `DESIGN.md` — canonical product context, foundations, components, motion, voice, and anti-patterns.
- `colors_and_type.css` — reusable color, typography, spacing, radius, shadow, state, and motion tokens.
- `SKILL.md` — agent-facing instructions for applying the system.
- `assets/` — all four production SVG marks, compatibility rasters, palette strip, contained inspiration board, and source review previews.
- `source_examples/brand-workbook/` — substantive preserved HTML, CSS, and JavaScript from the original three-page workbook.
- `preview/` — focused review cards for foundations, assets, components, and applied surfaces.
- `ui_kits/app/` — a reusable applied workbench with modular browser-ready components and real interactions.
- Root source files — the original working launcher and three workbook pages remain intact for direct comparison.

## Preview Manifest

Review these focused cards individually:

1. `preview/colors-primary.html` — canonical swatches, roles, and approved pairings.
2. `preview/typography-specimens.html` — display, body, label, and mono behavior.
3. `preview/spacing-rhythm.html` — 8px rhythm, content measure, and section density.
4. `preview/radius-shadows.html` — editorial, control, panel, pill, border, and elevation limits.
5. `preview/components-states.html` — navigation, buttons, status, form, selection, disabled, loading, and invalid states.
6. `preview/brand-assets.html` — real preserved SVG variants, compatibility rasters, and asset rules.
7. `preview/voice-content.html` — identity statements, build-log voice, client voice, and banned language.
8. `preview/applied-ui-surfaces.html` — source workbook screenshots beside the reusable workbench entry point.
9. `preview/index.html` — compact launcher for all review cards.

The first review pass should open `preview/brand-assets.html`, `preview/components-states.html`, and `preview/applied-ui-surfaces.html`, then inspect `ui_kits/app/index.html` interactively.

## Preserved Artifacts

Production marks live under `assets/` with their source filenames unchanged. The inspiration board is preserved under `assets/reference/Untitled.png` and is explicitly reference-only. Long-form rendered source surfaces live under `assets/source-previews/`. The original workbook implementation is copied byte-for-byte into `source_examples/brand-workbook/`; it is not represented by tiny stubs or re-created snippets.

The raster logos are compatibility references only. Use the SVGs in production. No licensed font files were supplied; the token sheet uses verified Windows/system-safe stacks. No runtime application, tray, installer, or favicon exports were present, so none were invented.

## Review Workflow

1. Start with `DESIGN.md` to understand what is verified, proposed, and open.
2. Load `colors_and_type.css` before building any interface or artifact.
3. Inspect the focused `preview/` cards, especially the real logo and applied-surface cards.
4. Open `ui_kits/app/index.html` and exercise the track switch, section filter, copy action, and checklist states.
5. Compare the reusable kit against `source_examples/brand-workbook/` and the preserved screenshots.
6. Copy only the components and assets needed for a new project; preserve exact logo geometry and asset filenames.
7. Keep missing project media labelled Open until owned evidence is supplied.

## Reuse Notes

Use coral for repeated actions and selected states. Use signal yellow sparingly. Keep the three workbook pages primary, and treat Personal Branding and Client Branding as secondary tracks. For any agent-system story, show Context, Work, Checks, Handoffs, and Recovery. For AI-authored copy, carry the identity statements and banned phrase list from `DESIGN.md` or `AI-BRAND-GUIDE.md` rather than paraphrasing from memory.

