# Applied Brand Workbench UI Kit

This folder turns the source-backed Ryan Brosas brand workbook into a reusable, working interface. It is not a generic dashboard mock: the composed screen carries the verified identity statement, Personal and Client secondary tracks, the Verified/Proposed/Open status model, the five-part system decision chain, and honest project-media placeholders.

## Structure

- `index.html` — browser entry point, source-backed data, runtime composition, filtering, light/dark and track switching, copy feedback, and checklist interaction.
- `app.css` — responsive, semantic-role-driven applied layout. The entry and downstream artifacts load only `../../tokens.css`.
- `components/Primitives.js` — buttons, utility-icon wrapper, status labels, logo tiles, and theme controls.
- `components/LifecycleComponents.js` — form fields, feedback messages, and evidence media with empty, error, and recovery states.
- `components/Navigation.js` — primary page navigation, 820px mobile disclosure, secondary track control, and theme preference.
- `components/StatusPanel.js` — reusable Verified, Proposed, and Open evidence modules.
- `components/SystemMap.js` — Context, Work, Checks, Handoffs, and Recovery decision chain.
- `components/ProjectCard.js` — project evidence request with an explicit Open state.
- `components/AppShell.js` — composed workbench shell that visibly exercises every distributed component family.

All seven component files are browser-ready JavaScript and expose named functions on `window`. Editable sources live here; byte-identical registered copies live in `../../assets/components/`, which is the static distribution boundary used by the applied kit and downstream consumers. No build tool or external runtime is required. Preview HTML documents the contract but is not the implementation source. Every data-driven text and attribute value passes through `BrandEscape`; trusted static SVG geometry remains literal.

The package uses an **App** role through `components/AppShell.js`. It deliberately uses top navigation instead of a **Sidebar** because the source workbook has three stable primary pages. Its **PreviewCard** roles are handled by `components/StatusPanel.js` and `components/ProjectCard.js`; these names describe their reuse role without inventing extra files.

## Usage

Open `index.html` directly for review. The maintainer-facing applied kit loads canonical `colors_and_type.css` as required by the package audit; downstream artifacts load its byte-identical runtime mirror, root `tokens.css`. To reuse the kit in another project, copy `app.css`, the needed registered files from `../../assets/components/`, the chosen adopted SVGs from `../../logos/`, and root `tokens.css`. Load `Primitives.js`, then `LifecycleComponents.js`, then the composed component scripts, and load `AppShell.js` last. Render `window.AppShell(data, track, theme)` into an owned root element. Keep the status names and five system-map steps intact when those patterns are used. A state is complete only when its semantic roles, active CSS, applied-kit example, and light/dark proof agree.

The entry page demonstrates how to bind the mobile navigation disclosure, theme and track buttons, module filters, evidence checklist buttons, and the Clipboard API. Theme preference is written to `data-theme` and stored only as a device-local preference. Adapt the data; do not replace Open states with invented proof.

## Design Notes

The layout is based on the preserved Brand Strategy, Brand Presentation, and Brand Guidelines pages. It uses the four source pigments through semantic surface, text, stroke, action, and evidence-state roles; normal-width system typography; an 8px rhythm; 1px rules; 0/4/8px radius posture; and a single restrained shadow for sticky navigation. The feature plate carries the concentrated editorial moment while light and dark canvases retain three readable surface steps.

The header logo tile uses explicit grid centering and the preserved charcoal SVG. Coral repeats for actions and selection. Signal yellow is limited to the logo tile, Open labels, and the closing eyebrow. Dark mode is not a color inversion: it keeps coral and yellow stable while deriving surfaces from near-white mixed into charcoal. Responsive behavior collapses the hero, status grid, project grid, and system map at the measured 1024px, 820px, and 600px source breakpoints; at 820px the three primary page links move into a labelled `aria-expanded` disclosure instead of a horizontally scrolling desktop row.

## Source Basis

Compare the applied kit with `../../source_examples/brand-workbook/` and `../../assets/source-previews/`. `../../DESIGN.md` owns human-readable rules; `../../brand.json` owns machine-readable brand roles; `../../component-manifest.json` owns component contracts; `../../tokens.css` is the downstream consumer token entry; `../../context/provenance.md` records what was verified, proposed, and still open.
