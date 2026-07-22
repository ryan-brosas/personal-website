# M2 Contact Page Implementation Plan

> **For Claude:** Implement this plan task-by-task.

**Goal:** Publish a secure, public `/contact/` page with approved copy, a settings-driven Calendly action, and a visible email fallback while preserving the existing static visibility architecture.

**Discovery Level:** 3 — user-selected Deep. Research identified a Zod 3 behavior: `.refine()` can execute after `.url()` reports malformed input, so URL parsing inside the refine must be `try/catch`-guarded.

**Context Budget:** ~48%

**Effort:** M (~3 hours)

---

## Constraints

- Keep `[page].astro` as the sole owner of `/contact/` (no fixed `contact.astro`).
- Preserve static Astro output and no-JavaScript content access.
- Use locked inputs from `spec.md:25-28` and copy from `spec.md:69-74`.
- Scheduler validation: HTTPS + exact parsed hostname `calendly.com` (no suffix matching).
- `privacyRequired` must be exactly `false`; no `/privacy/`.
- No form, iframe, Contact-specific client script, SSR, dependency, CSS, or route-config change.
- Do not modify `SiteHeader.astro`, `sitemap.xml.ts`, `index.astro`, `404.astro`, `SiteFooter.astro`, or `docs/sitemap.md`.
- Do not touch unrelated user-owned changes (`session-summary.md`, `astro.config.preview.mjs`).
- Stop and confirm if E2 requires a fifth implementation file.

## Non-Goals

- No `/privacy/` route, no Contact form, no fixed `contact.astro`, no brand/favicon/footer/CSS changes, no accessibility evidence (later child), no `ROUTES` change.

## Must-Haves

### Observable Truths

1. Users can navigate to `/contact/` and identify Contact as the current page.
2. Users see the approved Contact title, description, and positioning copy.
3. Users can open the HTTPS Calendly scheduler.
4. Users have a visible email fallback if scheduling is unavailable.
5. The public Contact route has one self-canonical and appears in the sitemap.
6. Unsafe or incomplete contact settings prevent a build rather than emitting unsafe links.

### Required Artifacts

| Artifact | Provides | Path |
| --- | --- | --- |
| Content schemas | Required, fail-closed Contact settings contract | `src/lib/content-schemas.ts` |
| Site settings | Canonical scheduler, email, privacy values | `src/content/settings/site.json` |
| Contact record | Public Contact metadata + approved body copy | `src/content/pages/contact.md` |
| Dynamic route | Settings-driven Contact actions | `src/pages/[page].astro` |
| Policy tests | Contact config security regressions | `tests/policy.test.mjs` |
| Shell tests | Generated Contact route + inherited-shell contracts | `tests/shell.test.mjs` |
| Verifier CLI | Production output inventory including `/contact/` | `scripts/verify-build.mjs` |

### Key Links

| From | To | Via | Risk |
| --- | --- | --- | --- |
| `site.json` | `content-schemas.ts` | settings collection validation | Invalid URL throws inside refine |
| `contact.md` | `[page].astro` | filename-derived ID + getStaticPaths | Wrong entry id breaks branch |
| `[page].astro` | `settings.data.contact` | conditional `getEntry("settings","site")` | Missing settings silently omits links |
| Contact visibility | header nav + sitemap | `resolveRoutes` visibility pipeline | Stale manifests fail verifier |

## Dependency Graph

```
E1 Contact settings contract
  needs: locked operator inputs
  creates: required + validated settings singleton
       |
       v
E2 Public Contact activation
  needs: E1
  creates: /contact/, generated-output contract, scheduler/email actions

Wave 1: E1
Wave 2: E2
```

## Resolved Interpretation

PRD generated-output phrase "no script" conflicts with the shell's intentional progressive-nav script on every page. Treat it as **no Contact-specific script** and retain `assertOneNavScript(html)`.

---

## Task E1: Contact Settings Security Contract

**Files:** `tests/policy.test.mjs`, `src/lib/content-schemas.ts`, `src/content/settings/site.json`

**Risk:** Unguarded `new URL(value)` in Zod refine throws on malformed input.

### RED

1. Add a reusable `lockedContact` + `validSettings(contact=lockedContact)` fixture to `tests/policy.test.mjs`.
2. Update existing missing-`siteTitle`/missing-`navLabels` tests so all other fields (incl. `contact`) are valid.
3. Replace the optional/full-contact tests (`tests/policy.test.mjs:194-225`) with E1-prefixed cases:
   - accept exact locked values;
   - reject absent `contact` block;
   - reject partial contact block;
   - reject `privacyRequired: true`;
   - verify `site.json` contains exact locked object and validates.
4. Add one table-driven `E1 contact settings rejects unsafe scheduler URLs without throwing` test over:
   `http://...`, `ftp://...`, `mailto:...`, `https://cal.com/...`, `https://www.calendly.com/...`, `https://calendly.com.evil.example/...`, `not-a-url` — wrap `safeParse` in `assert.doesNotThrow`, then assert `success === false`.
5. Run `node --test --test-name-pattern='E1 contact settings' tests/policy.test.mjs` → **expect nonzero exit** (schema accepts absent/HTTP/wrong-host/`privacyRequired:true`; site.json lacks block).
6. Commit: `test(m2): define contact settings security contract` (stage `tests/policy.test.mjs` only).

### GREEN

7. Replace optional contact schema in `src/lib/content-schemas.ts`:
   ```ts
   contact: z.object({
     schedulerUrl: z.string().url().refine((value) => {
       try {
         const url = new URL(value);
         return url.protocol === "https:" && url.hostname === "calendly.com";
       } catch {
         return false;
       }
     }, "schedulerUrl must use HTTPS on calendly.com"),
     emailFallback: z.string().email(),
     privacyRequired: z.literal(false),
   }),
   ```
   Update adjacent comment: contact is required. No suffix matching, no extra port/credential policy.
8. Add locked block under `site` in `src/content/settings/site.json`:
   ```json
   "contact": {
     "schedulerUrl": "https://calendly.com/ryanjoserbrosas/30min",
     "emailFallback": "ryanjoserbrosas@gmail.com",
     "privacyRequired": false
   }
   ```
9. Run focused test → **expect exit 0** (malformed input returns failed parse without throwing).
10. Run `npm run check` and `npm test` → **expect both exit 0**.
11. Commit: `feat(m2): enforce contact settings security contract` (stage `src/lib/content-schemas.ts`, `src/content/settings/site.json`).

---

## Task E2: Public Contact Activation

**Files:** `tests/shell.test.mjs`, `src/content/pages/contact.md`, `src/pages/[page].astro`, `scripts/verify-build.mjs` (4-file cohesive exception, approved `prd.json:57`)

**Risk:** Adding a public record emits `/contact/` — every inherited fail-closed manifest must update in the same GREEN slice.

### RED

1. Add `describe("C4 contact route", ...)` after C3, before favicon helpers, following the `buildShell()` lifecycle.
2. Begin with `verifyBuild()` expecting `expectedHtmlRoutes: ["/","/about/","/services/","/contact/"]`, `expectedDiscoverableRoutes: ["/about/","/services/","/contact/"]`, same file endpoints, `allowEmptySitemap: false`.
3. After the verifier guard, assert: dist/contact/index.html exists; one canonical = `https://example.com/contact/`; no noindex meta; sitemap includes `/contact/`; nav has Contact link to `/contact/` with `aria-current="page"`; one h1 includes `Contact`; approved body paragraph renders; scheduler anchor has locked HTTPS URL + label + `rel="noopener noreferrer"`; email anchor has locked `mailto:` URL + visible address; no form/iframe/`/privacy/` link; `assertOneNavScript(html)`.
4. Run `node --test --test-name-pattern='C4 contact' tests/shell.test.mjs` → **expect nonzero exit**, `missing-route: /contact/`.
5. Commit: `test(m2): define Contact route contract` (stage `tests/shell.test.mjs` only).

### GREEN

6. Create `src/content/pages/contact.md`:
   ```markdown
   ---
   title: "Contact"
   description: "Schedule a conversation with Ryan Brosas about recurring work, or email a fallback."
   visibility: public
   ---

   If you have recurring work that needs clearer context, checks, handoffs, or recovery paths, schedule a conversation to see whether an agent, a script, or a process change is a fit. If scheduling is not convenient, email me instead.
   ```
7. In `src/pages/[page].astro`: add `getEntry` to the `astro:content` import; after `entry`, fetch settings only when `entry.id === "contact"`; throw clear build-time error if singleton absent; derive `contact` from `settings.data.contact`; after `<Content />`, conditionally render:
   ```astro
   {
     contact && (
       <>
         <p>
           <a href={contact.schedulerUrl} rel="noopener noreferrer">
             Schedule a conversation
           </a>
         </p>
         <p>
           <a href={`mailto:${contact.emailFallback}`}>
             {contact.emailFallback}
           </a>
         </p>
       </>
     )
   }
   ```
   Do not hardcode destinations in the template.
8. Update all five real-root manifests in `tests/shell.test.mjs` (B1, B3, C2, C3, D1): add `/contact/` to HTML + discoverable arrays. Leave the copied noindex variant unchanged.
9. In `tests/shell.test.mjs`: flip B2/C2/C3/D2 contact-absent assertions to positive Contact-link assertions; add `/contact/` to D1 favicon route loop.
10. Update CLI defaults in `scripts/verify-build.mjs:229-235` with the same Contact route additions.
11. Run focused Contact test → **expect exit 0**.
12. Run `npm run check`, `npm test`, `npm run build`, `npm run verify` → **expect all exit 0**, verifier prints `verify: ok`.
13. Inspect generated output (read-only): `rg` over `dist/contact/index.html` + `dist/sitemap.xml` for canonical, calendly, mailto, Contact, noindex, privacy, form, iframe — confirm tests and output agree.
14. Confirm `git status --short` shows only the four declared E2 files plus pre-existing unrelated changes.
15. Commit: `feat(m2): publish Contact page` (stage the four E2 files explicitly).
16. Stop if a fifth implementation file appears necessary; obtain confirmation.

---

## Verification

Feature complete only when:
- Focused E1 and C4 tests pass.
- `npm run check`, `npm test`, `npm run build`, `npm run verify` all exit 0.
- `/contact/` is public, canonical, navigable, discoverable.
- Existing `/`, `/about/`, `/services/`, `/404.html`, robots, favicon, tokens, progressive nav remain green.
- Invalid settings fail validation without throwing an uncaught `TypeError`.

## Risks and Failure Behavior

- **Malformed URL:** validation returns failure via guarded refine.
- **Missing settings:** static generation fails clearly; links never silently omitted.
- **Scheduler unavailable:** visible email link is the recovery path.
- **Draft Contact record:** visibility pipeline removes route, nav link, sitemap entry.
- **Stale manifests:** tests/verifier fail with route/sitemap inventory errors.
- **Route collision:** avoided — no `contact.astro`.

## Privacy and Security

- Approved email is intentionally public; present in static HTML.
- No user info collected/submitted; no form backend, iframe, cookies, credentials, or new third-party runtime.
- Parsed protocol + exact hostname reject insecure and lookalike scheduler destinations.

## Lifecycle Checkpoint

Parent lifecycle docs still describe Contact as input-gated and order accessibility before Contact. Do NOT mix those corrections into E1/E2. After GREEN acceptance, update Contact-specific status in parent ledger + `.opencode/state.md`, then activate `m2-accessibility-acceptance`. If synchronizing all stale parent/state docs before `/ship`, confirm that separate documentation-only slice first.

## Constitutional Compliance

8/8 PASS: explicit file staging only; no history rewrite/destructive restore/hook bypass; no new dependency; no type escape hatch; no secrets; E1 within 3 files; E2 four-file cohesive exception approved (`prd.json:57`); a fifth E2 file requires stop + confirmation.
