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
