# Ryan Brand Design System Plan

**Status:** V1.3 - identity copy locked; real project media files still pending  
**Source of truth:** This plan plus `brand-spec.md`  
**Planned surface:** Desktop-first responsive web workbook in Open Design

## Intent

Create an editable, browser-viewable brand system that Ryan can use directly and hand to an AI as an operational source of truth. It must serve two secondary tracks - Personal Branding and Client Branding - through exactly three primary pages: Brand Strategy, Brand Presentation, and Brand Guidelines.

The everyday system should be calm, modular, and easy to scan. The expressive layer may use editorial scale, collage, strong image crops, and street-poster rhythm, but only in presentation and campaign moments.

Ryan's practical focus is building agent systems and simpler automation for overworked CEOs and founders whose businesses still route repetitive work, checking, research, and information movement back through them. The brand should make systems thinking understandable without AI-guru hype or corporate vagueness.

## V1 definition of done

V1 is complete when a user can:

1. move between the three primary pages without ambiguity;
2. see verified brand assets and rules separated from proposals and unanswered questions;
3. inspect and copy canonical color, typography, spacing, logo, and AI-handoff rules;
4. switch relevant examples between Personal Branding and Client Branding contexts;
5. preview each logo variant on approved light, dark, coral, and image-safe contexts;
6. understand what to do and what not to do without relying on invented examples;
7. use the workbook at desktop, tablet, and mobile widths without clipped or horizontally scrolling content.

## Scope boundary

### In scope for V1

- A lightweight `index.html` launcher/overview.
- Three user-facing screens:
  - `brand-strategy.html`
  - `brand-presentation.html`
  - `brand-guidelines.html`
- The existing `brand-spec.md` as the evidence record.
- A copyable AI brand-rules module inside Brand Guidelines.
- A small, representative UI kit covering Navigation, Button, Card/Panel, and Form patterns.
- Required interaction states: default, hover, focus-visible, active/selected, disabled, loading, and validation where applicable.
- Responsive layouts for desktop, tablet, and mobile web.
- Existing SVG and raster assets referenced by their real filenames.

### Explicitly out of scope for V1

- A drag-and-drop design editor, CMS, account system, or cloud persistence.
- A complete enterprise component library.
- Native iOS, Android, tablet-app, or desktop-app implementations.
- Invented brand strategy, testimonials, clients, project results, or metrics.
- A wordmark, tagline lockup, or additional logo geometry without approved source artwork or text.
- Final social, print, favicon, or app-icon export packs before minimum-size testing.
- Recreating any layout from `Untitled.png`; only transferable design principles may be used.

### Meaning of editable

For V1, editable means the HTML is structured, inspectable, token-driven, and easy to revise in Open Design. It does not mean building a separate visual editor inside the artifact.

## Source hierarchy and inference policy

Use sources in this order:

1. Ryan's explicit instructions and approved edits.
2. Verified values in `brand-spec.md` and the supplied source assets.
3. This plan's locked decisions.
4. Proposed system values in this plan.
5. Honest open states when none of the above provides an answer.

Every content module must show one status:

- **Verified** - directly supported by supplied assets or user approval.
- **Proposed** - a reversible recommendation awaiting approval.
- **Open** - requires user content or a decision; never fill it with invented copy.

## Locked foundations

### Source assets

- `Logo---Ryan-1.svg`: charcoal symbol.
- `Logo---Ryan-2.svg`: coral symbol.
- `Logo---Ryan-3.svg`: signal-yellow symbol.
- `Logo---Ryan-4.svg`: white symbol.
- `Group-1.png`: authoritative palette strip.
- `Untitled.png`: inspiration board; reference only.
- `Original-Logo-_1.png` and `Original-Logo-_1-_1_.png`: compatibility-only raster previews.

### Palette

Use the exact source-derived values from `brand-spec.md`:

| Role | Value | Rule |
|---|---:|---|
| Near-white | `#FEFEFE` | Primary reading canvas and light surface |
| Charcoal | `#1A1A1A` | Main text and preferred dark canvas |
| Coral | `#FF5555` | Main accent for actions, selected states, and expressive detail |
| Signal yellow | `#ECC90F` | Scarce signal, logo tile, warning, or one deliberate focal gesture |

Do not add decorative hues or gradients. If a state cannot be communicated accessibly with the brand palette, add text, shape, or iconography before proposing a new color.

### Typography

- Use a normal-width, neutral sans stack with comfortable body sizing and line height.
- Do not use condensed or narrow typography.
- Use editorial scale, cropping, repetition, and alignment to create energy instead of excessive weight.
- Use mono only for labels, token values, metadata, and specifications.
- Keep the provisional stacks in `brand-spec.md` until licensed font files are supplied.

### Geometry and rhythm

- Base spacing rhythm: 8px.
- Borders: 1px using source charcoal at reduced opacity.
- Proposed radii: 0px for editorial plates, 4px for compact controls, and 8px maximum for standard panels.
- Reserve the rounded-square silhouette for the logo tile and intentionally selected controls.
- Prefer flat modules, fine rules, whitespace, and clear grids over card-heavy SaaS styling.

### Visual posture

- Product/workbench layer: calm, modular, restrained, and readable over long sessions.
- Brand-presentation layer: expressive, image-led, and editorial, with one decisive flourish per screen.
- Coral is the repeatable accent; yellow is a scarce signal.
- The R/lightning mark should read as a confident stamp with protected space.
- No purple gradients, generic feature-card rows, filler copy, or invented proof.

## Deliverable architecture

### `index.html` - launcher only

- State the purpose of the workbook in one short paragraph.
- Link to the three primary pages.
- Show the current plan status and unresolved-input count.
- Do not make the launcher a fourth content page.

### Shared navigation

- Keep Brand Strategy, Brand Presentation, and Brand Guidelines visible at all times on desktop.
- Convert navigation to a compact menu on narrow screens without hiding the current page label.
- Show Personal Branding and Client Branding as a secondary segmented filter only where examples differ.
- Preserve the selected secondary track during navigation using lightweight local storage.
- Do not use `scrollIntoView`.

### Shared module anatomy

Each major module must include:

- an inspectable heading with a unique `data-od-id`;
- a concise purpose or rule;
- a Verified, Proposed, or Open label;
- a source reference when verified;
- a visual example or specimen when it improves understanding;
- a copy action for machine-usable values or instructions;
- misuse guidance when the rule can be applied incorrectly.

## Page requirements

### 1. Brand Strategy

#### Goal

Explain what the brand stands for, who it serves, and how decisions should be made before visual execution.

#### Required modules

1. **Brand premise - Verified**
   - Verified intent: build agent systems and practical automation so repetitive work stops depending on the founder.
   - Approved primary statement: **I build agent systems so repetitive work stops coming back to you.**
   - Supporting audience explanation: **For CEOs and founders whose business is running, but still needs them for everything.**
   - Approved campaign line: **Building systems so everything doesn't need you.**
   - The campaign line may lead presentations and campaigns but must not become a permanent part of the logo lockup.

2. **Primary audience - Verified**
   - Overworked CEOs and founders with an operating business that still depends on them for recurring work and decisions.
   - They suspect automation would help but do not know what to automate first, how far to go, or whether AI is the right solution.
   - Their desired outcome is not "more AI"; it is fewer recurring dependencies on the founder, with clear oversight and failure handling.

3. **Secondary audience - Verified**
   - Operators, agency owners, developers, and advanced builders who have moved beyond basic ChatGPT prompting.
   - They are interested in agents, automation, system architecture, context, evaluation, and operational reliability.
   - The desired relationship is mutual learning and idea exchange, not guru-to-audience positioning.

4. **Positioning - Verified**
   - Ryan explores the whole operating system around an agent, not only whether a model can complete one task.
   - Key questions: Where does context come from? What happens when it fails? Who checks it? How do other agents know what happened? What still wakes a human at 3AM?
   - The brand is process-first and outcome-aware. Sometimes the correct answer is AI; sometimes it is a script; sometimes the process itself needs fixing.
   - Do not claim that agents can replace an entire company or that every workflow needs AI.

5. **Known-for traits - Verified**
   - Systems-level curiosity and a willingness to follow a problem deeper than the obvious task.
   - Honest documentation of what worked, what broke, and what remains unresolved.
   - Failure-aware agent design: context, handoffs, checks, observability, and recovery.
   - Practical judgment about when to use an agent, a script, or a process change.

6. **Brand principles - Verified synthesis**
   - Systems before spectacle.
   - Useful before impressive.
   - Honest about failure and uncertainty.
   - Curious enough to explore the whole workflow.
   - AI when it helps; simpler tools when they are better.
   - Share the process, not only the polished result.

7. **Voice system - Verified**
   - Casual, nerdy, exploratory, and transparent.
   - Write like Ryan is thinking through a real build in public: what he is exploring, what worked, what broke, and which rabbit hole is currently interesting.
   - Use first person, concrete verbs, plain technical language, short paragraphs, occasional fragments, and genuine questions.
   - Humor such as `lol` or `kek` may appear naturally in personal posts and build logs; do not force it into every message or formal client guidance.
   - Personal/exploration mode may be loose and conversational. Client/explainer mode keeps the same honesty but uses a clearer sequence: problem, system, tradeoff, evidence, next step.
   - Do not over-polish the voice into corporate copy or make it artificially chaotic.

8. **Language to avoid - Verified**
   - `unlock the power of AI`
   - `revolutionize`
   - `10x productivity`
   - `digital workforce`
   - `seamless`
   - `cutting-edge`
   - `transform your business`
   - `AI-powered solution`
   - Any current hype phrase that makes a claim sound bigger while making the actual system less clear.

9. **Decision filter - Verified synthesis**
   - Is it recognizably Ryan without the logo?
   - Is it easy to scan, reuse, and hand off?
   - Is the expressive gesture concentrated rather than repeated?
   - Can an AI follow the rule without guessing?
   - Does it explain what was actually built, including tradeoffs and failure paths?
   - Would a script or process fix be more honest than calling this an AI solution?

#### Page acceptance

- The approved primary statement, descriptor, and campaign line are reproduced consistently.
- The two tracks are comparable without becoming separate primary pages.
- Every approved strategy statement can be copied as plain text.
- Voice examples sound conversational and specific, never like AI consultancy boilerplate.
- At least one before/after example removes hype without removing useful technical detail.

### 2. Brand Presentation

#### Goal

Show the identity as a concise visual story, distinct from the technical guideline inventory.

#### Narrative sequence

1. **Opening statement** - one message, one logo treatment.
2. **The mark** - the R/lightning form, source variants, and what is verified versus interpretive.
3. **Color impact** - charcoal/near-white foundation, coral accent, controlled yellow signal.
4. **Type behavior** - large normal-width headlines, readable body copy, compact utility labels.
5. **Editorial world** - original layouts using scale contrast, crop, collage, and image/type tension.
6. **Calm system world** - modular workbench examples with fine rules and restrained accents.
7. **Personal Branding application** - one portfolio or case-study example.
8. **Client Branding application** - one discovery or guideline example.
9. **Closing signature** - approved brand statement and preferred mark treatment.

#### Media rules

- Display `Untitled.png` only as a contained source board with an explicit reference label.
- Do not lift third-party logos, copy, characters, photographs, or layouts from the board into new compositions.
- Use owned, commissioned, generated, or properly licensed images for application examples.
- If real application media is unavailable, use an honest labelled placeholder rather than generic stock or invented work.
- Feature the approved project categories: Agent coding system, Second Brain Studio, agent usage/cost tracker, and automation experiments.
- Preferred evidence: real screenshots, workflows, diagrams, terminal captures, and documented bugs or failure states.
- Pixel art or anime-influenced visuals may appear as a secondary expressive layer when they support the story; do not turn them into a generic mascot system.
- Never use glowing robot brains, neon AI heads, floating chat bubbles, or generic humanoid-robot imagery.
- [TODO: Ryan] Attach or identify 1-2 owned assets for each featured project category.

#### Page acceptance

- Each section carries one clear visual idea.
- The contained moodboard is never used as a full-page background.
- Personal and Client examples share the same system but demonstrate distinct jobs.
- No example implies a real client, outcome, or metric without supplied evidence.

### 3. Brand Guidelines

#### Goal

Provide the operational reference a designer, developer, or AI can follow without silent assumptions.

#### Foundation modules

1. **Color**
   - Canonical hex and OKLCH values from `brand-spec.md`.
   - Role definitions, approved pairings, disallowed pairings, and contrast results.
   - Examples showing coral as accent and yellow as signal.

2. **Typography**
   - Display, body, utility, and mono roles.
   - Proposed web scale: 12/16 label, 16/24 body, 20/30 lead, 32/40 section title, and `clamp(48px, 7vw, 88px)` display.
   - Maximum body line length: 70 characters; preferred range: 45-65.
   - No condensed or narrow faces.
   - [OPEN] Remain font-file-free in V1 or adopt a licensed display family later.

3. **Spacing and layout**
   - 8px spacing rhythm.
   - Desktop grid: 12 columns; tablet: 8 columns; mobile: 4 columns.
   - Proposed gutters: 24px mobile, 32px tablet, 48px desktop.
   - Document calm product density separately from expressive campaign density.

4. **Shape, border, and elevation**
   - 0/4/8px radius roles.
   - 1px borders using the canonical border token.
   - Elevation only for menus, dialogs, or primary controls that need separation; no decorative floating-card field.

5. **Imagery and collage**
   - Crop, focal point, masking, grain, layering, caption plates, and safe overlay rules.
   - No text or label may obscure a face or key subject.
   - Keep product/editor imagery calmer than campaign collage.

#### Logo modules

1. **Variant matrix**
   - Charcoal: default on light.
   - Coral: accent variant on controlled light or dark surfaces.
   - Yellow: signal variant on charcoal.
   - White: reversed on dark, coral, or protected image plates.

2. **Clear space**
   - Derive the unit from a stable internal feature of the supplied SVG.
   - Render the measurement before publishing a numeric rule.
   - Keep text, trim lines, and other marks outside the protected area.

3. **Minimum size**
   - Test at favicon, app-icon, navigation, social-avatar, and print sizes.
   - Publish separate digital and print minimums only after the lightning detail is visibly intact.

4. **Background control**
   - Show approved solid pairings.
   - Provide a solid or blurred protected plate for photography.
   - Choose variants by contrast and surrounding color, not preference.

5. **Misuse**
   - No unapproved recoloring, stretching, skewing, outlining, gradients, or shadows.
   - Do not detach or redraw the lightning detail.
   - No full-page yellow field behind the yellow mark.
   - Use SVG wherever scalable artwork is supported.

6. **Name lockup and exports - Verified**
   - Verified name styling: **Ryan Brosas**.
   - No invented company name or inflated studio posture.
   - Approved descriptor: **Agent Systems Builder**. Keep it removable and secondary to the name.
   - Approved campaign line: **Building systems so everything doesn't need you.** Do not lock it into the logo.
   - The R/lightning symbol remains valid as a standalone mark.
   - A simple typographic name lockup may be created from the approved text; do not redraw the symbol or invent a separate wordmark glyph.

#### Representative component kit

The kit demonstrates brand behavior rather than attempting to cover an entire product.

| Pattern | V1 coverage | Required states |
|---|---|---|
| Navigation | Primary page navigation and secondary track filter | default, current, hover, focus-visible, compact mobile |
| Button | Primary, secondary, quiet, icon-only | default, hover, focus-visible, pressed, disabled, loading |
| Card/Panel | Information panel, image plate, specification panel | default, selected, light, dark |
| Form | Label, text input, textarea, select, checkbox | empty, filled, focus, invalid, disabled |
| Brand specimen | Logo matrix, palette, type sample, misuse comparison | verified, proposed, open |

Deferred until a real product brief requires them: data tables, pagination, toast systems, complex dialogs, date pickers, charts, and application-specific navigation.

#### AI handoff module

Include one copyable instruction block containing:

1. the exact palette and role rules;
2. typography stacks and the no-condensed-type constraint;
3. logo filename-to-background mapping;
4. spacing, radius, border, and layout posture;
5. calm product versus expressive presentation behavior;
6. component-state expectations;
7. Ryan's casual, nerdy, build-in-public voice rules and the complete banned-phrase list;
8. the process-first rule: AI, script, or process change must be chosen honestly;
9. prohibited treatments, including glowing robot-brain imagery and generic AI visuals;
10. anti-fabrication rules and a requirement to label missing facts instead of guessing.

The copied text must work without the visual workbook open. It must reference local asset filenames exactly.

#### Page acceptance

- Token values are copyable and match `brand-spec.md` exactly.
- Each supplied SVG appears in at least one correct-context specimen.
- Component examples include keyboard-visible focus and disabled states.
- AI instructions contain no visual-only references such as "as shown above."

## Responsive and interaction behavior

### Required viewports

- Mobile: 360 x 800.
- Tablet: 768 x 1024.
- Desktop: 1440 x 900.
- Wide desktop: 1920 x 1080.

### Responsive rules

- No horizontal page scrolling at any required viewport.
- Modules reflow; they are not uniformly scaled down.
- Dense comparison tables become labelled stacked groups on mobile.
- Logo specimens preserve aspect ratio and protected space.
- Display type wraps without clipping adjacent content.

### Interaction rules

- All interactive controls work by keyboard.
- Focus is visible and not obscured by sticky or overlay elements.
- Copy actions provide a visible confirmation message.
- Track filtering never destroys content or changes the three-page structure.
- Controls use semantic HTML and expose an accessible name, role, and state.
- No interaction depends only on hover, drag, or color.

## Accessibility target

Target [WCAG 2.2 Level AA](https://www.w3.org/TR/WCAG22/) for the complete responsive pages.

- Normal text contrast: at least 4.5:1.
- Large text and meaningful non-text UI contrast: at least 3:1 where the applicable success criterion requires it.
- Touch/click targets: design to 44 x 44 CSS px as a project standard, exceeding the WCAG 2.2 AA 24 x 24 px minimum for most targets.
- Text remains usable at 200% zoom without loss of content or functionality.
- Every meaningful image has appropriate alternative text; decorative media uses empty alt text.
- Visible focus must remain unobscured.
- Color is never the only signal for state, selection, or error.

## Content and asset rules

- Use real supplied filenames; do not duplicate or rename source logos without a documented export reason.
- Do not hot-link remote media.
- Do not invent metrics, clients, testimonials, project outcomes, or brand claims.
- Preserve `Untitled.png` as a source reference, not as reusable production artwork.
- Label missing content clearly, for example: `Open - owned project image needed`.
- Do not use lorem ipsum or generic marketing filler.
- Prefer real build evidence: screenshots, terminal output, diagrams, workflows, costs, checks, failures, and fixes.
- Do not use generic glowing brains, robots, neon AI heads, or stock "future of AI" imagery.
- Pixel art and anime-influenced visuals are optional supporting texture, not the main proof of capability.

## Risks and mitigations

| Risk | Consequence | Mitigation |
|---|---|---|
| Campaign language is attached permanently to the logo | Flexible presentation copy becomes inflexible identity geometry | Keep the approved campaign line separate from the symbol and name lockup |
| The moodboard contains third-party work | Accidental copying or rights issues | Extract principles only; use owned or approved media in applications |
| V1 expands into a full UI library | Longer build with weaker brand focus | Limit components to Navigation, Button, Card/Panel, Form, and brand specimens |
| Yellow becomes a second primary accent | Brand loses hierarchy and readability | Restrict yellow to signal roles and one focal gesture per screen |
| The approved name is overdesigned into a fake company identity | Brand feels inflated or less personal | Use `Ryan Brosas` plainly; keep `Agent Systems Builder` secondary and removable |
| Expressive styling leaks into every module | Workbook becomes tiring and difficult to use | Keep core workbench calm; concentrate collage on Brand Presentation |

## Acceptance checklist

### Files and structure

- [ ] `index.html` links to all three primary screen files.
- [ ] The primary pages are exactly Brand Strategy, Brand Presentation, and Brand Guidelines.
- [ ] Personal Branding and Client Branding appear only as secondary filters or labels.
- [ ] Every major region and user-pointable control has a unique `data-od-id`.
- [ ] No required module is a stub or contains lorem ipsum.

### Source fidelity

- [ ] All four SVGs render successfully from their existing project-relative filenames.
- [ ] SVG colors and viewBox proportions remain unchanged.
- [ ] Canonical palette values match `brand-spec.md`: `#FEFEFE`, `#1A1A1A`, `#FF5555`, and `#ECC90F`.
- [ ] No unapproved color literal or decorative gradient is present.
- [ ] Raster logos are used only for compatibility demonstrations.
- [ ] `Untitled.png` is labelled as a reference board and is not copied into derivative layouts.

### Visual system

- [ ] Product/workbench modules are calm, flat, low-radius, and readable.
- [ ] Brand Presentation uses no more than one dominant expressive flourish per screen section.
- [ ] Coral is the repeated accent; yellow remains a scarce signal.
- [ ] Typography is normal-width with moderate weights and readable line lengths.
- [ ] Logo overlays sit fully inside a protected plate and do not cover a subject.

### Content integrity

- [ ] Every statement is labelled Verified, Proposed, or Open.
- [ ] Open questions are visibly incomplete and contain no invented answer.
- [ ] No client, metric, testimonial, result, or brand claim appears without supplied evidence.
- [ ] AI instructions are self-contained and reference exact asset filenames.
- [ ] All copy buttons reproduce their displayed values without mutation.
- [ ] The banned phrase list is included verbatim in the voice and AI-handoff modules.
- [ ] Personal voice examples are casual and specific without forcing `lol`, `kek`, fragments, or ellipses into every paragraph.
- [ ] Client-facing voice keeps the same honesty while making the problem, system, tradeoff, and next step easy to follow.

### Components and interaction

- [ ] Navigation, Button, Card/Panel, and Form examples are present.
- [ ] Required hover, focus-visible, pressed/selected, disabled, loading, and invalid states are demonstrated where applicable.
- [ ] Page navigation, secondary-track filtering, copy actions, and mobile navigation work.
- [ ] Keyboard order is logical and every interactive element has an accessible name.
- [ ] No console error occurs during the main flows.

### Responsive and accessibility

- [ ] No overlap, clipping, or horizontal page scroll at 360 x 800, 768 x 1024, 1440 x 900, or 1920 x 1080.
- [ ] Normal text meets 4.5:1 contrast and applicable large text/non-text UI meets 3:1.
- [ ] Controls use 44 x 44 CSS px project targets unless an inline-text exception is justified.
- [ ] Focus remains visible and unobscured in light and dark contexts.
- [ ] Content remains usable at 200% zoom.
- [ ] Images have correct alt behavior and status is never communicated by color alone.

### Logo validation and exports

- [ ] Clear-space measurements are derived from the SVG and visually demonstrated before publication.
- [ ] The lightning detail remains legible at every published minimum size.
- [ ] Digital and print minimum sizes are documented separately after testing.
- [ ] Any favicon, app-icon, social-avatar, or print export is generated from an SVG source.
- [ ] No wordmark or tagline lockup is generated without approved name styling.

## User input still needed

The audience, positioning, personality, voice, banned language, primary statement, descriptor, campaign line, name, and project categories are locked for V1. The current system-font stacks are also locked for V1; a licensed display family may be evaluated only as a later revision.

- [ ] **Application media files:** attach or identify 1-2 real screenshots, diagrams, workflows, terminal captures, or bug examples for each selected project category.

## Build sequence after approval

1. Create the launcher and three semantic screen files with shared source tokens.
2. Build shared navigation, secondary-track filtering, copy feedback, and responsive behavior.
3. Build Brand Strategy from the verified audience, positioning, principles, voice, approved identity copy, and anti-hype rules.
4. Build Brand Presentation using the verified mark, source palette, contained reference board, approved project categories, and honest media placeholders where files are still missing.
5. Build Brand Guidelines foundations, logo specimens, representative components, and AI handoff module.
6. Validate source filenames, token values, semantics, keyboard interaction, and console behavior.
7. Test all four required viewports, contrast pairings, 200% zoom, logo minimum sizes, and clear space.
8. Fix all acceptance failures before handoff; leave only real application media visibly Open.

## Next step

Attach the real project media when convenient. Until then, the approved V1 workbook and standalone `AI-BRAND-GUIDE.md` remain usable with honest media placeholders. Replace those placeholders only with owned or approved screenshots, workflows, diagrams, terminal captures, and documented failure states.
