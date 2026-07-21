# Ryan Brosas Brand System

> Category: personal brand and operational workbench design system  
> Surface: responsive web, presentations, documents, and AI-authored artifacts  
> Source project: `Brand Design System` (`826ae961-1707-4719-8146-6b6aa312b6f8`)  
> Design system id: `user:brand-design-system`  
> Package version: `1.8.0` — runtime component application, stronger lifecycle roles, and registered-kit distribution are reconciled  
> Evidence status: V1 identity, audience, voice, palette, logos, and interaction posture are verified; owned project media remains open.

## Product Context

Ryan Brosas is an Agent Systems Builder who builds practical systems that stop repetitive work from routing back through founders. The system serves overworked founders first, then operators and advanced builders who care about context, evaluation, handoffs, reliability, and recovery.

The source product is an operational brand workbook, not a marketing-site theme. Its three primary pages are exactly **Brand Strategy**, **Brand Presentation**, and **Brand Guidelines**. Personal Branding and Client Branding are secondary tracks within those pages. The design system must work in two modes without becoming two brands:

1. **Workbench mode** — calm, modular, evidence-led, and comfortable for long reading sessions.
2. **Presentation mode** — concentrated editorial energy through scale, cropping, repetition, and one deliberate visual hit.

Every artifact should make facts, proposals, and missing inputs distinguishable. Use the labels **Verified**, **Proposed**, and **Open**. Never turn an open input into invented proof.

## Visual Foundations

The core atmosphere is an instruction board for systems work: near-white paper, charcoal structure, fine rules, readable normal-width sans typography, compact mono metadata, and sharp coral interventions. Signal yellow is a scarce focus cue and the protected logo-tile color.

Five source-backed posture rules govern the system:

1. Keep product and workbench surfaces calm, flat, modular, and readable.
2. Reserve collage, large crops, and abrupt scale shifts for presentation moments.
3. Use the R/lightning mark as a confident stamp with generous clear space.
4. Prefer grids, fine rules, compact labels, and whitespace over decorative cards.
5. Repeat coral as the brand accent; keep yellow scarce.

The decisive flourish is scale contrast: one oversized statement, selected plate, or cropped evidence surface per screen. A screen with three competing flourishes has no hierarchy.

### Measured source evidence

The local source set was re-measured on 2026-07-19: the two workbook stylesheets contain `25,233` UTF-8 bytes, the three canonical HTML pages contain `51,644` UTF-8 bytes, and the responsive sequence remains `1024px`, `820px`, and `600px`. The current pages contain 38 panel instances, 35 written status instances, 38 compact labels, 11 copy controls, nine token rows, six project cards, five system steps, and four logo plates. The system still uses a `1480px` maximum workbench width, an 8px baseline with 4px optical adjustments, `0px`/`4px`/`8px` radii plus status-only pills, and `1800px` review renders. Every adopted SVG preserves a `0 0 255 211` viewBox and is byte-identical to its copy under `assets/`.

The linked Figma node remains a structural reference. It was not available for measurement in this run, so no value was inferred from it. No linked product website, repository, or external source folder is declared by the source context. The re-measured local HTML, CSS, SVG, palette asset, component previews, and rendered evidence therefore remain authoritative.

## Color

The palette was sampled from `Group-1.png` and confirmed by the SVG fills. Use the canonical values from `colors_and_type.css`.

| Token | Hex | Role |
|---|---:|---|
| `--color-paper` / `--bg` | `#FEFEFE` | Primary reading canvas and light surface |
| `--color-charcoal` / `--fg` | `#1A1A1A` | Main text, structure, and preferred dark canvas |
| `--color-coral` / `--accent` | `#FF5555` | Repeated action, selection, expressive rule, and accent mark |
| `--color-signal` / `--signal` | `#ECC90F` | Scarce focal signal, warning, and protected logo tile |

Supporting muted text, borders, hover plates, and shadows are alpha or `color-mix()` derivations of the four canonical colors. Do not introduce decorative hues. When a domain needs a semantic success or error state, pair a written label and shape with the closest canonical color before adding another color.

Body-size accent labels use `--accent-text`: charcoal in light mode and coral in dark mode. Use `--accent-decoration` for coral underlines, rules, and boundaries. Coral on near-white is `3.12:1`, so do not use raw coral for small ordinary text on light surfaces.

### Token architecture

Do not bind components directly to source pigments unless the role must remain constant in both modes. Use this three-layer model:

1. **Source pigments** — `--color-paper`, `--color-charcoal`, `--color-coral`, and `--color-signal`. These are evidence and never change by theme.
2. **Mode roles** — `--canvas`, `--surface-1`, `--surface-2`, `--surface-3`, `--surface-inverse`, `--workbench-canvas`, `--presentation-canvas`, `--surface-interactive-*`, `--text-1`, `--text-2`, `--text-3`, and `--stroke-*`. These change under `[data-theme="dark"]`. Tertiary text remains contrast-safe: approximately `4.84:1` on the light canvas and `5.81:1` on the dark canvas.
3. **Component roles** — `--action-*`, `--nav-*`, `--panel-*`, `--field-*`, `--status-*`, `--feedback-*`, `--link-*`, `--evidence-*`, `--state-selected-*`, `--feature-*`, and `--focus-*`. Components consume these names rather than reconstructing colors. Loading, validating, empty, error, and recovery states use explicit roles instead of borrowing hover or disabled colors.

The legacy aliases `--bg`, `--surface`, `--fg`, `--muted`, `--border`, `--accent`, `--signal`, and `--on-dark` remain for preserved source compatibility. New components should prefer the semantic roles.

When a component foreground depends on a mode role, declare it again in the dark block. This keeps recovery, evidence, field, navigation, and panel copy bound to the dark mode’s readable text role instead of inheriting a light-resolved alias.

### Light and dark mode contract

| Role | Light mode | Dark mode |
|---|---|---|
| Canvas | Near-white | Charcoal |
| Surface 1 | Near-white | 5% paper mixed into charcoal |
| Surface 2 | 4% charcoal mixed into paper | 9% paper mixed into charcoal |
| Surface 3 | 8% charcoal mixed into paper | 14% paper mixed into charcoal |
| Primary text | Charcoal | Near-white |
| Secondary text | 68% charcoal | 70% near-white |
| Feature plate | Near-white on charcoal | Near-white on raised charcoal |
| Primary action | Charcoal on coral | Charcoal on coral |
| Open state | Charcoal on signal yellow | Charcoal on signal yellow |

Dark mode is not a black inversion. It uses three measured surface steps, preserves coral and signal yellow, and keeps presentation plates visibly separate from the canvas. Apply the mode to an owned root with `data-theme="light"` or `data-theme="dark"`; do not swap individual component colors ad hoc.

### Color pairing

- Near-white on charcoal: primary dark hero and evidence plates.
- Charcoal on near-white: default reading and workbench surface.
- Charcoal on coral: primary action and selected state.
- Charcoal on signal yellow: logo tile, open-state notice, or one focal annotation.
- White mark on charcoal or coral: reversed logo use.
- Yellow mark on charcoal: high-signal brand stamp.

### Color restraint

- Coral may repeat across a screen, but never as a full background wash behind all content.
- Yellow appears at most once as a large plate or twice as a small signal per viewport.
- Never place the yellow mark on a yellow field.
- Never use purple, neon AI color, or decorative gradients.

### Verified contrast pairings

The following WCAG contrast ratios are calculated from the four canonical sRGB values. They are implementation constraints, not new colors.

| Foreground on background | Ratio | Text use |
|---|---:|---|
| Charcoal on near-white | `17.26:1` | AAA for body and display text |
| Near-white on charcoal | `17.26:1` | AAA for body and display text |
| Charcoal on coral | `5.54:1` | AA for body text; approved primary action pairing |
| Charcoal on signal yellow | `10.71:1` | AAA; approved Open-state and logo-tile pairing |
| Near-white on coral | `3.12:1` | Do not use for ordinary text |

Use charcoal text on coral controls. A white-on-coral treatment may be decorative at large scale but is not the default text pairing.

## Typography

No licensed font files were supplied. Use production-safe normal-width system stacks:

```css
--font-display: "Segoe UI Variable Display", "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--font-body: "Segoe UI Variable Text", "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--font-mono: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
```

Display and body may share the same family because this is a utilitarian system, but they behave differently. Display text uses tighter tracking, larger scale, shorter measure, and moderate-to-bold weight. Body text stays regular or semibold with comfortable leading.

| Style | Size | Line height | Weight | Use |
|---|---:|---:|---:|---|
| Display XL | `clamp(3.75rem, 8vw, 7.5rem)` | `0.90` | `750` | Presentation-only statement, 2–8 words |
| Display L | `clamp(2.75rem, 6vw, 5.5rem)` | `0.94` | `700` | Page hero and section thesis |
| Heading M | `clamp(2rem, 4vw, 3.5rem)` | `1.00` | `700` | Major workbench section |
| Heading S | `1.25rem–1.5rem` | `1.15` | `700` | Panel and component title |
| Body | `1rem–1.125rem` | `1.60` | `400` | Explanations, maximum 70 characters |
| Label | `0.6875rem–0.8125rem` | `1.2` | `700` | Uppercase mono metadata |

Use mono only for indices, labels, specifications, token values, and technical evidence. Do not use condensed or narrow faces. Editorial energy comes from scale, alignment, repetition, and crop—not from squeezing letterforms.

### Typography roles

- `--weight-regular: 400` for explanations and longer reading.
- `--weight-medium: 600` for controls and supporting emphasis.
- `--weight-strong: 700` for component titles, navigation, and labels.
- `--weight-display: 750` for short hero and campaign statements only.
- `--leading-display-xl: 0.90`, `--leading-display-lg: 0.94`, `--leading-heading: 1`, and `--leading-body: 1.6` keep each role explicit. `--leading-display` remains a compatibility alias for the large-display role.
- `--tracking-display: -0.045em` is reserved for large display type; `--tracking-label: 0.12em` is reserved for short uppercase mono labels.

Do not copy the tight display tracking onto body text. In dark mode, keep the same type scale and weight; change semantic text roles, not font geometry.

## Spacing and Layout

Use an 8px baseline with a 4px half-step for compact optical adjustments.

| Token | Value | Use |
|---|---:|---|
| `--space-1` | `4px` | Optical nudge, inline separation |
| `--space-2` | `8px` | Compact control spacing |
| `--space-3` | `12px` | Label-to-value gap |
| `--space-4` | `16px` | Component padding |
| `--space-6` | `24px` | Panel padding and grid gap |
| `--space-8` | `32px` | Component group separation |
| `--space-12` | `48px` | Section interior rhythm |
| `--space-16` | `64px` | Desktop section separation |
| `--space-24` | `96px` | Hero and narrative break |

### Grid

- Maximum reading/workbench width: `1480px`.
- Desktop page shell: 12-column grid with a visible central rule only where it clarifies the composition.
- Content sections: typically two columns at `minmax(0, 1fr)`; three columns only for short parallel facts.
- Body copy: 45–65 characters preferred, 70 maximum.
- At `1024px`, reduce generous section spacing and collapse complex multi-column arrangements.
- At `820px`, navigation becomes a menu, split heroes stack, and fixed comparison rows become vertical.
- At `600px`, use 20–24px page gutters and full-width primary actions.
- Important controls must remain at least 44×44 CSS pixels.

### Radius, borders, and elevation

- `0px`: editorial plates, color fields, large evidence blocks.
- `4px`: compact controls, badges, and small inputs.
- `8px`: maximum standard panel radius.
- `999px`: status labels only; do not apply pill geometry to ordinary controls.
- `1px` borders are structural and derive from charcoal.
- Elevation is rare. Use the single soft shadow token only for sticky navigation, transient menus, or overlays that must separate from content.

## Components

### Shared component contract

Every reusable component documents five things: **anatomy**, **semantic tokens**, **states**, **responsive behavior**, and **content integrity**. A visually polished default without a loading, empty, invalid, or Open state is incomplete when that state can occur.

Consumers use semantic component roles from root `tokens.css`; maintainers define those roles in `colors_and_type.css`. Components may use source pigments directly only for the production logo, coral primary action, signal-yellow Open state, and protected presentation plates.

`component-manifest.json` is the machine-readable registry for anatomy, token dependencies, states, accessibility behavior, responsive changes, and content integrity. Treat it as the implementation contract; this document explains the design reasoning behind it.

Component code should consume the dedicated families before reconstructing roles from lower layers:

- Navigation: `--nav-*`.
- Panels: `--panel-*`.
- Form fields: `--field-*`.
- Status: `--status-*`.
- Feedback and transient UI: `--feedback-*`.
- Links and owned evidence: `--link-*`, `--evidence-media-*`, and `--evidence-caption-*`.
- Shared controls: `--action-*`, `--control-*`, and `--focus-*`.

### Component application contract

Components are part of the distributed system only when four surfaces agree: `component-manifest.json` names the implementation, `ui_kits/app/components/` owns the editable source, `assets/components/` contains a byte-identical registered mirror, and `ui_kits/app/index.html` loads that mirror and visibly renders it. Preview HTML is review evidence; it is never the implementation source.

Load the runtime in this order:

1. `tokens.css` — the single consumer token entry.
2. `ui_kits/app/components/Primitives.js` — buttons, utility-icon wrapper, status label, logo tile, and theme control.
3. `ui_kits/app/components/LifecycleComponents.js` — form field, feedback message, and evidence media.
4. `Navigation.js`, `StatusPanel.js`, `SystemMap.js`, and `ProjectCard.js` — composed patterns.
5. `AppShell.js` — applied workbench composition.

The active source and distribution directories each contain only those seven runtime files. `assets/components/` is inside the registered static boundary, so downstream artifacts can consume the implementations instead of receiving preview-only documentation. Off-brand JSX prototypes are archival evidence, not distributable components. When adapting a component, use the implementation named by `component-manifest.json` and the smallest relevant CSS range from `ui_kits/app/app.css`; do not re-create the anatomy from the preview card.

### Component lifecycle

State is part of component anatomy, not follow-up polish. Model the sequence **default → loading or validating → content or empty → error when needed → recovery action**. Preserve the component footprint while labels and semantic roles change so validation, loading, and recovery never shift adjacent controls.

- Loading actions use `--action-loading-*`; they keep their width, set `aria-busy="true"`, and expose a real progress phrase.
- Validating and valid fields use `--field-validating-*` and `--field-valid-*`; invalid feedback uses `--field-invalid-*` plus `--field-error-fg`.
- Evidence surfaces use `--evidence-open-*`, `--evidence-loading-*`, and `--evidence-error-*`. An empty or failed media plate names what is missing and the next available action.
- Empty, error, and recovery states are written in words. Color is supporting evidence, never the only signal.

### Navigation

The primary navigation exposes exactly Brand Strategy, Brand Presentation, and Brand Guidelines. Active state uses a coral underline or `--state-selected-*`. Personal Branding and Client Branding appear only as secondary segmented controls. A light/dark preference may sit beside those controls but must not compete with page hierarchy.

- Anatomy: brand home, three primary destinations, secondary track control, optional theme preference.
- States: default, hover, current page, focus-visible, expanded mobile menu.
- Mobile: replace the full page list with a labelled button using `aria-expanded`; keep track and theme preferences reachable without horizontal page scroll.
- Applied reference: `ui_kits/app/components/Navigation.js` implements the disclosure at 820px and keeps all three page destinations in the same labelled navigation landmark.
- Theme preference: write `data-theme` on the document root and persist only as a device-local preference.

### Buttons

- Primary: `--action-primary-bg`, `--action-primary-fg`, `--action-primary-border`, and 4px radius.
- Secondary: `--action-secondary-bg`, `--action-secondary-fg`, `--action-secondary-border`, `--action-secondary-hover`, and `--action-secondary-pressed`.
- Quiet: transparent surface using `--action-quiet-hover` and `--action-quiet-pressed` when interaction becomes visible.
- Minimum target: 44px high.
- Hover: `--action-primary-hover` or a maximum 2px translate, never a glow.
- Pressed: `--action-primary-pressed`; remove the translate on release and never use hover as the pressed state.
- Pressed/selected: `aria-pressed="true"` plus `--state-selected-*`; do not fake selection with hover styling.
- Focus-visible: 2px `--focus-color` outline with 2px offset. `--focus-ring` is the normalized shadow-form token for consumers that use box-shadow focus treatment.
- Disabled: reduced opacity plus `not-allowed`; label remains legible.
- Loading: preserve width, use `--action-loading-*`, set `aria-busy="true"`, and change the visible label to a real progress phrase.

### Utility icons

Use `assets/icons.svg` before adding a new icon dependency. The collection is a 24px `currentColor` outline system with a 1.75px stroke and round caps/joins: menu, close, arrow-right, chevron-down, copy, check, refresh, alert, info, and file-plus. `currentColor` is the flexibility contract: use charcoal on near-white and near-white on charcoal without editing SVG geometry. The registered Showcase must visibly prove both pairings with inline canonical geometry so static captures never lose external sprite references. Use icons only for navigation, disclosure, direction, copy, recovery, evidence request, or reinforcement of a written state.

Keep action labels visible by default. An adjacent icon uses `aria-hidden="true"`; a legitimate compact icon-only control needs an explicit `aria-label`, focus-visible treatment, and a 44px target. Icons never replace the written Verified/Proposed/Open taxonomy, validation copy, or recovery instruction. Do not place an icon beside every heading, mix stroke weights, use filled icon families, or turn the collection into illustration.

### Panels and cards

Panels are bounded modules, not a sea of floating cards. Use `--surface-1` or `--surface-2`, `--text-*`, square or low-radius corners, 1px semantic strokes, clear labels, and deliberate content density. A selected panel uses the selected-state roles; an open-input panel uses `--status-open-*`. Never add a decorative left color border.

Panel anatomy is label/status → title → evidence or explanation → optional action. Do not add an action merely to fill the lower edge. On dark canvases, raise panels through surface steps and borders before adding shadow.

### Status labels

Use the exact taxonomy:

- **Verified** — supported by source and safe to apply. Use `--status-verified-*`.
- **Proposed** — reasoned recommendation, not historical fact. Use `--status-proposed-*` plus a coral boundary.
- **Open** — missing evidence; must not be fabricated. Use `--status-open-*`.

Every label is written, not communicated by color alone. The supporting sentence must name what was verified, proposed, or still needed; a badge without evidence context is decorative.

### Forms

Use visible labels above inputs. Inputs use `--field-bg`, `--field-fg`, `--field-border`, 4px radius, and 44px minimum height. Focus uses `--field-focus-border`. Invalid state adds `--field-invalid-*`, `aria-invalid="true"`, and a plain-language message tied with `aria-describedby`. Checkboxes may use signal yellow for checked state only when the adjacent label remains visible.

Placeholder text is an example format, never the only label. Read-only fields use `--field-readonly-*` when the value should remain selectable and inspectable. Disabled fields use `--field-disabled-*` only when interaction is unavailable. Validating and valid states use their dedicated field roles without introducing a decorative success hue. Loading or validation feedback must preserve layout instead of shifting adjacent controls.

### Feedback and recovery

Feedback has three semantic treatments without adding decorative hues: neutral uses `--feedback-neutral-*`, error uses `--feedback-error-*`, and notice uses `--feedback-notice-*`. Every message writes the state in words. Error and recovery copy follows **what happened → what remains safe → next available action**. Use `role="status"` for non-urgent updates and `role="alert"` only when immediate attention is required.

### Evidence media

Owned captures use `--evidence-media-*` for the plate and `--evidence-caption-*` for the source label and explanation. Open, loading, empty, and failed media states use their dedicated `--evidence-*` lifecycle roles. Preserve the source aspect ratio until a crop is documented. Keep captions outside clipping media regions. An Open media request stays visibly Open until owned evidence replaces it; a polished placeholder is not proof.

### System map

The source five-part decision chain is a reusable product component: **Context → Work → Checks → Handoffs → Recovery**. On desktop, show an equal-column sequence with compact direction connectors; on mobile, hide the connectors and stack it vertically in document order. Each step needs a concrete question, not an icon-only label. Add a written recovery-to-context note so failure produces a better next input rather than looking like a terminal state.

Do not remove steps to make the row fit. At narrower widths, switch from five columns to two columns, then one. The component is a decision sequence rather than a progress meter, so do not imply completion percentages without real workflow state.

### Logo tiles

Use the exact adopted SVGs in `logos/`. Byte-identical source copies remain under `assets/` as provenance evidence:

- `Logo---Ryan-1.svg`: charcoal mark on light surfaces.
- `Logo---Ryan-2.svg`: coral mark on controlled light or dark surfaces.
- `Logo---Ryan-3.svg`: signal-yellow mark on charcoal.
- `Logo---Ryan-4.svg`: white mark on charcoal, coral, or protected dark imagery.

Center logo tiles with grid or flex on both axes. Center the visible glyph optically, not only the image element’s rectangular box. Preserve the `255 × 211` viewBox proportions. Do not stretch, skew, outline, recolor, split the lightning, or add shadows. `Ryan Brosas` may be a plain typographic name lockup; **Agent Systems Builder** remains secondary and never enters permanent logo geometry.

## Motion and Interaction

Motion is functional and restrained:

- Standard transition: `150ms` for hover and pressed feedback.
- Panel/menu transition: `220ms` for opacity and a maximum 6px movement.
- Do not animate layout over long distances.
- Do not loop decorative motion.
- Respect `prefers-reduced-motion: reduce` by removing transforms and nonessential transitions.

Required interaction states are hover, focus-visible, active/selected, disabled, loading, and invalid where applicable. Copy actions use the Clipboard API and announce success through an `aria-live` status. Secondary-track choices persist only when that behavior is useful; never hide the primary page structure behind filters.

Theme changes may use a short color transition but must not animate layout. Apply the theme attribute before rendering the main interface when possible to avoid a light-mode flash.

## Reusable Implementation Notes

### Start order

1. Load root `tokens.css` once. Do not also load `colors_and_type.css` or `system/variables.css` in the same consumer artifact.
2. Apply `data-theme="light"` or `data-theme="dark"` to the owned root.
3. Read `component-manifest.json` for the component anatomy and state contract.
4. Load `assets/components/Primitives.js` and `assets/components/LifecycleComponents.js` before any composed runtime component.
5. Reuse the implementation listed by the manifest; preview markup is not a substitute.
6. Build extensions from semantic and component roles rather than source pigments.
7. Load the correct production SVG from `logos/`.
8. Populate content using the Verified/Proposed/Open taxonomy.
9. Add real states, recovery copy, and responsive behavior before visual polish.
10. Check the light and dark contracts side by side before treating either mode as complete.

### Showcase and registered-package contract

The Open Design Showcase reads `system/kit.html` from the registered design-system directory. The active token channel reads the root `manifest.json` and `tokens.css`; it does not infer tokens from `system/variables.css` or `preview/`. Keep these surfaces synchronized:

- `manifest.json` — the normalized Open Design package map; its id remains `brand-design-system`, which is served as `user:brand-design-system`.
- `tokens.css` — the runtime token entry loaded into AI-authored artifacts and package context.
- `DESIGN.md` — human-readable rules.
- `brand.json` — machine-readable identity, source evidence, and implementation pointers.
- `colors_and_type.css` and `system/variables.css` — canonical and packaged token contracts.
- `component-manifest.json` — anatomy, states, accessibility, responsiveness, and content integrity.
- `ui_kits/app/components/` — editable source for the seven runtime implementations.
- `assets/components/` — byte-identical registered distribution that the applied kit and downstream consumers actually load.
- `system/kit.html` and `system/kit.dark.html` — the registered light/dark Showcase surfaces.
- `logos/` — the canonical four adopted SVGs; byte-identical copies under `assets/` are used by the served Showcase because `assetsDir` is the registered static boundary.

An in-place refinement is incomplete until the registered `user:brand-design-system` record contains the current files, remains the same id, is marked published, and its Showcase renders the production logo rather than a generated placeholder mark.

Component refinement is incomplete until the registered package contains the same seven runtime files named by `component-manifest.json`, the applied kit loads them in the documented order, and no unreferenced prototype remains in the active component directory.

`colors_and_type.css` is the canonical maintainer authoring source. Root `tokens.css` and `system/variables.css` are generated, self-contained mirrors. Generated artifacts and downstream consumers load only root `tokens.css`; maintainers edit `colors_and_type.css`, regenerate both mirrors, and verify byte parity. The system mirror preserves the legacy package surface. Never load or hand-maintain divergent token sheets. `system/theme.json` provides explicit token inventories and must not use wildcard names that require consumer-specific expansion.

### Mode-safe component recipe

```css
.component {
  background: var(--surface-1);
  color: var(--text-1);
  border: 1px solid var(--stroke-subtle);
  border-radius: var(--radius-panel);
}
.component__meta { color: var(--text-2); }
.component__action {
  background: var(--action-primary-bg);
  color: var(--action-primary-fg);
}
```

Do not branch component CSS with separate hard-coded light and dark selectors unless the component is an intentional fixed brand plate. The semantic roles already carry mode behavior.

### Form-field recipe

```css
.field {
  min-height: var(--target-min);
  background: var(--field-bg);
  color: var(--field-fg);
  border: 1px solid var(--field-border);
  border-radius: var(--radius-control);
}
.field[aria-invalid="true"] {
  background: var(--field-invalid-bg);
  border-color: var(--field-invalid-border);
}
.field[readonly] {
  background: var(--field-readonly-bg);
  color: var(--field-readonly-fg);
  border-color: var(--field-readonly-border);
}
```

Use `--field-placeholder` only for example formats; it maps to the contrast-safe secondary text role rather than faint tertiary text. Disabled fields use `--field-disabled-bg` and remain legible.

### Responsive implementation

- Verify no horizontal page scroll at 360, 390, 430, 600, 768, 820, 1024, 1366, 1440, and 1920px.
- Collapse complex grids at measured source breakpoints: 1024px, 820px, and 600px.
- Let type wrap; never use `white-space: nowrap` on display statements or values that can grow.
- Redesign navigation and action groups for mobile instead of shrinking desktop controls.
- Keep source examples unchanged; adaptation belongs in `ui_kits/app/` and downstream products.

## Voice and Brand

The voice is casual, nerdy, exploratory, specific, honest, and non-corporate. Ryan sounds like a builder thinking through a real system in public.

### Identity language

- Name: **Ryan Brosas**.
- Descriptor: **Agent Systems Builder**.
- Primary statement: **I build agent systems so repetitive work stops coming back to you.**
- Campaign line: **Building systems so everything doesn’t need you.**

Keep the descriptor secondary. Use the campaign line in presentations and campaigns, never as part of the permanent logo lockup.

### Writing pattern

For personal build logs: exploration → expectation → what happened → what broke → next rabbit hole.

For client/explainer surfaces: problem → system choice → tradeoff → evidence → next step.

Use first person, concrete verbs, short paragraphs, plain technical language, and genuine questions. Natural `lol` or `kek` may appear in a real build log, but never force it. Explain when a script or process change is more honest than an agent.

### Voice calibration

| Dimension | Target | Avoid |
|---|---|---|
| Confidence | Clear about what the evidence supports | Certainty theater or vague disclaimers |
| Technical depth | Concrete enough to name context, checks, handoffs, and recovery | Jargon without an operational consequence |
| Energy | Curious and direct | Hype, chest-thumping, or corporate polish |
| Humor | Occasional and natural | Forced slang or a joke in every paragraph |
| Failure | Plainly reported with consequence and next question | Turning every bug into a victory story |

### Disclosure grammar

- **Verified:** “The source files show…” followed by the exact evidence.
- **Proposed:** “I’d use…” followed by the tradeoff and why.
- **Open:** “Still needed:” followed by the owned proof required.

Prefer “The first agent completed the task, but the handoff lost the failure context” over “The workflow needs better reliability.” Prefer “A script is enough here” over inflating a process change into an AI feature.

### Voice acceptance test

Copy passes when a reader can identify the work, the system choice, the evidence boundary, and the next step. Copy fails when it could belong to any AI consultancy after replacing the name. Lead with the operating consequence, then name the mechanism. A Verified sentence names its source; a Proposed sentence names its tradeoff; an Open sentence starts with **Still needed:** and names the proof. Interface errors name what happened, what remains safe, and what the person can do next.

For marketing surfaces, keep each section to one operating consequence, one system mechanism, and one evidence boundary. For component documentation, use an imperative instruction and name the implementation file. This keeps voice guidance executable rather than merely tonal.

### Banned phrases

Do not use: “unlock the power of AI,” “revolutionize,” “10x productivity,” “digital workforce,” “seamless,” “cutting-edge,” “transform your business,” or “AI-powered solution.”

## Assets and Imagery

Prefer owned evidence: product screenshots, terminal captures, workflow diagrams, context maps, usage/cost evidence, checks, failure states, recovery paths, and bugs that changed the design.

`assets/reference/Untitled.png` is a contained inspiration board only. Extract scale contrast, strong crops, image/type tension, collage, and mixed rhythm. Do not copy third-party characters, layouts, logos, or photographs from it into new artifacts.

Raster logo files are compatibility references. Adopted production SVGs live under `logos/`; byte-identical source copies remain under `assets/`. Source page screenshots under `assets/source-previews/` are review evidence, not replaceable UI assets.

The primary approved hero illustration is `assets/illustrations/agent-operator-hero-system-conductor-clean-print.png`. Its full-body conductor pose and sweeping coral cable make it the expressive lead asset for website heroes, presentation covers, campaign openers, and major section introductions. Preserve the complete figure, cable sweep, connected modules, transparent margin, and yellow junction signal. Default to a light semantic surface; on charcoal, place it on a protected light plate so the dark modules remain legible. It is a narrative hero, never operating evidence, a functional icon, or a substitute for the R/lightning mark.

The approved editorial illustration layer currently contains eleven production assets under `assets/illustrations/`: `agent-operator-context-assembly-clean-print.png`, `agent-operator-recovery-loop-clean-print.png`, `agent-operator-guardrail-check-clean-print.png`, `agent-operator-evidence-review-clean-print.png`, `agent-operator-memory-update-clean-print.png`, `agent-operator-budget-boundary-clean-print.png`, `agent-operator-scheduled-run-clean-print.png`, `agent-operator-failure-triage-clean-print.png`, `agent-operator-checked-handoff-clean-print.png`, `agent-operator-work-execution-clean-print.png`, and `agent-operator-system-choice-clean-print.png`. All eleven are transparent, fully in frame, and use clean cel blocks with sparse intentional ink texture. Context assembly, guardrail check, evidence review, memory update, budget boundary, scheduled run, failure triage, checked handoff, work execution, and system choice are proven on light semantic surfaces; recovery loop is proven on a protected charcoal plate. Keep each complete silhouette and clear margin. These illustrations support explanation and campaign rhythm; they never substitute for operating evidence, functional icons, or the R/lightning mark.

## Anti-patterns

- Generic SaaS dashboards or a field of identical rounded cards.
- Purple gradients, decorative gradients, neon AI color, and glowing effects.
- Condensed, narrow, or poster-heavy type used to simulate energy.
- A full-page yellow background, especially behind the yellow mark.
- More than one dominant expressive flourish per screen.
- Excessive pills, emoji feature icons, or an icon beside every heading.
- Decorative left-accent cards.
- Generic robots, AI brains, floating chat bubbles, or “future of AI” stock imagery.
- Invented metrics, testimonials, clients, project results, or outcomes.
- Hiding missing evidence behind polished placeholder media.
- Recoloring, stretching, shadowing, or reconstructing the R/lightning mark.
- Making **Agent Systems Builder** or the campaign line permanent logo geometry.
- Treating Personal Branding and Client Branding as primary pages.
- Motion without state, hierarchy, or navigation value.

## Application Checklist

Before shipping an artifact:

1. Confirm the audience and primary job are explicit.
2. Label uncertain content Verified, Proposed, or Open.
3. Load root `tokens.css` once; do not recreate the palette by eye or load multiple token mirrors.
4. Use the correct preserved SVG for its background.
5. Verify the visible logo glyph is optically centered in every tile.
6. Keep typography normal-width, readable, and within the declared measures.
7. Repeat coral and ration yellow.
8. Demonstrate real hover, pressed, focus-visible, selected, read-only, disabled, loading, invalid, error, and notice states where relevant.
9. Check Context, Work, Checks, Handoffs, and Recovery when describing an agent system.
10. Remove hype, invented proof, generic AI imagery, and unresolved placeholders masquerading as facts.
11. Confirm the registered Showcase uses `system/kit.html`, displays the adopted logo collection, and matches the current package version.
12. Compare light and dark role proofs side by side; do not accept a mode that depends on one-off component overrides.
13. Confirm `manifest.json` is valid, `tokens.css` is available through the registered static endpoint, and both `tokens.css` and `system/variables.css` match `colors_and_type.css` without relying on `@import`.
14. Confirm every rewritten Showcase CSS, logo, and evidence URL returns 200.
15. Confirm `system/theme.json` lists concrete token names and the registered distribution contains no unreferenced off-brand prototypes.
16. Confirm generated artifacts load `tokens.css` once, and loading, validating, empty, error, and recovery states consume dedicated component roles.
17. Confirm every active component file is loaded by `ui_kits/app/index.html`, named by `component-manifest.json`, and visibly exercised by the applied kit.
