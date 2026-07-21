# Ryan Brosas AI Brand Guide

Use this file as the self-contained brand instruction source for websites, applications, presentations, documents, social content, and other AI-assisted work.

## Identity

- Brand name: **Ryan Brosas**.
- Descriptor: **Agent Systems Builder**.
- Primary statement: **I build agent systems so repetitive work stops coming back to you.**
- Campaign line: **Building systems so everything doesn't need you.**
- Keep the descriptor secondary to the name and remove it in compact contexts when necessary.
- Use the campaign line in presentations and campaigns. Do not attach it permanently to the logo lockup.
- Do not invent a company name, studio name, or larger-company posture.

## Purpose

Ryan builds agent systems and practical automation for overworked CEOs and founders whose businesses still route repetitive work, checking, research, information movement, and recurring decisions back through them.

The goal is not to add more AI. The goal is to reduce recurring dependence on the founder with clear context, checks, handoffs, human oversight, and recovery paths.

## Audience

### Primary

Overworked CEOs and founders with an operating business that still depends on them for recurring work and decisions. They suspect automation may help but do not know what to automate first, how far to go, or whether AI is the right solution.

### Secondary

Operators, agency owners, developers, and advanced builders who have moved beyond basic prompting. They are interested in agents, automation, context, evaluation, operational reliability, and exchanging ideas rather than following a guru.

## Positioning

- Explore the whole system around the task, not only whether an agent can complete it.
- Always ask where context comes from, what happens on failure, who checks the result, how handoffs work, and who owns recovery.
- Choose honestly between an agent, a script, and a process change.
- Never claim that agents can replace an entire company or that every workflow needs AI.
- Show what worked, what broke, what remains unresolved, and what still requires human judgment.

## Brand principles

1. Systems before spectacle.
2. Useful before impressive.
3. Honest about failure and uncertainty.
4. Explore the whole workflow.
5. Use AI only when it is the better tool.
6. Share the process, not only the polished result.

## Voice

- Casual, nerdy, exploratory, honest, and non-corporate.
- Write like Ryan is thinking through a real build in public.
- Explain what he is exploring, what worked, what broke, the tradeoffs, and the next question.
- Use first person, concrete verbs, plain technical language, short paragraphs, occasional fragments, and genuine questions.
- Natural humor such as `lol` or `kek` may appear in personal build logs. Never force it.
- Do not polish the voice into corporate consultancy language or make it artificially chaotic.

### Personal and build-log sequence

Use a loose, conversational structure:

1. What Ryan is exploring.
2. What he expected.
3. What actually happened.
4. What broke or became interesting.
5. The next question or rabbit hole.

### Client and explainer sequence

Use a clearer structure while keeping the same honesty:

1. Problem.
2. System choice.
3. Tradeoff.
4. Evidence.
5. Next step.

## Phrases to avoid

Do not use these phrases:

- `unlock the power of AI`
- `revolutionize`
- `10x productivity`
- `digital workforce`
- `seamless`
- `cutting-edge`
- `transform your business`
- `AI-powered solution`

Also reject any current hype phrase that makes the claim sound bigger while making the actual system less clear.

## Canonical palette

Use only these brand colors unless an application requires an accessible domain-specific status color:

| Role | Hex | OKLCH | Use |
|---|---|---|---|
| Near-white | `#FEFEFE` | `oklch(0.9970 0 89.88)` | Primary reading canvas and light surface |
| Charcoal | `#1A1A1A` | `oklch(0.2178 0 89.88)` | Main text and preferred dark canvas |
| Coral | `#FF5555` | `oklch(0.6822 0.2063 24.43)` | Repeatable accent, primary actions, selected states, expressive detail |
| Signal yellow | `#ECC90F` | `oklch(0.8409 0.1711 96.14)` | Scarce signal, focal highlight, warning, or logo tile |

Supporting tokens:

```css
:root {
  --bg: oklch(0.9970 0 89.88);
  --surface: oklch(0.9970 0 89.88);
  --fg: oklch(0.2178 0 89.88);
  --muted: oklch(0.2178 0 89.88 / 0.68);
  --border: oklch(0.2178 0 89.88 / 0.16);
  --accent: oklch(0.6822 0.2063 24.43);
  --signal: oklch(0.8409 0.1711 96.14);
}
```

Color rules:

- Coral is the repeated brand accent.
- Yellow is a scarce signal, not a second primary accent.
- Do not use a full-page yellow canvas behind the yellow mark.
- Do not introduce decorative gradients, purple washes, or unapproved hues.
- If color cannot communicate a state accessibly, add text, shape, or iconography before adding another color.

## Logo assets

Use these exact project-relative filenames:

| File | Role | Approved context |
|---|---|---|
| `Logo---Ryan-1.svg` | Charcoal symbol | Near-white, pale neutral, or sufficiently light photography |
| `Logo---Ryan-2.svg` | Coral symbol | Controlled near-white, charcoal, or restrained photography |
| `Logo---Ryan-3.svg` | Signal-yellow symbol | Charcoal or very dark protected plates |
| `Logo---Ryan-4.svg` | White symbol | Charcoal, coral, or protected dark imagery |

Logo rules:

- Prefer SVG for scalable use. Raster logos are compatibility-only.
- Preserve the original aspect ratio and geometry.
- Do not stretch, skew, outline, recolor, separate the lightning, add gradients, or add decorative shadows.
- Choose the variant by background contrast, not personal preference.
- Use `Ryan Brosas` as a plain typographic name lockup. Do not invent a separate wordmark glyph.
- Keep the campaign line outside the permanent logo lockup.

## Typography

```css
--font-display: "Segoe UI Variable Display", "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--font-body: "Segoe UI Variable Text", "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--font-mono: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
```

- Use normal-width sans typography with moderate weights and comfortable line height.
- Do not use condensed or narrow fonts.
- Use editorial scale, cropping, alignment, and repetition to create energy instead of excessive weight.
- Use mono only for labels, metadata, specifications, token values, and technical evidence.
- Preferred body line length: 45-65 characters; maximum 70.

## Layout and component posture

- Use an 8px spacing rhythm.
- Use 1px structural borders.
- Use 0px radii for editorial plates, 4px for compact controls, and 8px maximum for standard panels.
- Keep product and workbench screens calm, flat, modular, and readable.
- Reserve expressive collage, oversized type, and strong crops for presentation or campaign moments.
- Use one decisive expressive flourish per screen.
- Avoid generic SaaS card fields, excessive pills, and decorative left-accent cards.
- Include real hover, focus-visible, active, disabled, loading, and validation states where applicable.
- Use minimum 44 x 44 CSS-pixel targets for important controls.

## Imagery and evidence

Prefer real build evidence:

- Product screenshots.
- Terminal captures.
- Workflow diagrams.
- Context and handoff maps.
- Cost or usage evidence.
- Checks, failure states, and recovery paths.
- Bugs that changed the system design.

Approved project categories:

- Agent coding system.
- Second Brain Studio.
- Agent usage/cost tracker.
- Automation experiments.

Pixel art and anime-influenced visuals may be supporting texture when they serve the story. They are not substitutes for proof.

Never use:

- Glowing robot brains.
- Neon AI heads.
- Floating chat bubbles as the main visual.
- Generic humanoid robots.
- Generic “future of AI” stock imagery.
- Third-party layouts, characters, logos, or photography copied from `Untitled.png`.

`Untitled.png` is a contained inspiration board only. Extract principles such as scale contrast, strong crop, image/type tension, collage, and mixed editorial rhythm. Create original layouts.

## Content integrity

- Never invent clients, metrics, testimonials, outcomes, project results, or brand claims.
- Never use lorem ipsum or generic marketing filler.
- Label every uncertain item as **Verified**, **Proposed**, or **Open**.
- When a real asset or fact is missing, use an honest placeholder such as `Open - owned project image needed`.
- Do not use visual-only instructions such as “match the example above.” State the actual rule.

## Final AI checklist

Before delivering any Ryan Brosas artifact, verify:

- [ ] The output serves overworked founders first and advanced builders second.
- [ ] The system choice is honest: agent, script, or process change.
- [ ] Context, checks, handoffs, and recovery are explained when relevant.
- [ ] The exact palette and correct SVG variant are used.
- [ ] Typography is normal-width and readable.
- [ ] Coral repeats while yellow remains scarce.
- [ ] The voice is casual, nerdy, specific, and honest without becoming sloppy.
- [ ] No banned hype phrase appears.
- [ ] No generic AI imagery appears.
- [ ] No client, metric, result, or claim was invented.
- [ ] Missing project media is labelled Open rather than fabricated.

## Current open input

The identity, audience, strategy, voice, palette, logos, and core visual system are locked for V1.

The only remaining user content input is real project media: 1-2 owned screenshots, diagrams, workflows, terminal captures, or documented bugs for each selected project category.
