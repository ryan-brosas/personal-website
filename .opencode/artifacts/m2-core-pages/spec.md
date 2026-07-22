# M2 Core Pages (Child 3 of Plan 03)

**Slug:** m2-core-pages
**Created:** 2026-07-22
**Status:** In Progress (artifact created; ready for `/plan` then `/ship`)
**Parent:** `m2-accessible-core-shell` (aggregate)
**Master plan ref:** `.opencode/artifacts/website-build/plan.md:313-331`

## Slug Metadata

```yaml
depends_on: ["m2-semantic-shell"]
parallel: false
conflicts_with: []
blocks: ["m2-contact-page", "m2-brand-shell", "m2-accessibility-acceptance"]
estimated_hours: 4
```

---

## Problem Statement

Child 2 shipped the semantic shell and first HTML routes (`/` noindex + `/404.html`), but no content-page routes exist. This child activates the first public content routes (`/about/`, `/services/`) via a constrained dynamic route + content records, and lands the Markdown body safety guard that must precede any public Markdown. It consumes the Child 2 shell (BaseLayout, SeoHead, SiteHeader) and Child 1 contracts (resolveRoutes, PageSchema, the visibility-driven sitemap/nav/verifier pipeline). No Contact, no brand tokens, no Home Markdown record, no browser acceptance.

---

## Scope

**In scope:**

1. **Markdown body safety guard** (C1): a zero-dependency rehype plugin, registered in `astro.config.mjs`, that throws at build time on `raw` HTML nodes (Astro 5.18.2 hardcodes `allowDangerousHtml: true` + rehypeRaw; custom rehype plugins run before rehypeRaw, so the guard sees raw nodes), and on unsafe `href`/`src` protocols (`javascript:`, `data:`). Do NOT set `allowDangerousHtml: false` (silently strips instead of failing the build). The plugin must NOT add dependencies. A fixture build test proves unsafe Markdown fails the build; a unit test proves the plugin function throws on each violation class.
2. **Dynamic content route + About activation** (C2): `src/pages/[page].astro` with `getStaticPaths()` constrained through `PAGES` + `resolveRoutes` (not all routable collection entries — unknown public records must NOT generate routes). `getEntry("pages", id)` → guard undefined → `render(entry)` → `<Content />` inside BaseLayout. About record ships `public` directly (no draft intermediate; "promoted one at a time" = sequential activation). Verifier CLI manifest + inherited B1/B2/B3 shell tests updated atomically (B2's "no about links" assertion becomes "about link present, services/contact absent"; manifests add `/about/`).
3. **Services activation** (C3): Services record ships `public`; verifier CLI manifest + inherited shell tests updated atomically (add `/services/`; both about+services links present, contact absent).

**Non-goals:**

- No Contact page (separate gated child by scheduler/email/privacy/copy).
- No Home Markdown record (`/` is code-owned identity copy, already shipped in Child 2).
- No brand tokens, motion, favicon, or `global.css` (brand-shell child).
- No browser accessibility evidence (accessibility-acceptance child).
- No `ROUTES` change (root is `ROOT_ROUTE_POLICY`; core pages flow through `resolveRoutes`).
- No modification to `index.astro`, `404.astro`, `SiteHeader.astro`, `sitemap.xml.ts` (already visibility-driven — public records auto-appear in nav and sitemap).
- No evidence claims (Verified/Proposed/Open) requiring `sources.json` entries; honest positioning copy only.

---

## Success Criteria

1. **Markdown bodies are build-time safe:** a Markdown page containing raw `<script>`, an `on*` event attribute, or a `javascript:`/`data:` link fails `astro build` with the guard's error message; safe Markdown builds. Verify: `npm test` (unit + fixture); `npm run build` exit 0 on safe content.
2. **About route is public and wired:** `/about/` renders with one self-canonical, no noindex, appears in the sitemap, appears in the header nav (About link, `aria-current` on `/about/`), and the verifier accepts it. Verify: `npm run build && npm run verify` exit 0; `tests/shell.test.mjs`.
3. **Services route is public and wired:** `/services/` renders with one self-canonical, no noindex, appears in the sitemap, appears in the header nav (Work With Me label), and the verifier accepts it. Verify: `npm run build && npm run verify` exit 0; `tests/shell.test.mjs`.

---

## Technical Context

- **Child 2 shell APIs consumed:**
  - `BaseLayout.astro` props: `{title, description, canonicalPath?, noindex?}` (`src/layouts/BaseLayout.astro:11-16`); renders SeoHead + skip link + SiteHeader + `<main id="main"><slot/></main>` + SiteFooter.
  - `SeoHead.astro`: `canonical = canonicalHref(canonicalPath ?? Astro.url.pathname, Astro.site.href)` (`src/components/SeoHead.astro:22`); emits noindex,follow only when `noindex` true.
  - `SiteHeader.astro`: already visibility-driven — `getEntry("settings","site")` + `getCollection("pages")` → `resolveRoutes` → `NAV_ORDER` join (`src/components/SiteHeader.astro:14-42`). Public About/Services auto-appear; no SiteHeader change needed.
  - `sitemap.xml.ts`: already prepends `ROOT_ROUTE_POLICY` + `resolveRoutes` (public routes auto-included via `renderSitemap`). No change needed.
- **Child 1 contracts consumed:**
  - `resolveRoutes(pageVisibilities)` (`src/lib/site-routes.ts:24-34`): filters by `isRoutable` (public+noindex), skips missing/draft.
  - `PageSchema` (`src/lib/content-schemas.ts:20-23`): requires `title`, `description`; extends RecordBase (`visibility` default draft, optional `evidence`/`dates`).
  - `PAGES` + `NAV_ORDER` (`src/config/site.ts:16-23`): about (`/about/`, label key `about`), services (`/services/`, label key `services`), contact (`/contact/`, label key `contact`). `[page].astro` getStaticPaths MUST constrain to these configured IDs only.
  - `getEntry("pages", id)` returns `undefined` for missing; `render(undefined)` throws → guard with `if (!entry) throw`.
  - `generateId` strips extension, ignores frontmatter slug (`src/content.config.ts:16-20`).
- **Markdown safety (Astro 5.18.2 source-confirmed):**
  - `@astrojs/markdown-remark/dist/index.js:78-99` hardcodes `remarkRehype({allowDangerousHtml: true})` then runs user `rehypePlugins` BEFORE `rehypeRaw` then `rehypeStringify`.
  - Custom rehype plugins see `raw` nodes (raw HTML) and normal `element` nodes (links). The guard throws on `raw` nodes and on `a[href]`/`img[src]` with `javascript:`/`data:` protocols.
  - `allowDangerousHtml: false` would silently strip (mdast-util-to-hast html handler returns `undefined`) — does NOT fail the build. Do NOT use it; keep the default `true` so the guard can reject.
  - Link handler `normalizeUri` only encodes, does not filter protocols (`mdast-util-to-hast/lib/handlers/link.js:19-35`) — the guard must reject unsafe protocols explicitly.
  - `.astro` pages (index, 404) bypass the markdown pipeline entirely; only `.md` content bodies are affected.
- **Test pattern:** extend `tests/shell.test.mjs` (existing `buildShell()` / `readHtml()` / `canonicalsOf()` helpers); for the safety guard, a fixture build (like `tests/fixtures/slug-loader/`) that asserts `astro build` non-zero exit + error message, plus a unit test of the plugin function. Tests use custom `verifyBuild` manifests; the CLI manifest in `scripts/verify-build.mjs` is updated per route activation.
- **Copy baseline (user-approved):** honest positioning only — locked identity language (`DESIGN.md:478-481`) plus factual process descriptions using the approved agent-systems context/checks/handoffs/recovery framing. NO metrics, NO testimonials, NO client names, NO dates, NO "trusted by". User will rewrite freely later. Each page: title + description + one meaningful page-specific paragraph minimum (not thin filler per `AGENTS.md:47`).
- **User copy-approval waiver (recorded):** the user waived the formal copy-approval checkpoint ("approved I can just rewrite that later"). This resolves the `copy-approval` gate. Markdown body safety remains a technical gate (C1 deliverable, not a child-entry prerequisite).

---

## Risks

- **Inherited shell-test conflict:** B1/B2/B3 tests assert the no-about/services state. Each promotion task MUST update those inherited assertions atomically or the suite breaks. Mitigation: C2/C3 each own `tests/shell.test.mjs` and update B1/B2/B3 manifests + B2's nav assertions in the same GREEN commit.
- **Unknown public record generating a route:** if `getStaticPaths` maps all routable collection entries instead of constraining to `PAGES`, a future `home.md`/`404.md` could create an unintended route. Mitigation: constrain `getStaticPaths` through `PAGES` + `resolveRoutes`; RED asserts an unknown public record produces no route.
- **Silent strip instead of build failure:** using `allowDangerousHtml: false` would strip raw HTML without failing. Mitigation: keep default `true`, guard throws on `raw` nodes.
- **Stale aggregate scope leakage:** the parent aggregate spec mentions Contact/favicon/ROUTES in places. Mitigation: this child's non-goals explicitly exclude them.

---

## Open Questions

None — copy approval waived by user; markdown safety is C1; Child 1+2 contracts confirmed.

---

## Related Tracks

- **Parent:** `m2-accessible-core-shell` (aggregate-close after all children complete + accessibility evidence matches HEAD).
- **Depends on:** `m2-semantic-shell` (complete at `fe7dd26`).
- **Next children:** `m2-contact-page` (scheduler/email/privacy/copy), `m2-brand-shell` (P02B + allowlist + favicon), `m2-accessibility-acceptance` (all UI children + browser evidence).
- **Close handoff:** after this child closes, mark the parent ledger `m2-core-pages` → complete; activate `m2-contact-page` only if its gates are ready, otherwise leave pending. Update `.opencode/state.md`.
