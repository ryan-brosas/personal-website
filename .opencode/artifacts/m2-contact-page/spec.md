# M2 Contact Page (Child 5 of Plan 03)

**Slug:** m2-contact-page
**Created:** 2026-07-22
**Status:** In Progress (artifact created; ready for `/plan` then `/ship`)
**Parent:** `m2-accessible-core-shell` (aggregate)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:324-331`

## Slug Metadata

```yaml
depends_on: ["m2-brand-shell"]
parallel: false
conflicts_with: []
blocks: ["m2-accessibility-acceptance"]
estimated_hours: 3
```

---

## Problem Statement

Child 4 (brand-shell) is complete, but the `/contact/` route is absent. This child activates the final M2 content route — a public Contact page that renders honest positioning copy + a scheduler link + a visible email fallback, with the scheduler URL and email sourced from the settings singleton as the single source of truth. Contact is the last UI-producing child before accessibility acceptance.

**User-provided inputs (locked):**
- Scheduler URL: `https://calendly.com/ryanjoserbrosas/30min`
- Public email: `ryanjoserbrosas@gmail.com`
- Privacy: not needed (`privacyRequired: false`) — no `/privacy/` route in M2

---

## Scope

**In scope:**

1. **Contact settings security contract** (E1): tighten `SettingsDataSchema.contact` from optional-all-or-none to required; enforce HTTPS protocol + exact `calendly.com` hostname on `schedulerUrl` via parsed URL properties (not suffix matching); constrain `privacyRequired` to `z.literal(false)` (M2 has no privacy route); populate `site.json` with the locked inputs. Schema tests reject HTTP, wrong host, lookalike host, absent block, and `privacyRequired: true`.
2. **Public Contact activation** (E2): create `contact.md` (public, honest positioning copy); special-case `[page].astro` with a small `entry.id === "contact"` branch that reads `settings.data.contact` and renders the scheduler link + email after `<Content/>`; update all 5 real-root verifier manifests (B1/B3/C2/C3/D1) + CLI manifest to include `/contact/`; flip B2/C2/C3/D2 contact-absent assertions to present; add D1 favicon route loop for `/contact/`; add a C4 Contact test block (canonical, public sitemap, nav label/current, body, scheduler + mailto links, no form/iframe, no `/privacy/` link).

**Non-goals:**

- No `/privacy/` route (privacyRequired=false; conditional route is Plan 10 / M3).
- No fixed `contact.astro` page (would collide with `[page].astro` or leak a route when draft).
- No Contact form (scheduler link + email fallback only; no server-side processing).
- No brand tokens, motion, favicon, or footer changes (brand-shell is complete).
- No browser accessibility evidence (accessibility-acceptance child, after this).
- No `ROUTES` change (contact flows through `resolveRoutes` via PAGES config).
- No evidence claims (no Verified/Proposed/Open); `sources.json` unchanged.
- No changes to `index.astro`, `404.astro`, `SiteHeader.astro`, `sitemap.xml.ts`, `SiteFooter.astro` (already visibility-driven — public contact auto-appears in nav + sitemap).

---

## Success Criteria

1. **Contact settings are secure and validated:** `SettingsDataSchema.contact` is required; `schedulerUrl` enforces HTTPS + exact `calendly.com` hostname; `privacyRequired` is `z.literal(false)`; `site.json` contains the locked values; schema tests reject HTTP, wrong host, lookalike, absent block, and `privacyRequired: true`. Verify: `npm test` (policy tests).
2. **Contact route is public and wired:** `/contact/` renders with one self-canonical, no noindex, appears in the sitemap, appears in the header nav (Contact label, `aria-current` on `/contact/`), shows the scheduler link + email fallback from settings, and the verifier accepts it. Verify: `npm run build && npm run verify` exit 0; `tests/shell.test.mjs` C4 block.
3. **Existing routes and shell are unchanged:** `/`, `/about/`, `/services/`, `/404.html`, sitemap, robots, nav, favicon, tokens, progressive nav all remain green with contact added. Verify: `npm run check && npm test && npm run build && npm run verify` all exit 0.

---

## Technical Context

- **Architecture decision (Option A):** Contact stays in the dynamic `[page].astro` route (not a fixed `contact.astro`). A small `entry.id === "contact"` branch reads `settings.data.contact` and renders the scheduler link + email after `<Content/>`. This upholds the visibility-driven contract: if `contact.md` is draft, `[page].astro`'s `getStaticPaths` (filtered by `isRoutable`) produces no `/contact/` route. A fixed `contact.astro` would either collide with `[page].astro` generating `/contact/` or leak a route when the record is draft (review P2).
- **Settings as single source of truth:** `schedulerUrl` and `emailFallback` come from `settings.data.contact` (rendered by the page), not hardcoded in the markdown body (which would duplicate data and drift). The markdown body provides only the intro copy.
- **Nav + sitemap auto-include:** `SiteHeader.astro` and `sitemap.xml.ts` already consume `resolveRoutes` → `NAV_ORDER` → public routes. Public `contact.md` auto-appears in nav (Contact label from `settings.data.navLabels.contact`) and sitemap. No code change needed to these files.
- **Security validation:** `SettingsDataSchema.contact.schedulerUrl` currently uses `z.string().url()` (format only). E1 refines it to enforce HTTPS + exact `calendly.com` hostname via `z.string().url().refine(s => { const u = new URL(s); return u.protocol === "https:" && u.hostname === "calendly.com"; })`. `privacyRequired` constrains to `z.literal(false)`. The contact block becomes required (not optional).
- **[page].astro special-case:** the branch is minimal — after the generic `<Content />` render, if `entry.id === "contact"`, read `settings.data.contact` (throw if missing) and render the scheduler link (`<a href={contact.schedulerUrl} rel="noopener noreferrer">Schedule a conversation</a>`) + email link (`<a href={mailto:${contact.emailFallback}}>${contact.emailFallback}</a>`). No other page IDs are affected.
- **Markdown safety:** `contact.md` passes through the markdown body safety guard (markdown-safety.ts) like about.md/services.md. The scheduler link is rendered by the template (from settings), not authored in markdown, so it bypasses the markdown body entirely.
- **Test pattern:** extend `tests/shell.test.mjs` (existing `buildShell()` / `readHtml()` / `canonicalsOf()` helpers) with a C4 Contact block; extend `tests/policy.test.mjs` with settings security tests. Both use the established Node test runner + fixture-build patterns.
- **Copy baseline (user-approved waiver):** honest positioning only — no metrics, testimonials, dates, client names. Exact copy locked:
  - Title: `Contact`
  - Description: `Schedule a conversation with Ryan Brosas about recurring work, or email a fallback.`
  - Body: `If you have recurring work that needs clearer context, checks, handoffs, or recovery paths, schedule a conversation to see whether an agent, a script, or a process change is a fit. If scheduling is not convenient, email me instead.`
  - Scheduler link label: `Schedule a conversation`
  - Email link: `mailto:ryanjoserbrosas@gmail.com` with visible text `ryanjoserbrosas@gmail.com`

---

## Risks

- **Schema regression:** making `contact` required breaks existing settings tests that pass data without a contact block. Mitigation: E1 RED updates those tests to expect rejection; E1 GREEN adds the contact block + new schema.
- **Inherited test breakage:** adding public `contact.md` emits `/contact/` which triggers `unexpected-route` in all 5 inherited verifier manifests and flips B2/C2/C3/D2 contact-absent assertions. Mitigation: E2 updates all inherited manifests + assertions atomically in one GREEN commit.
- **Route collision:** if both `[page].astro` (generating /contact/) and a fixed `contact.astro` exist, Astro reports a prerender conflict. Mitigation: no fixed `contact.astro` — Option A only.
- **HTTPS spoofing:** `z.string().url()` accepts `http:`, `ftp:`, `mailto:`. Mitigation: `refine` with parsed URL protocol + hostname equality checks; RED tests for HTTP, wrong host, lookalike.

---

## Open Questions

None — all inputs provided by user; architecture decided (Option A); copy locked.

---

## Related Tracks

- **Parent:** `m2-accessible-core-shell` (aggregate-close after all children complete + accessibility evidence).
- **Depends on:** `m2-brand-shell` (complete at `4c2dae8`).
- **Unblocks:** `m2-accessibility-acceptance` (all UI children must be complete before browser matrix).
- **Close handoff:** after this child closes, mark parent ledger `m2-contact-page` → complete; activate `m2-accessibility-acceptance`. Update `.opencode/state.md`.
