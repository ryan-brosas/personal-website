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

## Distribution Readiness v1.6.1 — 2026-07-16

The readiness audit found two package-level blockers that normal browser review did not expose. First, `system/variables.css` was an import-only wrapper, which left token extraction dependent on whether a consuming host followed nested CSS imports. Second, six unreferenced JSX prototype files were bundled under `ui_kits/app/components/` with a generic green palette, 10–14px radii, and sidebar architecture that contradicted the registered system. The files were preserved in `context/revisions/2026-07-16-pre-readiness-v1-6-1/` and removed from the active distribution.

Version 1.6.1 makes the packaged token sheet self-contained, expands `system/theme.json` from wildcard families to concrete token names, adds machine-readable contrast and spacing/radius contracts, keeps link hover text contrast-safe on light surfaces, aligns the typography specimen to the declared line-height roles, exposes the complete spacing scale, demonstrates the quiet action in both modes, and adds typography, spacing, and radius proof to the registered Showcase. The registered id remains `user:brand-design-system`.

## Runtime Repair v1.6.2 — 2026-07-16

The previous readiness audit verified local file parity but missed the daemon's static allowlist and normalized token channel. The registered package had no valid `manifest.json` or root `tokens.css`, so active design-system prompts received no token contract. The Showcase route still returned HTML, but its rewritten `system/variables.css`, `logos/`, and `assets/` URLs were denied and returned 404.

Version 1.6.2 adds the normalized `od-design-system-project/v1` manifest, publishes a root `tokens.css` mirror, maps the full Open Design core token schema onto the source-backed semantic system, serves the Showcase from the allowed root token entry, and uses byte-identical SVG copies under the declared `assets/` boundary. The canonical production marks remain under `logos/`; their asset copies have identical SHA-256 hashes. The registered id remains `user:brand-design-system`.

The full-page image exporter repaints sticky navigation during stitched capture. Making the header static removed the repeated header but triggered incomplete black paint regions in the same exporter, so the browser-correct sticky behavior remains. This is recorded as an exporter-specific review gap rather than changing the served Showcase to satisfy one capture path.

## AI Extraction Refinement v1.7.0 — 2026-07-16

Version 1.7.0 refines the existing `user:brand-design-system` package in place. A recoverable pre-change snapshot is stored in `context/revisions/2026-07-16-pre-ai-extraction-v1-7-0/`; no duplicate project or design-system id was created.

The owned source files were measured again before editing. The shared source CSS still declares the 1480px maximum width, 8px baseline with 4px optical half-steps, 0/4/8px radii plus status-only pills, and responsive changes at 1024px, 820px, and 600px. The source HTML contains 43 panels, 42 written statuses, 42 mini labels, 11 copy buttons, nine token rows, six project cards, five system-chain steps, and four logo plates. The three preserved long-form page captures remain 1800px wide. All four production SVGs retain the `0 0 255 211` viewBox and remain byte-identical to their source copies under `assets/`.

The authenticated Figma node `8439:28792` was retried and again returned the connected Starter plan MCP call limit. Public inspection was blocked by Figma access controls. No unavailable measurement was guessed; the owned HTML, CSS, JavaScript, SVGs, palette strip, component previews, and rendered captures remain the authoritative evidence set.

This pass fixes a measurable accessibility gap: light-mode `--text-3` moved from 52% to 62% charcoal, improving its paper-canvas contrast from approximately `3.56:1` to `4.84:1`; the dark role remains approximately `5.81:1`. It also adds explicit loading, validating, valid, empty, error, and recovery roles for actions, fields, and evidence media; expands navigation and panel aliases; and makes root `tokens.css` the single consumer entry while preserving `colors_and_type.css` as the maintainer source and `system/variables.css` as the legacy mirror.

The registered Showcase now proves the same action, read-only field, and disabled anatomy side by side in both semantic modes. The component preview adds read-only, disabled, validating, and valid field specimens. Voice guidance adds reusable proof-boundary sentence shapes without turning them into fabricated claims.

## Runtime Entry Reconciliation v1.7.1 — 2026-07-16

Version 1.7.1 keeps the same `user:brand-design-system` id and reconciles the actual consumer path with the documented token contract. The nine live preview surfaces now load root `tokens.css` directly. `ui_kits/app/index.html` remains a maintainer-facing applied reference on `colors_and_type.css`, as required by the registered package validator; it resolves the same roles because `colors_and_type.css`, `tokens.css`, and `system/variables.css` are byte-identical.

The available source evidence was rechecked without altering its measurements: the four canonical pigments, normal-width system type stacks, `1480px` workbench width, 8px rhythm, and `1024px` / `820px` / `600px` responsive sequence remain the source-backed contract. No linked website or repository is declared in the source context, and no Figma connector is available in this run; those external inputs remain Open rather than inferred.

## Dark Alias Resolution v1.7.2 — 2026-07-16

The side-by-side mode render exposed recovery copy that was too dark on the dark evidence-error plate. Version 1.7.2 explicitly re-declares dark navigation, panel, field, feedback, link, and evidence foreground aliases. The source pigments and surface depths are unchanged; the correction ensures that component text resolves against the dark mode rather than a light-root alias. The three token sheets remain generated byte-identical mirrors under the unchanged `user:brand-design-system` record.

## Showcase Reconciliation v1.7.2 — 2026-07-18

The current `system/kit.html` was reconciled with this provenance record rather than redesigned. The kit loads root `tokens.css` as its sole runtime token sheet, applies `data-theme` on the document root, accepts a `?theme=light|dark` override, and persists the selected mode locally. Its hero, component proof, and footer now consistently identify the package as v1.7.2.

The implementation confirms two package contracts that are now part of the live Showcase:

- `assets/icons.svg` is a 24px `currentColor` outline sprite with a 1.75px round stroke. The Showcase demonstrates utility use for menu disclosure, destination, copy, recovery, and written error states; the icon never replaces a written status or action label.
- The system map is a semantic ordered decision sequence: Context, Work, Checks, Handoffs, and Recovery. Desktop connectors clarify the sequence; narrower layouts remove the connectors and preserve document order. The recovery note explicitly routes failure context back into the next Context.

The three Showcase source-preview cards remain **Verified review evidence** for workbook structure and visual posture. They are not represented as operating results. **Open:** owned project screenshots, workflow captures, terminal captures, usage evidence, and documented failure media that show a real system operating; licensed fonts and application-export assets remain open as recorded above.

## Approved Editorial Illustrations — 2026-07-19

The user approved the clean-print Context Assembly and Recovery Loop compositions represented by `tmp/imagegen/context-assembly-clean-print-chroma.png` and `tmp/imagegen/recovery-loop-clean-print-chroma.png`. Their production counterparts are the alpha PNGs `assets/illustrations/agent-operator-context-assembly-clean-print.png` and `assets/illustrations/agent-operator-recovery-loop-clean-print.png`. Both retain the Ryan charcoal, near-white, coral, and scarce signal-yellow palette; use broad cel blocks with restrained ink texture; keep every subject and prop fully in frame; and have transparent corners.

The user subsequently approved the clean-print Guardrail Check and Evidence Review compositions represented by `tmp/imagegen/guardrail-check-clean-print-candidate-chroma.png` and `tmp/imagegen/evidence-review-clean-print-candidate-chroma.png`. Their production counterparts are `assets/illustrations/agent-operator-guardrail-check-clean-print.png` and `assets/illustrations/agent-operator-evidence-review-clean-print.png`; both are alpha PNGs with transparent corners, complete silhouettes, and the same restrained palette and print treatment.

The user then approved the candidate contact sheet `context/validation/editorial-illustration-candidates-10.png` as review evidence and explicitly selected Memory Update, Budget Boundary, and Scheduled Run for production. Their canonical alpha PNGs are `assets/illustrations/agent-operator-memory-update-clean-print.png`, `assets/illustrations/agent-operator-budget-boundary-clean-print.png`, and `assets/illustrations/agent-operator-scheduled-run-clean-print.png`. The contact sheet records the selection context; it is not itself a production illustration.

The user subsequently approved Failure Triage, Checked Handoff, Work Execution, and System Choice from `tmp/imagegen/failure-triage-clean-print-candidate-chroma.png`, `tmp/imagegen/checked-handoff-clean-print-candidate-chroma.png`, `tmp/imagegen/work-execution-clean-print-candidate-chroma.png`, and `tmp/imagegen/system-choice-clean-print-candidate-chroma.png`. Their production alpha PNGs are `assets/illustrations/agent-operator-failure-triage-clean-print.png`, `assets/illustrations/agent-operator-checked-handoff-clean-print.png`, `assets/illustrations/agent-operator-work-execution-clean-print.png`, and `assets/illustrations/agent-operator-system-choice-clean-print.png`. The chroma sources remain preserved as generation evidence; Trigger Intake, Queue Routing, and Human Escalation remain candidates until explicitly approved.

`context/validation/approved-illustrations-promotion-four.png` records the four newly approved transparent compositions on a near-white proof surface. `context/validation/brand-assets-eleven-approved-illustrations.png` records the complete eleven-scene production library, with Recovery Loop shown on its protected charcoal placement. Alpha normalization preserves fully opaque source pixels while clearing hidden chroma RGB beneath transparent pixels.

The registered Showcase and Brand Assets preview load the production alpha PNGs, not the chroma intermediates. Context Assembly, Guardrail Check, Evidence Review, Memory Update, Budget Boundary, Scheduled Run, Failure Triage, Checked Handoff, Work Execution, and System Choice are tested on light semantic surfaces; Recovery Loop is tested on a fixed charcoal plate. These eleven are approved narrative assets, not operating evidence, logo substitutes, or functional icons. Additional clean-print generations remain candidates until explicitly approved.

## Approved Hero Illustration — 2026-07-19

The user approved the System Conductor composition from `tmp/imagegen/hero-system-conductor-clean-print-candidate-chroma.png` as the primary hero image. The chroma file remains preserved as generation evidence; its production counterpart is the transparent alpha PNG `assets/illustrations/agent-operator-hero-system-conductor-clean-print.png`.

The user explicitly confirmed the source-extracted alpha `tmp/hero-system-conductor-source-extracted.png` and both near-white validation composites, `context/validation/hero-system-conductor-source-extraction-on-paper.png` and `context/validation/hero-system-conductor-clean-on-paper.png`, as the final hero evidence set. The source-extracted alpha and production PNG are byte-identical; the two validation composites are also byte-identical. `brand.json` registers the production PNG as `approved-primary-hero-illustration` and records the source extraction plus both proof paths.

System Conductor is registered separately from the eleven operational editorial scenes. Its dynamic full-body pose, sweeping coral cable, connected modules, and scarce yellow junction make it the expressive lead for website heroes, presentation covers, campaign openers, and major section introductions. Production placement preserves the complete silhouette and clear margin on a light semantic surface, or on a protected light plate over charcoal. It is not operating evidence, a functional icon, or a replacement for the R/lightning mark. The two remaining hero generations remain candidates until explicitly approved.

## AI Extraction Refinement v1.8.0 — 2026-07-19

Version 1.8.0 refines the existing `user:brand-design-system` record in place. A recoverable pre-change snapshot is stored in `context/revisions/2026-07-19-pre-ai-refine-v1-8-0/`; no duplicate project or design-system id was created.

The local source files were re-measured: the two workbook stylesheets contain 25,233 UTF-8 bytes, the three canonical HTML pages contain 51,644 UTF-8 bytes, and the responsive breakpoints remain 1024px, 820px, and 600px. The current source pages contain 38 panel instances, 35 written status instances, 38 compact labels, 11 copy controls, nine token rows, six project cards, five system steps, and four logo plates. The Figma node remains a structural reference but was unavailable for measurement in this run; no unavailable value was inferred.

The audit exposed a component-application gap. Buttons, form fields, feedback, evidence media, theme controls, logo tiles, and utility icons were documented in preview HTML but did not all have reusable runtime owners. Six off-brand JSX prototypes had also reappeared in the active component directory despite the v1.6.1 distribution rule. The prototypes are preserved in the revision snapshot and removed from the active package.

`Primitives.js` now owns buttons, utility-icon wrappers, status labels, logo tiles, and theme controls. `LifecycleComponents.js` owns form fields, feedback messages, and evidence media. `ui_kits/app/index.html` loads both before composed components and visibly exercises them. `component-manifest.json`, `brand.json`, `system/theme.json`, `DESIGN.md`, `README.md`, `AI-BRAND-GUIDE.md`, and `SKILL.md` name the same seven-file runtime distribution and load order.

The token contract adds explicit disabled borders, status-muted roles, field hints, and evidence empty, error-border, and recovery roles without adding pigments. `colors_and_type.css`, root `tokens.css`, and `system/variables.css` remain byte-identical generated mirrors. The registered Showcase and component previews identify the runtime sources and demonstrate the strengthened lifecycle states in both semantic modes.

The final registration pass closes the delivery boundary as well as the documentation gap. Editable component sources remain under `ui_kits/app/components/`, while byte-identical consumable mirrors live under `assets/components/`, the registered static boundary. The applied kit loads those distributed files and canonical `colors_and_type.css`; downstream artifacts continue to load the byte-identical root `tokens.css` mirror. All seven registered component URLs were verified with HTTP 200 responses.

## AI Extraction Reconciliation v1.8.1 — 2026-07-19

Version 1.8.1 refines the same `user:brand-design-system` record in place. The pre-change canonical and registered files are preserved under `context/revisions/2026-07-19-pre-ai-refine-v1-8-1/`; no duplicate project or design-system id was created.

The source measurements and visual evidence still support the existing four pigments, normal-width system typography, 8px rhythm, 1480px workbench width, and 1024px, 820px, and 600px responsive sequence. A fresh no-BOM UTF-8 measurement found 25,232 bytes across the two source stylesheets and 51,590 bytes across the three canonical HTML pages; these values replace the older live evidence fields. The linked Figma file remained unavailable for measurement, so no external value was inferred. The canonical token sheets were byte-identical before refinement.

The audit found six unrelated chat-interface JSX prototypes in `ui_kits/app/components/` while the registered `assets/components/` distribution still contained the correct seven runtime files. The prototypes are preserved in the v1.8.1 revision snapshot and removed from the active source. `component-manifest.json`, `brand.json`, and `system/theme.json` now encode an exact seven-file inventory so future drift is testable rather than advisory.

The token system adds `--icon-default`, `--icon-muted`, `--icon-inverse`, and `--icon-disabled` as semantic aliases without adding pigments. The utility-icon contract keeps the 24px, 1.75px, round, `currentColor` geometry and now names the supported foreground roles. Voice guidance adds compact action, disclosure, loading, evidence, and recovery microcopy contracts. The side-by-side kit now proves empty, error, and recovery surfaces in both modes using the same component roles.

## Living Landing-Page Asset Proof v1.8.2 — 2026-07-19

Version 1.8.2 keeps the same `user:brand-design-system` identity and registers `ryan-brosas-landing-page.html` as the continuous applied proof for the asset system. The landing page already used the charcoal navigation mark, signal-yellow closing mark, System Conductor hero, System Choice, Checked Handoff, and Recovery Loop illustrations. This pass adds canonical `currentColor` destination, recovery, and copy icons beside visible labels.

The registered Showcase and focused Brand Assets preview now expose the landing page directly and map its use of the four asset layers: identity, hero narrative, operational editorial scenes, and interface utility icons. The applied capture lives at `assets/source-previews/ryan-brosas-landing-page-applied.png`. Future accepted landing-page revisions update this same file and refresh the capture rather than creating disconnected variants.

Final package validation found the six archived chat-interface JSX prototypes had reappeared beside the active editable components. They were moved into `context/revisions/2026-07-19-pre-landing-applied-v1-8-2/archived-prototypes/`; both canonical and registered active component directories now contain only the seven files named by `component-manifest.json`.

## AI Extraction Refinement v1.8.3 — 2026-07-19

Version 1.8.3 refines the same `user:brand-design-system` record in place. The pre-change canonical and registered files are preserved under `context/revisions/2026-07-19-pre-ai-refine-v1-8-3/`; no duplicate project or design-system id was created.

The available source evidence was re-measured before refinement. The two source stylesheets contain 25,232 no-BOM UTF-8 bytes, the three canonical HTML pages contain 51,590 disk bytes, and the source still declares the 1024px, 820px, and 600px responsive sequence. Four adopted SVG logos, ten canonical utility symbols, and the seven-file registered runtime inventory remain present. No linked repository or external source folder was supplied. The Figma file remains a structural reference unavailable for measurement, so no value was inferred from it.

The audit found no missing semantic tokens in the real seven-file runtime. The apparent missing green and grey aliases came only from six unrelated JSX chat prototypes that had leaked back into `ui_kits/app/components/`; those files are preserved in the v1.8.3 snapshot and removed from the active inventory. The canonical pigments, typography, spacing, radius, and elevation values remain unchanged because the measured sources did not support a visual-token rewrite.

The substantive gap was runtime state parity. The manifest documented invalid, validating, valid, loading, empty, error, and recovery behavior, but the applied CSS and workbench did not exercise the complete lifecycle. `ui_kits/app/app.css`, `LifecycleComponents.js`, `AppShell.js`, `preview/light-dark-kits.html`, and `system/kit.html` now implement and visibly prove the same state anatomy across both semantic modes. Evidence loading exposes `aria-busy`, validating fields expose `aria-busy`, visible hints connect through `aria-describedby`, and recovery actions announce their next safe step.

Runtime composition is now content-safe by contract. `BrandEscape` protects data-driven text and attribute values in the composed components, while trusted static SVG geometry remains literal. Mobile navigation updates its dedicated label node instead of replacing the entire icon-bearing control. `brand.json`, `component-manifest.json`, `system/theme.json`, `DESIGN.md`, `AI-BRAND-GUIDE.md`, `README.md`, `SKILL.md`, and the focused previews encode these rules so future drift is testable rather than advisory.

## Design System Assets Landing Preview v1.8.4 — 2026-07-19

The Design System Assets Library record for `user:brand-design-system` was inspected directly and found to resolve to `preview/index.html`. The package already linked the living landing page from its Showcase and source metadata, but the Library’s preview-selection heuristic prioritizes a declared path containing `index`, `overview`, `all`, `showcase`, or `components`. Documentation alone therefore could not make the landing page visible as the design-system asset.

Version 1.8.4 keeps `ryan-brosas-landing-page.html` as the only independently edited landing-page source and adds `showcase-landing-page.html` as its generated registered mirror. The mirror is declared first in `manifest.json` with the primary Design System Assets preview role; its `showcase` filename makes the selection deterministic. The stale Library record pointing at `preview/index.html` is replaced through the normal Library sync path, preserving the same `user:brand-design-system` identity.

## Assets Renderer Slot Correction v1.8.5 — 2026-07-19

The Library record correctly indexed `showcase-landing-page.html`, but the Design System Assets renderer opened the fixed project-relative slot `system/artifacts/landing.html`. Because that generated mirror was absent, the surface returned `FILE_NOT_FOUND` even though Library discovery was correct.

Version 1.8.5 preserves `ryan-brosas-landing-page.html` as the only independently edited source, keeps `showcase-landing-page.html` as the Library-facing mirror, and adds `system/artifacts/landing.html` as the renderer-facing mirror. The canonical project and registered `user:brand-design-system` package now carry both generated paths without creating a duplicate design-system id.

## Assets Renderer Resource Rebase v1.8.6 — 2026-07-19

The user-supplied capture is preserved at `context/validation/assets-renderer-missing-resources-v1-8-5.png`. It shows that `system/artifacts/landing.html` opened but rendered as unstyled HTML with missing logo and illustration resources. The content was present; the copied root-level URLs were resolving relative to the nested renderer directory.

Version 1.8.6 keeps the canonical landing page and Library mirror unchanged, then applies a deterministic renderer-only transform: `tokens.css`, `logos/`, and `assets/` references are rebased two levels to the package root inside `system/artifacts/landing.html`. The same transformed mirror is synchronized into the existing published `user:brand-design-system` package.

## AI Extraction Refinement v1.9.0 — 2026-07-19

Version 1.9.0 refines the same `user:brand-design-system` package in place. The pre-change package is preserved under `context/revisions/2026-07-19-pre-ai-extraction-v1-9-0/`; no duplicate project or design-system id was created. The canonical landing page, Library mirror, renderer mirror, and applied landing capture remain unchanged by this component-and-guidance pass.

The local source was re-measured before editing: the two workbook stylesheets contain 25,232 no-BOM UTF-8 bytes, the three canonical HTML pages contain 51,590 bytes, the responsive sequence remains 1024px, 820px, and 600px, and the four adopted SVGs remain byte-identical to their `assets/` copies with the same `0 0 255 211` viewBox. The approved clean-print hero and sampled operational illustrations are 1254 × 1254 ARGB images. Direct retrieval and indexed search of the linked Figma node were blocked by Figma access controls and robots policy, so no value was inferred from it.

The audit found one package-contract regression: six unrelated JSX chat prototypes had reappeared beside the seven registered runtime components. They are preserved under the v1.9.0 revision evidence and removed from the active directory; both active component directories again contain exactly the seven files named by `component-manifest.json`. The maintainer-facing applied kit continues to load canonical `colors_and_type.css` because the package audit verifies extraction there; downstream artifacts load the byte-identical `tokens.css` mirror.

Segmented preferences, filters, pressed states, and persistent selections now consume explicit `--control-*` roles instead of reconstructing behavior from generic surface and selected-state aliases. The visual proof exposed a nested-theme defect: component aliases computed on a light root could inherit into a contained dark kit. Every mode-dependent action, icon, state, navigation, panel, control, field, feedback, and evidence alias is now rebound by the dark scope. The source token sheet, runtime mirror, packaged mirror, theme inventory, machine-readable brand contract, component manifest, and applied CSS are synchronized. The source pigments, typography, spacing, radii, and contrast pairings remain unchanged because the evidence did not support a visual-foundation rewrite.

The applied workbench now visibly exercises default, read-only, disabled, invalid, validating, and valid fields; default, loading, and disabled actions; and Open, loading, empty, error, recovery, and Verified evidence media. The side-by-side light/dark proof uses the same anatomy and adds the same disabled and evidence lifecycle coverage in both modes. Voice guidance adds a landing-page sequence—operating consequence, workflow tension, system mechanism, evidence boundary, specific action—and explicitly replaces unavailable testimonials or metrics with owned build artifacts or honest proof requests.

## Typography-Role Extraction v1.9.1 — 2026-07-19

Version 1.9.1 refines the same `user:brand-design-system` package in place. The pre-change canonical and registered files are preserved under `context/revisions/2026-07-19-pre-typography-roles-v1-9-1/`; no duplicate project or design-system id was created.

The preserved source was re-measured again: the two workbook stylesheets total 25,232 no-BOM UTF-8 bytes, the three canonical HTML pages total 51,590 bytes, the responsive sequence remains 1024px, 820px, and 600px, and the source contains three H1 elements, 22 H2 elements, and 38 panel-class instances. The four canonical pigments, 1480px workbench width, 8px rhythm, radii, contrast pairings, logo geometry, and approved asset roles remain unchanged.

The user-linked `kopywriting.com` page was re-read as a structural inspiration source. Its accessible page structure uses compact sequential headings, direct explanatory paragraphs, repeated section breaks, and explicit next actions. Cloudflare blocked direct stylesheet retrieval, so no external font, color, spacing, or numeric layout value was copied or guessed. The reference influenced only the decision to keep statements compact and separate the operating consequence from its explanation.

The typography correction is now a system contract rather than a page-level patch. `--type-hero-*`, `--type-section-*`, `--type-campaign-*`, and `--type-presentation-*` bind size, line-height, weight, and tracking for their intended contexts. Page heroes cap at 5.25rem, workbench section headings at 3.6rem, campaign statements at 5.2rem, and presentation-only statements at 5.75rem. Display tracking relaxes to -0.035em and ordinary workbench headings use weight 700. The applied kit, focused typography proof, light/dark proof, and registered Showcase consume these named roles.

The package audit also found the same six unrelated JSX chat prototypes reintroduced beside the seven runtime components in both editable and registered directories. The files remain preserved in the v1.9.1 revision snapshot and are removed from the active package again. The exact seven-file runtime inventory remains the only distributed component contract.

## Presentation-Contract Extraction v1.9.2 — 2026-07-19

Version 1.9.2 refines the same `user:brand-design-system` package in place. The pre-change canonical and registered files are preserved under `context/revisions/2026-07-19-pre-presentation-contract-v1-9-2/`; no duplicate project or design-system id was created.

The local workbook source was re-measured at `25,238` CSS bytes and `51,590` HTML bytes. The new `founder-dependence-client-pitch-deck.html` provides fresh applied evidence: `54,102` bytes, 18 labelled slides, 95 inspectable hooks, seven distinct approved illustration references, one active slide, and six written Open labels. Its use of the named hero, section, and presentation typography roles confirms that the v1.9.1 scale correction works under fixed-canvas pressure.

The extraction adds fixed `--presentation-plate-*`, `--presentation-light-*`, and `--presentation-open-*` surface roles plus explicit deck body, metadata, canvas, and safe-area tokens. `brand.json` now records the measured presentation contract and the boundary between narrative composition and runtime components. `DESIGN.md`, `AI-BRAND-GUIDE.md`, `component-manifest.json`, the typography proof, dual-mode proof, applied-surface proof, and registered Showcase carry the same contract. The verified four-pigment palette, contrast pairings, and named heading scale remain unchanged because the evidence did not justify a foundation rewrite.

The linked Kopywriting page was read again and continues to support short sequential headings, direct explanatory paragraphs, and explicit actions. No external type, palette, spacing, metric, or testimonial was copied. Direct retrieval of the linked Figma node remained unavailable, so the local workbook, SVGs, palette evidence, component proofs, applied landing page, and measured pitch deck remain authoritative.

The package audit again found six unrelated JSX chat prototypes in the editable and registered component directories. All six are preserved in the v1.9.2 revision snapshot before removal. The active runtime contract remains exactly seven browser-ready JavaScript files in both source and distribution surfaces.

## UTF-8 and Voice-Contract Extraction v1.9.3 — 2026-07-19

Version 1.9.3 refines the same `user:brand-design-system` package in place. The pre-change canonical and registered package files are preserved under `context/revisions/2026-07-19-pre-utf8-integrity-v1-9-3/`; no duplicate project or design-system id was created.

The source measurements remain stable at `25,238` CSS bytes and `51,590` HTML bytes, with the measured 18-slide pitch deck still at `54,102` bytes. The linked Kopywriting page was re-read and continues to support direct sequential headings, explanatory paragraphs, and an explicit booking path. No external palette, font, spacing, claim, testimonial, or metric was copied. Direct Figma retrieval remains unavailable, so local source files and owned captures remain authoritative.

The active-package scan exposed double-encoded punctuation in five canonical distribution surfaces and the same five registered mirrors: the Showcase, review index, dual-mode proof title, renderer landing mirror, and provenance history. The visible failures included malformed arrows, apostrophes, quotation marks, separators, and dashes. Those strings are repaired as valid UTF-8, and the package now requires scans for replacement characters and common double-encoding signatures before registration.

The client voice proof now makes the service-pitch sequence executable: operating consequence → recurring workflow → honest system choice → checks and recovery → evidence boundary → workflow-mapping action. This extends the existing voice contract without manufacturing results or weakening the Verified, Proposed, and Open taxonomy. The visual tokens, light/dark surface roles, presentation roles, runtime component anatomy, approved assets, and exact seven-file component inventory remain unchanged.

The final inventory check found the six unrelated JSX chat prototypes reintroduced in both editable and registered component directories. They are preserved under this revision snapshot’s `archived-reintroduced-prototypes/` evidence and removed from both active directories. The distributed runtime remains exactly the seven browser-ready JavaScript files named by `component-manifest.json`.

## Pitch-Deck Asset Registration v1.9.4 — 2026-07-19

The canonical `founder-dependence-client-pitch-deck.html` and its applied capture were already present in both the source project and registered package, but the deck was documentation-only from the Design System Assets browser’s perspective. The package manifest did not declare it as a preview page, and the registered package did not contain the deck’s `.artifact.json` sidecar.

Version 1.9.4 adds the canonical 18-slide deck as a separate Design System Assets preview, synchronizes its sidecar into the existing published `user:brand-design-system` package, and keeps `showcase-landing-page.html` as the primary indexed asset. The deck HTML and fixed navigation/print framework are byte-unchanged. The pre-change source and registered package files are preserved under `context/revisions/2026-07-19-pre-pitch-deck-assets-v1-9-4/`; no duplicate design-system id or project was created.

The final inventory check again found six unrelated JSX chat prototypes beside the seven approved runtime files in both active component directories. Their source and registered copies are preserved under this revision snapshot’s `archived-reintroduced-prototypes/` folder, and the active inventories are restored to the exact seven filenames declared by `component-manifest.json`.

## Fixed Deck Renderer Mirror v1.9.5 — 2026-07-19

After the v1.9.4 asset record became discoverable, the Design System Assets renderer returned `FILE_NOT_FOUND` for the project-relative fixed slot `system/artifacts/deck.html`. The canonical deck, its registered root copy, and its sidecar were present; the missing nested renderer mirror was the remaining boundary.

Version 1.9.5 generates `system/artifacts/deck.html` from `founder-dependence-client-pitch-deck.html`, changing only the `assets/` and `logos/` URL prefixes to `../../assets/` and `../../logos/`. The mirror is synchronized into the existing published `user:brand-design-system` package. Reversing those documented path changes reproduces the canonical deck exactly, including its fixed 1920 × 1080 framework, navigation, print rules, 18 labelled slides, and content. The pre-change package is preserved under `context/revisions/2026-07-19-pre-deck-renderer-v1-9-5/`; no duplicate design-system id or project was created.

The final package check again found the six unrelated JSX chat prototypes reintroduced in the canonical and registered editable component folders. Their twelve copies are preserved under this revision snapshot’s `archived-reintroduced-prototypes/` evidence and removed from active inventories, restoring the exact seven runtime files required by `component-manifest.json`.

## Evidence-Role and State-Ownership Extraction v1.9.6 — 2026-07-19

Version 1.9.6 refines the existing `user:brand-design-system` package in place. The pre-change canonical and registered files are preserved under `context/revisions/2026-07-19-pre-ai-extraction-v1-9-6/`; no duplicate project or design-system id was created.

## Fixed-Canvas Deck Typography Refinement v1.9.7 — 2026-07-19

Version 1.9.7 refines the canonical 18-slide client pitch in place. The responsive named type roles were shrinking against the host viewport even though the slide stage is fixed at `1920 × 1080`; the deck now applies `max()` floors of `118px` for hero, `72px` for section titles, `104px` for campaign titles, and `112px` for presentation statements. Supporting grid gaps and subhead sizes were rebalanced without changing the content arc, approved assets, fixed deck framework, evidence labels, or footer-safe content bands. The package audit also found six reintroduced JSX chat prototypes in each active source directory; all twelve copies were moved into the same revision evidence so both canonical and registered runtime inventories again contain exactly the seven manifest-owned JavaScript files. Pre-change canonical and registered deck files are preserved under `context/revisions/2026-07-19-pre-deck-typography-v1-9-7/`.

## Registered Social Poster v1.9.8 — 2026-07-19

Version 1.9.8 adds `building-systems-social-poster.html` as the canonical 1080 × 1350 social announcement for the campaign line “Building systems so everything doesn’t need you.” The composition uses only the registered palette and typography roles, the adopted charcoal R/lightning mark on its protected signal-yellow tile, and the approved transparent System Conductor illustration as narrative art. The poster is indexed after the landing page and pitch deck, has an artifact sidecar and applied capture, and is synchronized into the existing `user:brand-design-system` package without changing its identity. The landing page remains the primary Design System Assets preview. Six reintroduced JSX chat prototypes found in each active source inventory were archived under `context/revisions/2026-07-19-pre-social-poster-v1-9-8/`, restoring the exact seven manifest-owned runtime files before publication.

The two source stylesheets remain `25,238` filesystem bytes, the three canonical source pages remain `51,590` filesystem bytes, and the complete preserved `source_examples/brand-workbook/` archive measures `89,283` filesystem bytes. The palette strip still resolves to coral, signal yellow, charcoal, and near-white; the fixed type stacks, 8px rhythm, 1480px workbench width, 1024/820/600px responsive sequence, adopted SVG geometry, approved illustrations, landing page, and fixed deck renderer remain unchanged. Direct retrieval of the linked Figma node and previously observed copywriting reference was unavailable in this pass, so no external value was guessed or promoted.

The token audit found zero undefined runtime variables and no raw color literals in active component CSS, but Verified evidence media still reached down to generic surface and text roles while every other evidence state used a dedicated family. The system now adds `--evidence-open-muted` plus `--evidence-verified-bg`, `--evidence-verified-fg`, `--evidence-verified-border`, and `--evidence-verified-muted` in both semantic modes. The runtime CSS, light/dark proof, component proof, theme inventory, brand model, and component manifest consume those roles directly.

Human and machine-readable guidance now separates evidence confidence (Verified, Proposed, Open), operational lifecycle (default, loading or validating, content or empty, error, recovery), and interaction state (hover, pressed, selected, focus-visible, disabled). Verified language requires an inspected source and a claim no broader than that source. The active audit again found six unrelated JSX chat prototypes beside the seven registered runtime files; the revision snapshot preserves them, and both canonical and registered active inventories are restored to the exact allowlist.

## State and Campaign Ownership Extraction v1.9.9 - 2026-07-19

Version 1.9.9 refines the same `user:brand-design-system` package in place. The pre-change canonical and registered surfaces are preserved under `context/revisions/2026-07-19-pre-ai-extraction-v1-9-9/`; no duplicate project or design-system id was created.

The preserved source remains stable at `25,238` filesystem bytes across the two workbook stylesheets, `51,590` filesystem bytes across the three canonical HTML pages, and `89,283` filesystem bytes across the complete source-example archive. All twelve approved clean-print illustration files remain `1254 x 1254` ARGB images. The applied pitch deck remains `54,138` bytes with 18 labelled slides, while the refined campaign poster is `7,445` bytes on a fixed `1080 x 1350` canvas. Direct retrieval and indexed search of the linked Figma node were blocked in this pass, so no external token, font, layout value, or claim was inferred from it.

The state audit found that loading, empty, error, and recovery evidence captions all borrowed `--evidence-verified-muted`, and that the project-readiness selection control borrowed the signal-yellow Open family. The token contract now gives every evidence lifecycle state its own muted role, and persistent selection consumes `--control-selected-*`. The applied CSS, component preview, light/dark proof, theme inventory, component manifest, machine-readable brand model, and human guidance all expose the same ownership boundaries.

The canonical 4:5 campaign poster previously carried fixed surface, dimension, and title values locally. Reusable `--campaign-*` surface and layout roles now own that composition without changing the verified four-pigment palette. The social poster consumes those roles, the dual-mode preview demonstrates them as fixed presentation behavior, and the brand-assets and applied-surfaces previews expose the registered poster alongside the primary landing page and pitch deck.

AI-authored voice guidance now requires an explicit choice among agent, script, and process change; concrete operating consequences; named context, checks, handoffs, and recovery when relevant; and an evidence-boundary lint pass before generated copy ships. The final inventory check found the same six unrelated JSX chat prototypes reintroduced beside the seven runtime files in both editable component directories. Their canonical and registered copies are preserved under this revision snapshot's `archived-reintroduced-prototypes/` evidence and removed from the active package. The exact seven-file runtime component inventory, adopted logos, primary landing-page asset, deck renderer mirrors, and registered package identity remain unchanged.

## Campaign Poster Refinement v1.9.10 - 2026-07-19

Version 1.9.10 improves the existing `building-systems-social-poster.html` and the same published `user:brand-design-system` package in place. The pre-change canonical and registered poster, tokens, documentation, previews, and capture are preserved under `context/revisions/2026-07-19-pre-poster-refinement-v1-9-10/`; no duplicate artifact, project, or design-system id was created.

Version 1.9.11 closes the fixed poster-renderer boundary exposed after the indexed campaign asset opened through `system/artifacts/poster.html`. The canonical poster and its registered root copy were already present and byte-identical; the missing nested renderer mirror caused the `FILE_NOT_FOUND` response. The package now generates `system/artifacts/poster.html` from `building-systems-social-poster.html`, changing only `tokens.css`, `logos/`, and `assets/` references to their two-level rebased forms, and synchronizes that mirror plus its sidecar into the same published `user:brand-design-system` package. The poster composition, preview order, primary landing-page asset, and seven-file runtime component inventory remain unchanged. The pre-change package is preserved under `context/revisions/2026-07-19-pre-poster-renderer-v1-9-11/`.

Version 1.9.12 adds the canonical `agent-systems-service-introduction-email.html` as the fourth applied proof after the landing page, client pitch, and campaign poster. The 640px responsive table composition uses the adopted logo, System Conductor narrative art, the registered palette and normal-width type, the agent/script/process-change choice, the Context → Work → Checks → Handoffs → Recovery loop, an explicit Open evidence boundary, and a single reply prompt. It introduces no client, metric, result, testimonial, booking destination, or unsupported outcome. `system/artifacts/email.html` changes only the token, logo, and illustration prefixes for the nested renderer. The pre-change package is preserved under `context/revisions/2026-07-19-pre-service-email-v1-9-12/`; the same published `user:brand-design-system` identity and landing-page primacy are retained.

Version 1.9.13 adds the canonical `agent-build-breakdown-newsletter-template.html` as the fifth applied proof after the service email. The reusable 640px responsive table composition uses the adopted logo, Work Execution narrative art, the registered palette and normal-width type, the exploration → expectation → observed run → interesting failure → system change → evidence boundary → next question sequence, the complete Context → Work → Checks → Handoffs → Recovery loop, and a single reply prompt. Every unsupported issue-specific statement remains a visible replacement slot. `system/artifacts/newsletter.html` changes only the token, logo, and illustration prefixes for the nested renderer. The pre-change package is preserved under `context/revisions/2026-07-19-pre-newsletter-template-v1-9-13/`; the same published `user:brand-design-system` identity, landing-page primacy, and seven-file runtime inventory are retained.

Version 1.9.14 adds the canonical `workflow-service-inquiry-form.html` as the sixth applied proof. The responsive two-column intake uses the adopted logo, System Choice narrative art, registered form and action roles, visible validation, a validating submission state, recoverable error copy, and a local completion summary. It asks for workflow trigger, failure point, tools, human ownership, and intended relief without a budget gate or generic AI question. The prototype explicitly states that no data is transmitted or stored, and its booking step remains Open until an owned scheduling URL is configured. The first full-page capture exposed repeated sticky-column content, so the panel was changed to a static stretching grid item before the accepted capture. The pre-change package is preserved under `context/revisions/2026-07-19-pre-service-inquiry-form-v1-9-14/`; the same published `user:brand-design-system` identity, landing-page primacy, and seven-file runtime inventory are retained.

Version 1.9.15 closes the fixed form-renderer boundary exposed after the indexed workflow inquiry opened through `system/artifacts/form.html`. The canonical form, root registered copy, sidecar, and applied capture were present; the missing nested mirror caused the `FILE_NOT_FOUND` response. The package now generates `system/artifacts/form.html` from `workflow-service-inquiry-form.html`, changing only `tokens.css`, `logos/`, and `assets/` references to their two-level rebased forms, and synchronizes that mirror plus its sidecar into the same published `user:brand-design-system` package. Reversing those documented path changes reproduces the canonical form exactly. The accepted composition, landing-page primacy, booking Open boundary, and seven-file runtime inventory remain unchanged. The pre-change package is preserved under `context/revisions/2026-07-19-pre-form-renderer-v1-9-15/`.

## AI Extraction Refinement v1.10.0 - 2026-07-19

The canonical workbook sources were re-measured at `51,590` HTML bytes and `25,238` CSS bytes, with `89,283` bytes in the preserved source archive. The source inventory remains 38 panels, 35 written statuses, 38 compact labels, 11 copy controls, nine token rows, six project cards, five system steps, and four logo plates. All 12 approved clean-print illustrations remain `1254 × 1254`, and every adopted production SVG retains the `0 0 255 211` viewBox. The linked Figma node remained unavailable to direct retrieval, so no external value was guessed or promoted.

The runtime audit found six local `color-mix()` reconstructions around feature borders, nested feature surfaces, feature metadata, and the sticky navigation overlay, plus a blanket `.42` opacity that compounded already-muted disabled-action text. Version 1.10.0 adds complete `--feature-*`, `--nav-overlay-bg`, and `--action-disabled-opacity` roles, rebinds them in dark mode, registers them in the theme and component manifests, and removes all six local runtime reconstructions. The applied kit, light/dark proof, Showcase, and machine-readable contracts now use those roles directly.

## AI Extraction Refinement v1.10.1 - 2026-07-19

The source workbook was re-measured without changing its evidence baseline: `25,238` bytes of canonical CSS, `51,590` bytes across the three canonical pages, and `89,283` bytes in the preserved source archive. The linked Figma node remained unavailable to direct retrieval, so no external value was guessed. The active token contract grew from 433 to 439 declarations by adding neutral, error, and notice muted-detail roles in both semantic modes. Two feedback body treatments that used blanket opacity now consume those roles directly; Verified status panels now consume their registered border and Proposed panels consume their registered muted-copy role.

The source component directory had also drifted to 13 files because six archived JSX chat prototypes were reintroduced. Those prototypes were copied to `context/revisions/2026-07-19-pre-feedback-roles-v1-10-1/archived-reintroduced-prototypes/canonical/` and removed from the active source inventory, restoring byte-mirrored seven-file parity with `assets/components/`. The package remains `user:brand-design-system`; the landing page remains the primary asset.

The voice extraction also found examples whose labels were correct but whose sentences did not satisfy the package's own evidence grammar. Applied Verified examples now name `AI-BRAND-GUIDE.md`, `colors_and_type.css`, `tokens.css`, or the inspected palette sources; Proposed examples name the tradeoff; Open examples begin with `Still needed:` and name the decision or publication they block. The same published `user:brand-design-system` id, primary landing page, six applied artifacts, and exact seven-file runtime inventory are preserved. The pre-change canonical and registered files are stored under `context/revisions/2026-07-19-pre-ai-extraction-v1-10-0/`.

The source System Conductor remains a `1254 x 1254` ARGB PNG. Its visible alpha bounds were measured at `116,48` through `1161,1216`, a `1046 x 1169` occupied region. The poster now places the `650px` narrative-art plate at `390,610`, keeping the visible figure and cable clear of the `64px` footer rail. The canonical HTML measures `8,186` bytes and the refreshed applied capture measures `307,413` bytes.

The campaign statement is unchanged. Its type scale is reduced from `124px / 0.88` to `116px / 0.9` for more breathing room while preserving four intentional lines. The coral field narrows from `350px` to `320px`, the illustration moves upward and left for stronger image/type tension, and the former export label `Social announcement / 4:5` is replaced by the durable descriptor `Agent Systems Builder`.

The mechanism note now names the complete `Context -> Work -> Checks -> Handoffs -> Recovery` loop instead of omitting Work. Reusable campaign tokens add narrative-art scale plus footer background, foreground, muted text, and height roles. The canonical poster, dual-mode proof, brand-assets proof, applied-surface proof, human guidance, machine contracts, token mirrors, registered package, and refreshed capture carry the same refinement. The final synchronization again reintroduced the six unrelated JSX chat prototypes beside the seven runtime files in both editable inventories; their canonical and registered copies are preserved under this revision's `archived-reintroduced-prototypes/` evidence and removed from the active package. The landing page remains primary, the pitch deck remains second, the poster remains third, and the exact seven-file runtime inventory is unchanged.
