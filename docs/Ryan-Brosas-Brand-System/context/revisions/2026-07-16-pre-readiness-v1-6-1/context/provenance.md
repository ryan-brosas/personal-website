# Design System Provenance

## Handoff

- Source project: `Brand Design System`
- Source project id: `826ae961-1707-4719-8146-6b6aa312b6f8`
- Current project id: `4c103428-67e3-485d-9213-4bcf97c890eb`
- Design system id: `user:brand-design-system`
- Intake mode: copied Open Design project files; no linked repository or external local folder.

The source files remain at the project root. Selected assets and code have also been preserved in reusable package folders. Copies are additive; no source evidence was deleted or rewritten.

## Canonical Evidence

| Source | Evidence used | Package destination |
|---|---|---|
| `brand-spec.md` | palette conversion, logo roles, safe font stacks, identity language, posture rules | canonical reference retained at root |
| `AI-BRAND-GUIDE.md` | audience, positioning, voice, banned phrases, content integrity, imagery rules | canonical reference retained at root |
| `design-system-plan.md` | three-page structure, status taxonomy, required states, viewport expectations | planning evidence retained at root |
| `index.html` | launcher hierarchy, dark hero, page directory, evidence status system | `source_examples/brand-workbook/index.html` |
| `brand-strategy.html` | audience, positioning chain, principle grid, voice comparison, decision filter | `source_examples/brand-workbook/brand-strategy.html` |
| `brand-presentation.html` | concentrated statement, mark system, color roles, type behavior, reference-board containment | `source_examples/brand-workbook/brand-presentation.html` |
| `brand-guidelines.html` | token specimens, logo contexts, size tests, misuse, component states, AI handoff | `source_examples/brand-workbook/brand-guidelines.html` |
| `brand-workbook.css` | canonical token values, max width, panel/button/navigation construction | `source_examples/brand-workbook/brand-workbook.css` |
| `brand-workbook-pages.css` | page-specific layout and responsive breakpoints at 1024, 820, and 600px | `source_examples/brand-workbook/brand-workbook-pages.css` |
| `brand-workbook.js` | mobile navigation, track filtering, clipboard feedback, persistence | `source_examples/brand-workbook/brand-workbook.js` |

## Brand Assets

| Source file | Source fact | Preserved location |
|---|---|---|
| `Logo---Ryan-1.svg` | 255×211 charcoal production mark; SHA-256 prefix `A5E1589808B8C2A2` | `assets/Logo---Ryan-1.svg` |
| `Logo---Ryan-2.svg` | 255×211 coral production mark; SHA-256 prefix `7ED009593604F478` | `assets/Logo---Ryan-2.svg` |
| `Logo---Ryan-3.svg` | 255×211 signal-yellow production mark; SHA-256 prefix `3688FB53A1C6AF4B` | `assets/Logo---Ryan-3.svg` |
| `Logo---Ryan-4.svg` | 255×211 white production mark; SHA-256 prefix `DED0D146EA553A35` | `assets/Logo---Ryan-4.svg` |
| `Original-Logo-_1.png` | 255×211 compatibility preview | `assets/Original-Logo-_1.png` |
| `Original-Logo-_1-_1_.png` | 255×211 compatibility preview | `assets/Original-Logo-_1-_1_.png` |
| `Group-1.png` | 394×52 source palette strip | `assets/Group-1.png` |
| `Untitled.png` | 1920×1080 third-party inspiration board; reference only | `assets/reference/Untitled.png` |

SVG copies preserve the source bytes and filenames. Raster marks are compatibility-only. The inspiration board is contained evidence; none of its third-party characters, logos, photos, or layouts may be copied into new artifacts.

## Visual Review Evidence

- `brand-workbook-preview.png` established the dark hero, large system statement, centered page grid, and compact evidence counters.
- `brand-strategy-polished-preview.png` established generous section rhythm, split audience modules, equal-column system chains, and mono status labels.
- `brand-presentation-centering-check.png` established the one-hit presentation posture, protected logo plates, fixed palette roles, and contained reference board.
- `brand-guidelines-centering-check.png` established focused token specimens, logo-context testing, size/clear-space diagrams, representative component states, and long-form AI handoff blocks.
- Four `drawing-*.png` captures document prior centering corrections and confirm that the visible logo glyph—not just the image box—must be centered optically.

The four long-form source review images are preserved under `assets/source-previews/` and loaded by `preview/applied-ui-surfaces.html`.

## Inferences and Open Evidence

**Verified:** four-color palette, logo geometry and roles, identity statements, audience priority, three primary pages, secondary track model, voice, anti-hype language, 8px rhythm, 0/4/8px radius posture, and implemented interaction types.

**Proposed but adopted for the package:** a unified token naming layer in `colors_and_type.css`, a modular vanilla-JavaScript applied UI kit, and focused review-card filenames.

**Open:** licensed font files; favicon/app/tray/installer exports; owned project screenshots, workflows, terminal captures, usage evidence, and documented failure media. These omissions are stated rather than fabricated. No `fonts/` or `build/` directory is created because the source evidence did not provide those files.

## AI Refinement — 2026-07-16

The registered design system remained `user:brand-design-system`; no duplicate system or project was created. `brand.json` did not exist before this refinement, so a synchronized machine-readable manifest was added at the package root.

Re-measurement of the preserved source implementation confirmed:

- Canonical source tokens: near-white, charcoal, coral, signal yellow, three system-safe font stacks, one soft shadow, and a 1480px maximum width.
- Radius frequency across the shared source CSS: 8px used six times, 4px five times, 999px twice, and 0 once; 50% appears only for circular dots.
- Implemented breakpoints: 1024px, 820px, and 600px, plus reduced-motion handling.
- High-signal source component classes: 43 panels, 42 status labels, 42 compact labels, 11 copy buttons, nine token rows, six project cards, five decision-chain steps, and four logo plates.
- Preserved assets remained byte-identical to the recorded SHA-256 prefixes; no logo, palette, or source-preview asset was redrawn.

No `brand.json`, linked product website, linked repository, or external source folder was available to re-measure. The only URL in the copied project is the normative WCAG 2.2 reference in `design-system-plan.md`; it is not visual brand evidence. Local HTML, CSS, JavaScript, screenshots, palette strip, and SVGs therefore remain the authoritative extraction sources.

The refinement introduced semantic light/dark roles derived only from the four verified pigments, a real theme preference in `ui_kits/app/`, a focused light/dark review card, stronger component contracts, explicit voice calibration, and mode-safe implementation recipes. Legacy token aliases remain for preserved-source compatibility.

## AI Refinement v1.4 — 2026-07-16

The second extraction pass again updated `user:brand-design-system` in place. It did not create a new project, design-system id, palette, logo, or source example.

Re-measurement confirmed the source implementation still uses the 0/4/8px radius posture and the 600/820/1024px responsive breakpoints. The preserved production SVG hashes remain `A5E1589808B8C2A2`, `7ED009593604F478`, `3688FB53A1C6AF4B`, and `DED0D146EA553A35`; the reference and source-preview dimensions remain unchanged.

Accessibility measurements from the four canonical sRGB values produced these pairings: charcoal on near-white `17.26:1`, near-white on charcoal `17.26:1`, charcoal on coral `5.54:1`, charcoal on signal yellow `10.71:1`, and near-white on coral `3.12:1`. The last pairing is explicitly rejected for ordinary text. These are derived implementation checks, not additional brand evidence.

No linked brand website, repository, or external source folder was discovered. The only external URLs remain the JSON Schema identifier in `brand.json` and the normative WCAG 2.2 reference in `design-system-plan.md`; neither supplies visual brand measurements.

Version 1.4 adds `component-manifest.json`, dedicated `--nav-*`, `--panel-*`, `--field-*`, `--feedback-*`, and supporting state aliases, a real 820px mobile navigation disclosure in the applied kit, and a component-state preview that switches the same components between semantic light and dark roles. `AI-BRAND-GUIDE.md`, package documentation, and review-card copy were synchronized with those contracts.

## Logo Adoption Correction v1.4.1 — 2026-07-16

The Design System tab normalized `brand.json` into its supported presentation schema. It retained one primary path under `logos/`, but left `logo.alternates`, the visible color collection, voice, imagery, and layout posture empty. That made the source-backed package complete on disk while the tab-facing preview appeared incomplete.

Version 1.4.1 adopts all four byte-identical SVG variants under `logos/`, registers one primary and three alternate paths in `brand.json`, and points the preview directory, brand-assets specimen, light/dark kit, and applied UI navigation to the adopted collection. Source copies remain under `assets/` for provenance.

The tab-facing manifest now uses the supported font-object schema and includes the seven allowed color roles without adding colors: paper is reused for background and surface; charcoal is reused for foreground, muted, and border with opacity usage notes; coral is the accent; signal yellow is the secondary accent. Voice, imagery, layout, description, and the approved Figma source URL are populated from existing evidence.

## Showcase Synchronization v1.5.0 — 2026-07-16

The previous correction updated the project package but did not update the registered design-system directory used by Showcase. Inspection found `user:brand-design-system` still marked `draft`, still carrying the original placeholder `DESIGN.md`, and missing `system/kit.html`. Open Design serves the packaged `system/kit.html` when present and otherwise generates a generic fallback from the registered `DESIGN.md`; this explains why the logo and refined component language did not appear in Showcase.

Version 1.5.0 adds `system/kit.html`, `system/kit.dark.html`, `system/variables.css`, and `system/theme.json` to the canonical project. The Showcase surface uses all four adopted SVGs, both semantic modes, the exact source pigments, the three-page hierarchy, Verified/Proposed/Open states, the five-part system map, real source previews, and failure-aware voice examples. It contains no invented clients, testimonials, operating metrics, or outcomes.

Re-measurement confirmed the source CSS still declares the four canonical values, the source pages still use the 1024/820/600px responsive sequence, and the preserved long-form previews remain 1800px wide. The linked Figma file is recorded in `brand.json`, but public web inspection was blocked; no unsupported visual measurement was inferred from it. Local HTML, CSS, SVGs, and owned previews remain the verified evidence set.

The registered system is synchronized in place under the unchanged id `user:brand-design-system`. A recoverable pre-sync snapshot is stored in `context/revisions/2026-07-16-pre-showcase-sync/`.

## Evidence Refinement v1.6.0 — 2026-07-16

Version 1.6.0 again refines `user:brand-design-system` in place. A recoverable pre-change snapshot is stored in `context/revisions/2026-07-16-pre-ai-refine-v1-6/`; no duplicate project or design-system id was created.

The owned sources were re-measured before editing. `brand-workbook.css` and `brand-workbook-pages.css` confirm the `1480px` maximum workbench width, normal-width Segoe/system stacks, 8px baseline with 4px optical adjustments, `0px`/`4px`/`8px` radii plus status-only pills, and responsive changes at `1024px`, `820px`, and `600px`. The three long source page previews remain `1800px` wide. All four production SVGs retain the `0 0 255 211` viewBox and remain SHA-256 identical to the copies under `assets/`.

The linked Figma node `8439:28792` was addressed through the authenticated Figma connector, but the connected Starter plan had reached its MCP tool-call limit. No Figma value was guessed or promoted. The local HTML, CSS, SVGs, palette strip, component previews, and owned renders remain the verified measurement set for this version.

This refinement adds explicit hover and pressed roles for secondary and quiet actions; focus, read-only, and disabled field roles; neutral, error, and notice feedback roles; link and evidence-media roles; and machine-readable mode, pairing, and acceptance contracts in `system/theme.json`. `component-manifest.json` now documents recovery feedback and evidence media as reusable components. The registered Showcase exposes light and dark surface steps simultaneously, demonstrates read-only versus disabled fields, shows recovery-aware feedback states, and adds a four-part voice acceptance proof.
