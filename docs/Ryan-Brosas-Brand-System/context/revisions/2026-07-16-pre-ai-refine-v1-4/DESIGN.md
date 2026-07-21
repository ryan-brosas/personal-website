# Ryan Brosas Brand System

> Category: personal brand and operational workbench design system  
> Surface: responsive web, presentations, documents, and AI-authored artifacts  
> Source project: `Brand Design System` (`826ae961-1707-4719-8146-6b6aa312b6f8`)  
> Design system id: `user:brand-design-system`  
> Package version: `1.3.0` — AI-extracted semantic-role and light/dark refinement  
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

## Color

The palette was sampled from `Group-1.png` and confirmed by the SVG fills. Use the canonical values from `colors_and_type.css`.

| Token | Hex | Role |
|---|---:|---|
| `--color-paper` / `--bg` | `#FEFEFE` | Primary reading canvas and light surface |
| `--color-charcoal` / `--fg` | `#1A1A1A` | Main text, structure, and preferred dark canvas |
| `--color-coral` / `--accent` | `#FF5555` | Repeated action, selection, expressive rule, and accent mark |
| `--color-signal` / `--signal` | `#ECC90F` | Scarce focal signal, warning, and protected logo tile |

Supporting muted text, borders, hover plates, and shadows are alpha or `color-mix()` derivations of the four canonical colors. Do not introduce decorative hues. When a domain needs a semantic success or error state, pair a written label and shape with the closest canonical color before adding another color.

### Token architecture

Do not bind components directly to source pigments unless the role must remain constant in both modes. Use this three-layer model:

1. **Source pigments** — `--color-paper`, `--color-charcoal`, `--color-coral`, and `--color-signal`. These are evidence and never change by theme.
2. **Mode roles** — `--canvas`, `--surface-1`, `--surface-2`, `--surface-3`, `--surface-inverse`, `--text-1`, `--text-2`, `--text-3`, and `--stroke-*`. These change under `[data-theme="dark"]`.
3. **Component roles** — `--action-*`, `--state-selected-*`, `--status-*`, `--feature-*`, and `--focus-ring`. Components consume these names rather than reconstructing colors.

The legacy aliases `--bg`, `--surface`, `--fg`, `--muted`, `--border`, `--accent`, `--signal`, and `--on-dark` remain for preserved source compatibility. New components should prefer the semantic roles.

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
| Display L | `clamp(2.75rem, 6vw, 5.5rem)` | `0.94` | `720` | Page hero and section thesis |
| Heading M | `clamp(2rem, 4vw, 3.5rem)` | `1.00` | `700` | Major workbench section |
| Heading S | `1.25rem–1.5rem` | `1.15` | `650` | Panel and component title |
| Body | `1rem–1.125rem` | `1.55–1.65` | `400` | Explanations, maximum 70 characters |
| Label | `0.6875rem–0.8125rem` | `1.2` | `700` | Uppercase mono metadata |

Use mono only for indices, labels, specifications, token values, and technical evidence. Do not use condensed or narrow faces. Editorial energy comes from scale, alignment, repetition, and crop—not from squeezing letterforms.

### Typography roles

- `--weight-regular: 400` for explanations and longer reading.
- `--weight-medium: 600` for controls and supporting emphasis.
- `--weight-strong: 700` for component titles, navigation, and labels.
- `--weight-display: 750` for short hero and campaign statements only.
- `--leading-display: 0.92`, `--leading-heading: 1`, and `--leading-body: 1.6` keep the family readable at different scales.
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

Use semantic component roles from `colors_and_type.css`. Components may use source pigments directly only for the production logo, coral primary action, signal-yellow Open state, and protected presentation plates.

### Navigation

The primary navigation exposes exactly Brand Strategy, Brand Presentation, and Brand Guidelines. Active state uses a coral underline or `--state-selected-*`. Personal Branding and Client Branding appear only as secondary segmented controls. A light/dark preference may sit beside those controls but must not compete with page hierarchy.

- Anatomy: brand home, three primary destinations, secondary track control, optional theme preference.
- States: default, hover, current page, focus-visible, expanded mobile menu.
- Mobile: replace the full page list with a labelled button using `aria-expanded`; keep track and theme preferences reachable without horizontal page scroll.
- Theme preference: write `data-theme` on the document root and persist only as a device-local preference.

### Buttons

- Primary: `--action-primary-bg`, `--action-primary-fg`, 1px matching border, 4px radius.
- Secondary: `--action-secondary-bg`, `--action-secondary-fg`, `--action-secondary-border`.
- Quiet: transparent surface with an underline or border appearing on hover.
- Minimum target: 44px high.
- Hover: `--action-primary-hover` or a maximum 2px translate, never a glow.
- Pressed/selected: `aria-pressed="true"` plus `--state-selected-*`; do not fake selection with hover styling.
- Focus-visible: 2px `--focus-ring` outline with 2px offset.
- Disabled: reduced opacity plus `not-allowed`; label remains legible.
- Loading: preserve width, set `aria-busy="true"`, and change the visible label to a real progress phrase.

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

Use visible labels above inputs. Inputs use `--surface-1`, `--text-1`, `--stroke-default`, 4px radius, and 44px minimum height. Invalid state adds a coral boundary, `aria-invalid="true"`, and a plain-language message tied with `aria-describedby`. Checkboxes may use signal yellow for checked state only when the adjacent label remains visible.

Placeholder text is an example format, never the only label. Disabled fields remain readable. Loading or validation feedback must preserve layout instead of shifting adjacent controls.

### System map

The source five-part decision chain is a reusable product component: **Context → Work → Checks → Handoffs → Recovery**. On desktop, show an equal-column sequence; on mobile, stack it vertically. Each step needs a concrete question, not an icon-only label.

Do not remove steps to make the row fit. At narrower widths, switch from five columns to two columns, then one. The component is a decision sequence rather than a progress meter, so do not imply completion percentages without real workflow state.

### Logo tiles

Use the exact SVGs in `assets/`:

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

1. Load `colors_and_type.css`.
2. Apply `data-theme="light"` or `data-theme="dark"` to the owned root.
3. Build components from semantic roles rather than source pigments.
4. Load the correct SVG asset from `assets/`.
5. Populate content using the Verified/Proposed/Open taxonomy.
6. Add real states and responsive behavior before visual polish.

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

### Banned phrases

Do not use: “unlock the power of AI,” “revolutionize,” “10x productivity,” “digital workforce,” “seamless,” “cutting-edge,” “transform your business,” or “AI-powered solution.”

## Assets and Imagery

Prefer owned evidence: product screenshots, terminal captures, workflow diagrams, context maps, usage/cost evidence, checks, failure states, recovery paths, and bugs that changed the design.

`assets/reference/Untitled.png` is a contained inspiration board only. Extract scale contrast, strong crops, image/type tension, collage, and mixed rhythm. Do not copy third-party characters, layouts, logos, or photographs from it into new artifacts.

Raster logo files are compatibility references. SVGs are the production sources. Source page screenshots under `assets/source-previews/` are review evidence, not replaceable UI assets.

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
3. Load `colors_and_type.css`; do not recreate the palette by eye.
4. Use the correct preserved SVG for its background.
5. Verify the visible logo glyph is optically centered in every tile.
6. Keep typography normal-width, readable, and within the declared measures.
7. Repeat coral and ration yellow.
8. Demonstrate real hover, focus-visible, selected, disabled, loading, and invalid states where relevant.
9. Check Context, Work, Checks, Handoffs, and Recovery when describing an agent system.
10. Remove hype, invented proof, generic AI imagery, and unresolved placeholders masquerading as facts.
