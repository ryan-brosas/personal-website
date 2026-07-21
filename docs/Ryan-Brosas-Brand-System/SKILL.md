---
name: ryan-brosas-brand-system
description: Apply the source-backed Ryan Brosas brand system to web interfaces, workbenches, presentations, documents, and AI-authored artifacts without inventing proof or changing the production logo geometry.
user-invocable: true
---

# Ryan Brosas Brand System Skill

Use this package when creating or reviewing Ryan Brosas brand artifacts. The system is evidence-led: verified source decisions are binding, proposed decisions stay labelled, and missing project media remains Open.

## What is inside

- `DESIGN.md` contains the canonical context, color, typography, spacing, layout, components, motion, voice, assets, and anti-patterns.
- `brand.json` mirrors the stable identity, mode, component, asset, and voice contracts for machine consumption.
- `component-manifest.json` defines component anatomy, tokens, states, accessibility, responsive changes, content integrity, and the runtime implementation path.
- Feedback messages consume the complete neutral, error, or notice family, including its muted-detail role; local opacity is not a semantic substitute.
- `colors_and_type.css` is the maintainer authoring source for implementation-ready tokens.
- `manifest.json` and root `tokens.css` activate the normalized Open Design package and live token channel.
- `system/kit.html`, `system/kit.dark.html`, `system/variables.css`, and `system/theme.json` are the registered Showcase contract.
- `logos/` contains the four adopted production SVG marks used by generated artifacts and the Design System tab.
- `assets/` contains byte-identical source mark copies, compatibility rasters, palette evidence, the contained reference board, and source review images.
- `preview/` contains focused review cards for colors, typography, spacing, radius and shadows, components, brand assets, voice, and applied UI.
- `source_examples/brand-workbook/` preserves the substantial original HTML/CSS/JavaScript implementation.
- `ui_kits/app/` contains a reusable applied workbench that loads the seven registered browser-ready component files.

## Source context

This design system is based on the copied Open Design project `Brand Design System` (`826ae961-1707-4719-8146-6b6aa312b6f8`). The copied project files are the primary evidence. Read `context/source-context.md` and `context/provenance.md` when provenance matters. No repository snapshot, external local folder, licensed font files, or runtime app/tray icons were supplied.

## When to use this skill

Use it when building Ryan Brosas prototypes, production interfaces, workbench modules, brand-guideline artifacts, presentations, documents, build-in-public posts, or client explainers. Use it to review an existing artifact for palette, logo, voice, hierarchy, interaction, evidence integrity, and audience alignment.

Do not use it as a generic SaaS theme. The product is an evidence-led brand operating system for practical agent work.

## How to use

1. Read `DESIGN.md` completely before making visual or copy decisions.
2. Read `brand.json` when code or another agent needs a machine-readable contract.
3. Read `component-manifest.json` before implementing or adapting a registered component; use the implementation path it names rather than copying preview markup.
4. Load or copy root `tokens.css` once; it is generated from `colors_and_type.css`. Do not also load either mirror or recreate colors by eye.
5. Apply `data-theme="light"` or `data-theme="dark"` to the owned root and consume complete semantic component families. Final dark-scope rebindings cover semantic, compatibility, rule, shadow, and elevation aliases for nested kits. Use `--action-*` for task buttons, `--control-*` for persistent selections, `--feature-*` for feature anatomy, `--system-map-*` for the full five-part map, and `--nav-overlay-bg` for translucent navigation; never rebuild registered behavior with local `color-mix()`.
6. Choose the correct adopted SVG from `logos/` based on background contrast.
7. Inspect the relevant focused card in `preview/` for the part being built.
8. Load `assets/components/Primitives.js` and `assets/components/LifecycleComponents.js` before composed files. Adapt editable sources under `ui_kits/app/components/`, keep their registered asset mirrors byte-identical, and compare them with `source_examples/brand-workbook/`.
9. Keep Brand Strategy, Brand Presentation, and Brand Guidelines as the primary pages.
10. Label facts as Verified, recommendations as Proposed, and missing inputs as Open.
11. Validate both themes, responsive layout, 44px targets, focus-visible behavior, reduced motion, mobile navigation disclosure, and optical logo centering before delivery.
12. When refining the design system itself, synchronize the current package into the existing `user:brand-design-system` directory; the Showcase reads `system/kit.html`, the dark wrapper opens `./kit.html?theme=dark`, and token injection reads `manifest.json` plus root `tokens.css`.
13. Enforce the exact component inventory from `component-manifest.json`: the source and registered distribution directories contain only the seven active runtime filenames; preserve experiments in revision evidence.
14. Treat `ryan-brosas-landing-page.html` as the living applied proof for the four asset layers. Improve that same file after accepted refinements, regenerate `showcase-landing-page.html` for Library indexing, and regenerate `system/artifacts/landing.html` for the Assets renderer with stylesheet, logo, and illustration URLs rebased two levels to the package root. Then refresh `assets/source-previews/ryan-brosas-landing-page-applied.png`; do not create disconnected landing-page variants unless the user requests one.
15. Treat a documented state as incomplete until active component CSS and the applied kit visibly exercise it in both modes. Escape all data-driven text and attribute values through `BrandEscape`; never replace an icon-bearing control’s entire text content when updating its label.
16. For decks, inspect `founder-dependence-client-pitch-deck.html` as the applied presentation proof. Preserve the fixed framework, use the presentation surface and typography roles, keep body copy at least 24px, reserve the 200px footer-safe band, and keep missing proof written as Open. Do not copy runtime component-card markup into slides.
17. When the client pitch is intended to appear in Design System Assets, keep its `manifest.json` preview entry and `founder-dependence-client-pitch-deck.html.artifact.json` sidecar synchronized into the existing registered package; do not replace the landing page's primary asset entry.
18. Generate `system/artifacts/deck.html` from the canonical client pitch for the fixed deck-renderer slot. Rebase `assets/` and `logos/` URLs two levels to the package root, synchronize the mirror into the registered package, and verify that reversing only those path changes reproduces the canonical deck exactly.
19. Keep state token ownership complete: each evidence lifecycle state uses its matching background, foreground, border, and muted role; persistent controls use `--control-selected-*` or `--state-selected-*`, never `--status-open-*`.
20. For fixed 4:5 campaign work, consume the `--campaign-*` canvas, accent field, rule, metadata, safe-area, title, art-scale, and footer roles. Keep narrative art clear of the footer rail, replace export metadata with durable brand language, and keep the landing page primary when registering the campaign asset.
21. Generate `system/artifacts/poster.html` from `building-systems-social-poster.html` for the fixed poster-renderer slot. Rebase only `tokens.css`, `assets/`, and `logos/` two levels to the package root, synchronize the mirror and its sidecar into the existing registered package, and verify that reversing those path changes reproduces the canonical poster exactly.
22. For service email, use `agent-systems-service-introduction-email.html` as the canonical 640px table-based proof. Keep reply as the single next action, preserve the explicit Open evidence boundary, and generate `system/artifacts/email.html` by rebasing only `tokens.css`, `assets/`, and `logos/` two levels to the package root. ESP delivery requires resolved inline CSS and owned hosted image URLs; do not weaken the inspectable canonical artifact to imitate a provider export.
23. For reusable build newsletters, use `agent-build-breakdown-newsletter-template.html` as the canonical 640px table-based proof. Preserve the build-log sequence, bracketed replacement slots, Verified/Proposed/Open boundary, and single reply action. Generate `system/artifacts/newsletter.html` by rebasing only `tokens.css`, `assets/`, and `logos/` two levels to the package root; inline resolved CSS and use owned hosted image URLs before ESP delivery.
24. For service inquiry work, use `workflow-service-inquiry-form.html` as the canonical responsive intake proof. Ask for workflow trigger, failure point, tool context, human boundary, and intended relief; avoid budget gates and generic AI questions. Preserve visible validation, loading, error recovery, a local-only prototype disclosure, and an Open booking destination until an owned scheduling URL is configured.
25. Generate `system/artifacts/form.html` from `workflow-service-inquiry-form.html` for the fixed form-renderer slot. Rebase only `tokens.css`, `assets/`, and `logos/` two levels to the package root, synchronize the mirror and its sidecar into the existing registered package, and verify that reversing those path changes reproduces the canonical form exactly.

## Design-system highlights

- **Color:** four immutable source pigments feed semantic light/dark surface, text, stroke, action, and evidence-state roles.
- **Typography:** normal-width Segoe/system sans stacks; mono for metadata only; no condensed display face.
- **Spacing:** 8px baseline with 4px optical half-steps; large whitespace between narrative sections.
- **Radius and shadows:** 0px editorial plates, 4px controls, 8px panels, pills only for status, one restrained elevation token.
- **Layout:** calm modular workbench by default; one concentrated editorial flourish for presentation moments.
- **Presentation:** fixed dark, light, and Open plates; 1920 × 1080 safety roles; one operating idea per slide; narrative art never counts as operating proof.
- **Campaign:** fixed 1080 × 1350 surface, safe-area, coral-field, title, narrative-art scale, and protected footer roles that remain stable across surrounding document themes.
- **Interaction:** real hover, pressed, focus-visible, selected, read-only, disabled, loading, invalid, error, notice, theme preference, copy-feedback, and reduced-motion states.
- **Lifecycle:** preserve geometry through default, loading or validating, content or empty, error, and recovery states.
- **System Map:** dedicated surface, step, index, connector, and recovery-loop roles preserve identical anatomy in light and dark modes.
- **Assets:** preserve exact SVG geometry; optically center the visible glyph inside every tile.
- **Voice:** casual, nerdy, specific, honest, and failure-aware without hype; reusable sentence grammar moves from operating consequence to system choice, tradeoff, evidence boundary, and a concrete action.

## Content guardrails

Never invent metrics, clients, testimonials, outcomes, or project media. Do not use generic robot imagery or AI-brain tropes. Do not copy third-party material from the contained inspiration board. If a script or process change is more reliable than an agent, say so plainly.

Avoid the banned phrases listed in `DESIGN.md`, including “unlock the power of AI,” “revolutionize,” “10x productivity,” “digital workforce,” “seamless,” “cutting-edge,” “transform your business,” and “AI-powered solution.”

## Delivery check

Confirm that the correct assets are loaded, the logo is optically centered, coral repeats while yellow remains scarce, text uses readable normal-width stacks, component states are real, the five-part system chain is present when relevant, and Open evidence remains visibly unresolved.

For design-system maintenance, also confirm that the registered id is unchanged, its metadata is published, its packaged Showcase shows the adopted SVG rather than a generated placeholder mark, and its simultaneous light/dark proof uses the same component anatomy.
