# Ryan Brand Source Specification

This file records the source-derived brand facts that the future design-system artifact must preserve. The visual posture is a calm, modular workbench at product level, with high-energy editorial and street-collage treatments reserved for campaign, presentation, and showcase moments.

## Source assets inspected

| Asset | Source fact | Intended role |
|---|---|---|
| `Logo---Ryan-1.svg` | 255 × 211 viewBox; single-color `#1A1A1A` R/lightning mark | Primary mark on light surfaces |
| `Logo---Ryan-2.svg` | 255 × 211 viewBox; single-color `#FF5555` R/lightning mark | Coral accent mark on light or dark controlled surfaces |
| `Logo---Ryan-3.svg` | 255 × 211 viewBox; single-color `#ECC90F` R/lightning mark | Signal mark on charcoal; limited highlight use |
| `Logo---Ryan-4.svg` | 255 × 211 viewBox; white R/lightning mark | Reversed mark on charcoal, coral, or protected image plates |
| `Group-1.png` | Four swatches sampled directly from the raster | Authoritative palette reference |
| `Untitled.png` | 1920 × 1080 inspiration board | Editorial/street posture, collage, bold scale shifts, image-led moments |
| `Original-Logo-_1.png` and `Original-Logo-_1-_1_.png` | 255 × 211 raster previews | Legacy/reference previews only; SVGs replace them for production |

## Canonical color tokens

The hex values below are sampled from `Group-1.png`; the SVG colors confirm the first three. OKLCH values are direct conversions for implementation.

```css
:root {
  --bg: oklch(0.9970 0 89.88);             /* #FEFEFE */
  --surface: oklch(0.9970 0 89.88);        /* #FEFEFE */
  --fg: oklch(0.2178 0 89.88);             /* #1A1A1A */
  --muted: oklch(0.2178 0 89.88 / 0.68);   /* source charcoal at reduced opacity */
  --border: oklch(0.2178 0 89.88 / 0.16);  /* source charcoal at reduced opacity */
  --accent: oklch(0.6822 0.2063 24.43);    /* #FF5555 */
  --signal: oklch(0.8409 0.1711 96.14);    /* #ECC90F */
}
```

### Color roles

- Charcoal is the main text color and the preferred dark canvas.
- Near-white is the primary reading canvas and content surface.
- Coral is the principal accent for actions, selected states, expressive rules, and the accent logo.
- Signal yellow is not a second general accent. Use it for the logo tile, small focal highlights, warnings, or one deliberate campaign gesture.
- Do not use a full-page yellow canvas behind the yellow mark.
- Do not introduce purple gradients, unapproved brand hues, or decorative gradients.

## Typography stacks

No font files or confirmed licensed family names were supplied. These are provisional, production-safe stacks and should be replaced only when a real licensed type source is added.

```css
--font-display: "Segoe UI Variable Display", "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--font-body: "Segoe UI Variable Text", "Segoe UI", Inter, Helvetica, Arial, sans-serif;
--font-mono: "Cascadia Mono", "SFMono-Regular", Consolas, monospace;
```

- Use normal-width sans typography with moderate weight and comfortable line height.
- Create editorial energy through scale, cropping, alignment, repetition, and image contrast—not condensed or narrow fonts.
- Use mono only for labels, metadata, specifications, and token values.

## Observed posture rules

1. Keep the core editor and product surfaces calm, flat, modular, and readable over long sessions.
2. Let campaigns and presentation pages use bolder image crops, oversized type, collage, and abrupt scale changes.
3. Use the R/lightning mark as a confident stamp with generous clear space; do not surround it with generic SaaS decoration.
4. Prefer fine rules, compact labels, strong grids, and deliberate whitespace over excessive rounded cards.
5. Use coral as the repeatable brand accent and yellow as a scarce signal.

## Approved name and language

- Brand name: **Ryan Brosas**.
- Descriptor: **Agent Systems Builder**. Keep it secondary to the name and removable in compact contexts.
- Primary statement: **I build agent systems so repetitive work stops coming back to you.**
- Campaign line: **Building systems so everything doesn't need you.**
- The campaign line is approved for presentations and campaigns but is not part of the permanent logo lockup.

## Logo usage matrix

| Variant | Use on | Avoid |
|---|---|---|
| Charcoal SVG | Near-white, pale neutral, or sufficiently light photography | Dark charcoal or low-contrast imagery |
| Coral SVG | Near-white, charcoal, or restrained neutral photography | Competing red/orange image regions |
| Yellow SVG | Charcoal or very dark protected plates | White/light backgrounds and full-page yellow fields |
| White SVG | Charcoal, coral, or dark protected image plates | Uncontrolled light photography |

All four SVGs are high-definition production sources and are sufficient for an initial design-system kit. Raster logo files should not be used where SVG is supported.

## Asset gaps to resolve later

- [x] No separate full-name wordmark was supplied; use a plain typographic `Ryan Brosas` name lockup with the existing symbol.
- [x] Brand name, descriptor, primary statement, and campaign line are confirmed for V1.
- [ ] Add licensed font files only if a specific non-system family is chosen.
- [ ] Create favicon/app-icon exports from the approved mark after minimum-size testing.
