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
- `brand.json` — machine-readable identity, source pigments, semantic modes, typography, assets, components, voice, and implementation pointers.
- `component-manifest.json` — machine-readable anatomy, token, state, accessibility, responsive, recovery, content-integrity, and runtime-implementation contracts for reusable components.
- `colors_and_type.css` — reusable color, typography, spacing, radius, shadow, state, and motion tokens.
- `manifest.json` and `tokens.css` — the normalized package map and live Open Design token entry. `tokens.css` is generated from `colors_and_type.css`.
- `system/kit.html` and `system/kit.dark.html` — the registered Showcase surfaces rendered by the Design System tab.
- `system/variables.css` and `system/theme.json` — a self-contained compiled token sheet plus explicit machine-readable theme inventory kept in sync with the canonical root files.
- `SKILL.md` — agent-facing instructions for applying the system.
- `logos/` — the four adopted production SVG marks used by the Design System tab, previews, and applied kit.
- `assets/` — byte-identical source SVG copies, compatibility rasters, palette strip, contained inspiration board, and source review previews.
- `source_examples/brand-workbook/` — substantive preserved HTML, CSS, and JavaScript from the original three-page workbook.
- `preview/` — focused review cards for foundations, assets, components, and applied surfaces.
- `ui_kits/app/` — a reusable applied workbench that loads the seven registered browser-ready component files and exercises their real interactions.
- Root source files — the original working launcher and three workbook pages remain intact for direct comparison.

## Preview Manifest

Review these focused cards individually:

1. `preview/colors-primary.html` — canonical swatches, roles, and approved pairings.
2. `preview/typography-specimens.html` — display, body, label, and mono behavior.
3. `preview/spacing-rhythm.html` — 8px rhythm, content measure, and section density.
4. `preview/radius-shadows.html` — editorial, control, panel, pill, border, and elevation limits.
5. `preview/light-dark-kits.html` — semantic light/dark surface, action, status, navigation, and form roles.
6. `preview/components-states.html` — navigation, buttons, status, form, selection, disabled, loading, and invalid states.
7. `preview/brand-assets.html` — real preserved SVG variants, compatibility rasters, and asset rules.
8. `preview/voice-content.html` — identity statements, build-log voice, client voice, and banned language.
9. `preview/applied-ui-surfaces.html` — source workbook screenshots beside the reusable workbench entry point.
10. `preview/index.html` — compact launcher for all review cards.

The Design System tab Showcase does not read this preview directory. It renders `system/kit.html` from the registered `user:brand-design-system` package; the preview cards are focused inspection surfaces for maintainers.

The first review pass should open `preview/light-dark-kits.html`, `preview/brand-assets.html`, and `preview/components-states.html`, then inspect `ui_kits/app/index.html` in both themes.

## Preserved Artifacts

Adopted production marks live under `logos/` with their source filenames unchanged and are registered in `brand.json`. Byte-identical source copies remain under `assets/` for provenance. The approved transparent System Conductor hero and eleven operational editorial illustrations live under `assets/illustrations/`; the hero is the primary campaign and cover asset, while the scene set covers Context Assembly, Recovery Loop, Guardrail Check, Evidence Review, Memory Update, Budget Boundary, Scheduled Run, Failure Triage, Checked Handoff, Work Execution, and System Choice. Both roles are visibly documented in `preview/brand-assets.html` and `system/kit.html`. The inspiration board is preserved under `assets/reference/Untitled.png` and is explicitly reference-only. Long-form rendered source surfaces live under `assets/source-previews/`. The original workbook implementation is copied byte-for-byte into `source_examples/brand-workbook/`; it is not represented by tiny stubs or re-created snippets.

The raster logos are compatibility references only. Use the SVGs in production. No licensed font files were supplied; the token sheet uses verified Windows/system-safe stacks. No runtime application, tray, installer, or favicon exports were present, so none were invented.

## Review Workflow

1. Start with `DESIGN.md` and `brand.json` to understand the human and machine-readable system contracts.
2. Read `component-manifest.json` before adapting navigation, controls, forms, status panels, system maps, evidence cards, or logo tiles; use the registered `assets/components/` implementation path it names rather than copying preview markup.
3. Load root `tokens.css` once, then apply `data-theme="light"` or `data-theme="dark"` to the owned root. Do not load the authoring or legacy mirrors in the same consumer artifact.
4. Inspect the focused `preview/` cards, especially light/dark roles, real logos, and component states.
5. Open `ui_kits/app/index.html` and exercise theme and track switching, mobile navigation disclosure, section filters, copy feedback, lifecycle fields, recovery messages, and evidence states.
6. Compare the simultaneous light/dark role proof in `system/kit.html`; component anatomy must remain stable while semantic roles change.
7. Compare the reusable kit against `source_examples/brand-workbook/` and the preserved screenshots.
8. Copy only the components and assets needed for a new project; preserve exact logo geometry and asset filenames.
9. Keep missing project media labelled Open until owned evidence is supplied.
10. Before claiming an in-place refinement is live, confirm the registered package has a valid `manifest.json`, a root `tokens.css`, `system/kit.html`, all four files under `logos/`, the current `DESIGN.md`, and published metadata for the unchanged id.
11. Confirm `tokens.css` and `system/variables.css` contain declarations directly, their bytes match `colors_and_type.css`, and `system/theme.json` contains no wildcard role names.
12. Confirm the served Showcase stylesheet, SVG, and evidence-image URLs all return 200.
13. Confirm `ui_kits/app/components/` and registered `assets/components/` contain the same seven byte-identical runtime files referenced by the applied kit and component manifest: `Primitives.js`, `LifecycleComponents.js`, `Navigation.js`, `StatusPanel.js`, `SystemMap.js`, `ProjectCard.js`, and `AppShell.js`.

## Reuse Notes

Use coral for repeated actions and selected states. Use signal yellow sparingly. Keep the three workbook pages primary, and treat Personal Branding and Client Branding as secondary tracks. For any agent-system story, show Context, Work, Checks, Handoffs, and Recovery. For AI-authored copy, carry the identity statements and banned phrase list from `DESIGN.md` or `AI-BRAND-GUIDE.md` rather than paraphrasing from memory.

New components should consume semantic mode and component families such as `--surface-*`, `--text-*`, `--stroke-*`, `--action-*`, `--nav-*`, `--panel-*`, `--field-*`, `--status-*`, `--feedback-*`, `--link-*`, and `--evidence-*`. Error and notice copy must include a next action. The legacy aliases remain only for preserved-source compatibility. The package keeps the same design system id: `user:brand-design-system`.

Version 1.8.2 makes `ryan-brosas-landing-page.html` the living applied proof for the brand asset system. The page now visibly combines the identity mark, System Conductor hero, selected editorial scenes, and labelled destination, recovery, menu, and copy icons. Future landing-page improvements update this same file and refresh `assets/source-previews/ryan-brosas-landing-page-applied.png` instead of branching into disconnected examples.

Version 1.8.3 closes the gap between documented states and the actual runtime kit. Invalid, validating, valid, disabled, empty, error, and recovery treatments now live in active component CSS and are visibly exercised in the applied kit and side-by-side mode proof. Data-driven component content is escaped through `BrandEscape`, mobile navigation label updates preserve its icons, and the exact seven-file inventory now rejects JSX, prototype, and alternate-pattern drift.

Version 1.8.1 makes runtime drift mechanically visible. `Primitives.js` owns buttons, utility icons, logo tiles, status labels, and theme controls; `LifecycleComponents.js` owns form fields, feedback, and evidence media. Editable sources live in `ui_kits/app/components/`; byte-identical consumable copies live under the registered `assets/components/` boundary. Both active directories must contain exactly the seven filenames listed by `component-manifest.json`. Six off-brand JSX prototypes that reappeared in the source directory were removed again and preserved in `context/revisions/2026-07-19-pre-ai-refine-v1-8-1/`.

`colors_and_type.css` is the maintainer authoring source. Root `tokens.css` and `system/variables.css` are full generated mirrors: the root file is the only consumer entry and activates Open Design's normalized token channel, while the system file preserves the legacy package surface. Never edit the three independently; regenerate both mirrors and verify byte parity before publishing.

Version 1.8.1 preserves the v1.7.2 dark-mode correction and v1.8.0 lifecycle roles, then adds semantic icon foreground roles, compact interface-microcopy contracts, and explicit light/dark empty-error-recovery proof. The nine downstream previews and the applied kit load `tokens.css` as the single consumer entry.
