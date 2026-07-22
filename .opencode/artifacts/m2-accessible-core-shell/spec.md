# M2 Accessible Core Shell (Plan 03 — Brand Shell and Core Pages)

**Slug:** m2-accessible-core-shell
**Created:** 2026-07-22
**Status:** In Progress (artifact created; no tasks started)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:309-331`
**Roadmap exit:** `.opencode/roadmap.md:83-97`

## Slug Metadata

```yaml
depends_on: ["m1-proven-static-foundation"]  # policy kernel + verifier complete (9fd70ce)
parallel: false                              # sequential tracer: schema -> shell -> pages -> verifier -> [gated] brand -> [gated] a11y
conflicts_with: []                           # P02A/P02B run in separate artifacts, disjoint files
blocks: ["m3-credible-core-release"]          # M3 needs the branded shell + first project (Plan 04)
estimated_hours: 12
```

---

## Problem Statement

### What problem are we solving?

M1 proved the policy kernel (schemas, routes, sitemap/robots, verifier) but produced no
production HTML — the root build has zero pages, zero routes in `ROUTES`, and the verifier
expects exactly that. M2 builds the accessible branded shell that every later page plugs into:
semantic HTML layout, navigation, SEO head, and the first core routes (`/`, `/about/`,
`/services/`, `/contact/`, `/404.html`), all working without JavaScript.

### Why now?

M1 is complete (`state.md:24`; 57/57 tests, gates green, committed `9fd70ce`). Plan 03
semantic-shell work may start after M1 (`plan.md:143-144`, `state.md:64`). The scaffold,
strict TypeScript, content adapter, route helpers, and verifier are all in place and tested.

---

## Scope

**In scope (Plan 03 — `website-build/plan.md:309-331`):**

1. **Schema + config + route inventory** (can start immediately):
   - Expand `src/content.config.ts`: `PageSchema` (extends `RecordBase` with `title`,
     `description`, optional body fields) and `SettingsSchema` (nav labels, site title,
     contact: `{ schedulerUrl?, emailFallback?, privacyRequired? }` — optional until inputs
     resolve).
   - Create `src/config/site.ts`: code-controlled page IDs, route paths, navigation
     structure. Keeps IDs/routes code-owned while copy is loaded from validated records.
   - Update `src/lib/routes.ts`: populate `ROUTES` with the launch routes (`/`, `/about/`,
     `/services/`, `/contact/`).
   - Expand `src/content/settings/site.json` from `{}` to the first substantive settings
     record (nav labels; contact fields optional/blocked).

2. **Semantic HTML shell** (can start immediately):
   - `src/layouts/BaseLayout.astro`: `<html lang="en">`, `<head>`, skip-nav link, `<main
     id="main">`, `<slot />`, structural CSS only (no brand tokens yet).
   - `src/components/SeoHead.astro`: `<title>`, `<meta description>`, canonical
     (`new URL(Astro.url.pathname, Astro.site).href`), noindex handling, OG tags.
   - `src/components/SiteHeader.astro`: `<header>`, `<nav aria-label="Primary">`,
     visible links (no JS-only hiding), `aria-current="page"` on active route.
   - `src/components/SiteFooter.astro`: `<footer>`, copyright, secondary links.
   - Progressive enhancement: base nav visible without JS; if a mobile toggle is needed,
     use native `<details>/<summary>` (keyboard accessible), not JS-only `display:none`.

3. **Core pages + fixed-ID records** (partially blocked):
   - `src/pages/about/index.astro`, `src/pages/services/index.astro`,
     `src/pages/contact/index.astro`, `src/pages/404.astro`, `src/pages/index.astro`
     (minimal `/` — navigation + positioning placeholder, NOT filler marketing copy).
   - Fixed-ID records under `src/content/pages/`: `about.md`, `services.md` (public);
     `contact.md`, `home.md`, `resources.md` (draft until inputs resolve / Plan 04/09).
   - Label `/services/` as **Work With Me** in navigation.
   - Contact: build the page structure and schema; keep the record `draft` until scheduler
     URL + email fallback + privacy decision are approved.

4. **Verifier + test updates** (can start immediately):
   - Update `scripts/verify-build.mjs`: expected routes for M2 (`/`, `/about/`, `/services/`,
     `/contact/`); expected file endpoints (`sitemap.xml`, `robots.txt`, `404.html`,
     `favicon.svg`); allow generated CSS/asset files; `allowEmptySitemap: false` (now has
     public routes).
   - Tests: page/settings schema validation (bad records rejected), route inventory
     correctness, page canonical/noindex behavior, sitemap excludes draft pages, 404 page
     renders.

5. **Brand integration** (BLOCKED by P02B + asset allowlist):
   - `src/styles/global.css`: import canonical `tokens.css` once; brand palette
     (`#FEFEFE`, `#1A1A1A`, `#FF5555`, `#ECC90F`), typography stacks, 8px rhythm, motion
     policy (150ms hover, 220ms panel, max 6px, no loops, reduced-motion), breakpoints
     (1024/820/600).
   - `src/assets/brand/`: selected logos, illustrations, icon sprite — per approved
     allowlist only (exclude revisions, previews, temporary files, component kit).
   - `public/favicon.svg`: derivation decision needed (brand package has no favicon export).
   - Gate: P02B distribution verified + asset allowlist approved + favicon derivation decided.

6. **Accessibility verification** (BLOCKED by browser + brand integration):
   - Browser: keyboard navigation, reflow, 200% zoom, reduced motion, no-JS at 360px,
     768px, desktop.
   - Real assistive-technology smoke (screen reader) if available; blocked record if not.
   - Gate: Task 5 (brand) complete + browser environment available.

**Non-goals:**

- No evidence/curation homepage (Plan 04 owns the full homepage; M2 ships only a minimal
  positioning placeholder on `/`).
- No project case-study content (Plan 04).
- No blog, directory, tools, or resources routes (Plans 05-09).
- No `@astrojs/rss` (Plan 05).
- No Pages CMS config (Plan 02).
- No production origin injection (Plan 10).
- No `/privacy/` route (Plan 10/M3; M2 records the decision only).
- No homepage editorial choreography / Signal Path motion (Plan 04; P02B gates it).
- No filler content to force draft records public.

---

## Success Criteria (M2 exit — `roadmap.md:92-97`)

1. **Schema + config:** page/settings schemas validate real records; bad records are
   rejected at build; route inventory has the 4 launch HTML routes + 3 file endpoints.
   Verify: `npm run check && npm test` — schema/route/verifier tests pass.
2. **Semantic shell works without JavaScript:** skip nav, landmarks, focus, canonical,
   noindex, and navigation are usable with JS disabled. Verify: `npm run build` — generated
   HTML has correct landmarks, canonicals, and no-JS-accessible navigation.
3. **Core pages render correctly:** `/about/`, `/services/`, `/404.html` render with
   self-canonicals; draft pages (`home`, `resources`, `contact`) are excluded from sitemap
   and generate no route output (or remain `noindex` if the route is built for structure).
   Verify: `npm run build && npm run verify` — all routes pass the updated verifier.
4. **Verifier is read-only and updated:** `verify-build.mjs` accepts M2 routes/endpoints,
   rejects unexpected routes, and never mutates `dist/`. Verify: `npm run verify` exits 0
   against the placeholder `site`.
5. **[BLOCKED — P02B] Brand integration:** `global.css` imports distributed tokens; brand
   palette, typography, and motion are applied; favicon renders. Verify: visual + build.
6. **[BLOCKED — browser] Accessibility:** keyboard, reflow, 200% zoom, reduced motion, and
   no-JS pass at 360/768/desktop without filler content. Verify: browser evidence or a
   durable blocked record.

---

## Constraints (from AGENTS.md, tech-stack.md, plan.md, DESIGN.md)

- Semantic HTML + plain CSS; no UI framework, no Tailwind, no MDX, no SSR.
- Strict TypeScript (`astro: strict` + `erasableSyntaxOnly` + `verbatimModuleSyntax`).
- `trailingSlash: "always"` on HTML routes; file endpoints slashless.
- Complete content, navigation, and core discovery work without JavaScript.
- One canonical visibility policy across routes, sitemap, robots, and verifier.
- One custom `/sitemap.xml` (no `@astrojs/sitemap`); `/robots.txt` from configured origin.
- Placeholder `site` allowed during M2; release rejection is Plan 10.
- Brand: `#FEFEFE`/`#1A1A1A`/`#FF5555`/`#ECC90F`; charcoal/coral = 5.54:1 (OK for text),
  paper/coral = 3.12:1 (NOT for ordinary text). One flourish per screen. No decorative loops.
- Motion: 150ms hover/pressed, 220ms panel/menu, max 6px movement, honor
  `prefers-reduced-motion`. No homepage choreography leaks into the shell.
- Approved asset inventory: 4 logo SVGs, 1 hero, 11 illustrations, 10-symbol icon sprite.
  No broad new icon family. No favicon export in the package (derivation needed).
- No `git add .`; stage explicit paths. No `--force`, no hook bypass.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| P02B never completes, blocking M2 brand exit | Med | High | Structural tasks (1-4) are independently shippable; M2 can partially close with brand/accessibility deferred. Spec marks gates explicitly. |
| Contact inputs (scheduler/email/privacy) stay open | Med | Med | Contact page structure + schema are built now; record stays `draft` until approved. No filler. |
| Verifier rejects valid M2 output (expects 0 routes) | High | High | Task 4 updates the verifier manifest before/with the first core page build. |
| No-JS mobile nav fails (as the landing page does) | Med | High | Use progressive enhancement: base nav visible, CSS reflow, `<details>/<summary>` if a toggle is needed. Never JS-only `display:none`. |
| Browser unavailable for a11y verification | Med | Med | Record a durable blocked acceptance; do not infer a pass from static inspection. |
| Filler content leaks into minimal `/` | Low | Med | Spec defines the exact minimal shell (nav + positioning line + draft Home record). No marketing copy. |
| Brand asset allowlist unspecified | Med | Med | Task 5 is gated; `src/assets/brand/` copies only explicitly selected files per an approved list. |
| Favicon derivation undecided | Med | Low | `public/favicon.svg` gated on a derivation decision; omit until decided. |

---

## Related Tracks

- **P02A (Signal Path prototype):** runs in parallel under
  `.opencode/artifacts/homepage-art-direction/`. Disjoint files. Does not gate M2
  structural tasks (1-4). P02A acceptance + P02B distribution gate Task 5 (brand) and M2
  exit.
- **P02B (canonicalization/distribution):** gates Task 5 brand integration and M2
  accessibility exit, NOT Tasks 1-4 semantic shell work (`plan.md:143-144`, `state.md:64`).
- **Plan 04 (homepage + projects):** needs M2 shell + P02B; owns the evidence/curation
  homepage that replaces M2's minimal `/`.

---

## Open Questions

1. **[NEEDS CLARIFICATION] Scheduler URL + approved host** — gates Contact page
   completion. (`plan.md:513`)
2. **[NEEDS CLARIFICATION] Public email fallback** — gates Contact page completion.
   (`plan.md:513`)
3. **[NEEDS CLARIFICATION] Privacy-route decision (yes/no)** — gates Contact/footer link
   behavior. The `/privacy/` route itself is Plan 10/M3, not M2. (`plan.md:516`)
4. **[NEEDS CLARIFICATION] Brand asset allowlist** — which logo variant(s), which
   illustrations, icon sprite usage. Gates Task 5. (`state.md:63`)
5. **[NEEDS CLARIFICATION] Favicon derivation** — the brand package has no favicon
   export. Gates `public/favicon.svg`. (`state.md:63`)
6. **[NEEDS CLARIFICATION] Substantive copy** — approved About/Services/Contact copy
   source. Until provided, About/Services records use approved brand-language positioning
   only (no invented claims).
7. **[NEEDS CLARIFICATION] Accessibility verification environment** — who/what performs
   headed browser and real-AT checks. Headless may cover keyboard/reflow/zoom; real screen
   reader may require a manual checkpoint.

---

## Non-goals re-stated

This bead produces the accessible branded shell, first core routes, and updated
verifier. It does not ship the evidence/curation homepage (Plan 04), project content
(Plan 04), blog/directory/tools (Plans 05-07), resources gateway (Plan 09), privacy route
(Plan 10), production origin (Plan 10), or Pages CMS config (Plan 02). Tasks 5-6 are gated
on P02B and browser availability; Tasks 1-4 are independently executable.
