# Applied Brand Workbench UI Kit

This folder turns the source-backed Ryan Brosas brand workbook into a reusable, working interface. It is not a generic dashboard mock: the composed screen carries the verified identity statement, Personal and Client secondary tracks, the Verified/Proposed/Open status model, the five-part system decision chain, and honest project-media placeholders.

## Structure

- `index.html` — browser entry point, source-backed data, runtime composition, filtering, track switching, copy feedback, and checklist interaction.
- `app.css` — responsive applied layout using `../../colors_and_type.css`.
- `components/Navigation.js` — primary page navigation and secondary track control.
- `components/StatusPanel.js` — reusable Verified, Proposed, and Open evidence modules.
- `components/SystemMap.js` — Context, Work, Checks, Handoffs, and Recovery decision chain.
- `components/ProjectCard.js` — project evidence request with an explicit Open state.
- `components/AppShell.js` — composed workbench shell that uses all four surface components.

All component files are browser-ready JavaScript and expose named functions on `window`. No build tool or external runtime is required.

The package uses an **App** role through `components/AppShell.js`. It deliberately uses top navigation instead of a **Sidebar** because the source workbook has three stable primary pages. Its **PreviewCard** roles are handled by `components/StatusPanel.js` and `components/ProjectCard.js`; these names describe their reuse role without inventing extra files.

## Usage

Open `index.html` directly for review. To reuse the kit in another project, copy `app.css`, the needed files from `components/`, the chosen production SVGs from `../../assets/`, and the canonical `colors_and_type.css`. Load component scripts before `AppShell.js`, then render `window.AppShell(data, track)` into an owned root element. Keep the status names and five system-map steps intact when those patterns are used.

The entry page demonstrates how to bind track buttons, module filters, evidence checklist buttons, and the Clipboard API. Adapt the data; do not replace Open states with invented proof.

## Design Notes

The layout is based on the preserved Brand Strategy, Brand Presentation, and Brand Guidelines pages. It uses the source palette, normal-width system typography, an 8px rhythm, 1px rules, 0/4/8px radius posture, and a single restrained shadow for sticky navigation. The dark hero carries the concentrated editorial moment; the remaining surface stays calm and modular.

The header logo tile uses explicit grid centering and the preserved charcoal SVG. Coral repeats for actions and selection. Signal yellow is limited to the logo tile, Open labels, and the closing eyebrow. Responsive behavior collapses the hero, status grid, project grid, and system map instead of squeezing desktop columns.

## Source Basis

Compare the applied kit with `../../source_examples/brand-workbook/` and `../../assets/source-previews/`. `../../DESIGN.md` owns system rules; `../../colors_and_type.css` owns tokens; `../../context/provenance.md` records what was verified, proposed, and still open.
