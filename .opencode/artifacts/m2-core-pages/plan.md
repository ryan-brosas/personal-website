# M2 Core Pages Implementation Plan

> **For Claude:** Implement this plan task-by-task.

**Goal:** Safely publish substantive About and Work With Me pages through the existing visibility-aware Astro shell.

**Discovery Level:** 3 — Deep. Astro's Markdown error handling, dynamic route visibility, production configuration, and inherited shell tests required source-level verification.

**Context Budget:** ~48%

**Effort:** M

---

## Must-Haves

### Observable Truths

1. Unsafe Markdown causes a build failure rather than executing or silently producing blank content.
2. Safe Markdown renders normally through the production content pipeline.
3. `/about/` displays approved positioning copy, has one self-canonical, is indexable, appears in navigation, and appears once in the sitemap.
4. `/services/` does the same using the navigation label **Work With Me**.
5. Draft, missing, and unconfigured records generate no route; a `noindex` record remains routable and navigable but is excluded from the sitemap.
6. Existing `/`, `/404.html`, sitemap, robots, no-JS navigation, and verifier behavior remain green.

### Required Artifacts

| Artifact | Provides | Path |
|---|---|---|
| Markdown guard | Raw HTML, event-attribute, and protocol rejection | `src/lib/markdown-safety.ts` |
| Astro registration | Production Markdown-pipeline wiring | `astro.config.mjs` |
| Safety tests | Unit and production-chain fixture coverage | `tests/policy.test.mjs` |
| Unsafe fixture | Markdown violation input | `tests/fixtures/markdown-safety/src/content/pages/unsafe.md` |
| Fixture consumer | Proves swallowed render failures become fatal | `tests/fixtures/markdown-safety/src/pages/probe.astro` |
| Dynamic page | Visibility-constrained content routing | `src/pages/[page].astro` |
| About record | Public About content | `src/content/pages/about.md` |
| Services record | Public Work With Me content | `src/content/pages/services.md` |
| Shell tests | Generated HTML, navigation, visibility, sitemap coverage | `tests/shell.test.mjs` |
| Build verifier | Final public route inventory | `scripts/verify-build.mjs` |

### Key Links

| From | To | Via | Risk |
|---|---|---|---|
| `astro.config.mjs` | Markdown guard | `markdown.rehypePlugins` | Guard exists but production never invokes it |
| Glob collection | Render assertion | `assertMarkdownRendered()` before filtering | Astro logs a guard error but emits blank content |
| `[page].astro` | Route inventory | `PAGES` + `resolveRoutes()` | Unknown content ID creates an unintended route |
| `[page].astro` | Shared shell | `BaseLayout` + rendered `Content` | Metadata or body is missing |
| Page visibility | Navigation/sitemap | Existing `SiteHeader` and `sitemap.xml.ts` pipelines | Route, nav, and discovery diverge |
| Public records | Verifier | CLI manifest updates | Correct build fails as an unexpected route |
| Visibility tests | Production behavior | Isolated copied-root build | Tests prove only helper behavior, not real output |

---

## Pre-Execution Contract Synchronization

Before C1 begins, persist this plan and reconcile these planning files:

- `.opencode/artifacts/m2-core-pages/spec.md`
  - Correct the C1 fixture paths.
  - Add `assertMarkdownRendered()`.
  - Record the two C2 visibility microcycles.
  - Lock the exact copy below.
- `.opencode/artifacts/m2-core-pages/prd.json`
  - Correct RED expectations and final file scopes.
- `.opencode/artifacts/m2-accessible-core-shell/prd.json`
  - Set `m2-core-pages` to `in-progress`, `tasks: 3`.
  - Retain only `m2-semantic-shell` as an entry dependency.
- `.opencode/artifacts/m2-accessible-core-shell/{spec.md,plan.md}`
  - Record the user's copy waiver.
  - State that Markdown safety is C1's deliverable, not an external prerequisite.
- `.opencode/state.md`
  - Replace the stale "do not start" gate with active-child wording.
- `.opencode/artifacts/MEMORY.md`
  - Record the copy waiver and production Markdown-safety decision.

Validate the JSON files and run `git diff --check` before implementation.

---

## Dependency Graph

```text
C1 Markdown safety
  → C2 Dynamic route + About
    → C3 Services

Wave 1: C1
Wave 2: C2
Wave 3: C3
```

No parallel work and no remaining checkpoints.

---

## Tasks

### C1 — Markdown body safety

**Needs:** Completed semantic shell
**Creates:** Production Markdown guard and end-to-end safety evidence
**Checkpoint:** None
**Files:** 5 — cohesive scope explicitly approved by the user

- `tests/policy.test.mjs`
- `src/lib/markdown-safety.ts`
- `astro.config.mjs`
- `tests/fixtures/markdown-safety/src/content/pages/unsafe.md`
- `tests/fixtures/markdown-safety/src/pages/probe.astro`

#### RED

1. Add an importable no-op `markdown-safety.ts` stub:
   - default rehype plugin returns a no-op transformer;
   - `assertMarkdownRendered()` performs no validation.
2. Add unit cases that expect rejection of:
   - `raw` nodes;
   - case-insensitive `on*` properties;
   - `javascript:` and `data:` values in `href`, `src`, or `xLinkHref`.
3. Add safe controls for relative, fragment, HTTP(S), and protocol-relative URLs.
4. Add the tracked fixture Markdown and probe.
5. In the test harness:
   - copy the fixture into a unique sibling temporary root;
   - write a temporary `src/content.config.ts` using the production page schema and glob behavior;
   - invoke:

```bash
astro build --root <temp-root> --config ../../../astro.config.mjs
```

   - never mutate the tracked fixture;
   - always clean the temporary root in `finally`.
6. The probe must call `assertMarkdownRendered()` for every collection entry before rendering.
7. Run:

```bash
node --test --test-name-pattern="C1 markdown safety" tests/policy.test.mjs
```

**Expected RED:** assertion failures because unsafe inputs currently do not throw.

**RED commit:** `test(m2): define markdown body safety contract`

#### GREEN

1. Implement dependency-free recursive HAST traversal using local structural types.
2. Throw deterministic errors:
   - `markdown-safety: raw-html`
   - `markdown-safety: event-handler`
   - `markdown-safety: unsafe-protocol`
   - `markdown-safety: render-failed`
3. Reject `raw` nodes before Astro's `rehypeRaw` stage.
4. Reject event properties case-insensitively.
5. Reject trimmed `javascript:` and `data:` protocols.
6. Implement `assertMarkdownRendered(entry)` requiring `entry.rendered.html` to be a string.
7. Register the plugin in root `astro.config.mjs` using `markdown.rehypePlugins`.
8. Keep Astro's `allowDangerousHtml` default; do not disable it because that silently drops raw HTML rather than failing.
9. Verify:

```bash
node --test --test-name-pattern="C1 markdown safety" tests/policy.test.mjs
npm run check
npm test
npm run build
npm run verify
```

**Expected GREEN:** unsafe fixture cases fail for the named guard violation, safe fixture builds, and all project gates pass.

**GREEN commit:** `feat(m2): add markdown body safety guard`

---

### C2 — Dynamic route and About activation

**Needs:** C1
**Creates:** Visibility-safe dynamic route and public `/about/`
**Checkpoint:** None
**Files:** 4 — cohesive scope explicitly approved by the user

- `tests/shell.test.mjs`
- `src/pages/[page].astro`
- `src/content/pages/about.md`
- `scripts/verify-build.mjs`

#### Cycle 1: prove `noindex` route behavior

**RED**

1. Add the C2 shell-test block only.
2. Expect `/about/` as routable but not discoverable.
3. Expect verifier error `missing-route: /about/`.
4. Keep inherited B1/B2/B3 expectations unchanged.

```bash
node --test --test-name-pattern="C2 about" tests/shell.test.mjs
```

**Expected RED:** only the new About contract fails.

**RED commit:** `test(m2): define About route contract`

**GREEN**

1. Create `[page].astro` with `getStaticPaths()`:
   - load every page entry with `getCollection("pages")`;
   - call `assertMarkdownRendered()` on every entry before visibility filtering;
   - create `entriesById` and visibility maps;
   - call `resolveRoutes()`;
   - join resolved routes back through `PAGES`;
   - reject impossible joins;
   - require a one-segment configured route pattern;
   - return `{ params: { page }, props: { entry, route } }`.
2. Render with:
   - `canonicalPath={route.path}`;
   - `noindex={route.visibility === "noindex"}`;
   - one `<h1>{entry.data.title}</h1>`;
   - rendered `<Content />` inside `BaseLayout`.
3. Add `about.md` initially as `visibility: noindex`.
4. Update inherited manifests to expect `["/", "/about/"]`, no discoverable route, and an empty sitemap.
5. Update root navigation assertions: About present; Services and Contact absent.
6. Assert an unconfigured public entry does not generate a route.
7. Verify the real About output has:
   - route and self-canonical;
   - `noindex,follow`;
   - no sitemap entry;
   - visible About navigation.

**GREEN commit:** `feat(m2): add dynamic route and noindex About page`

#### Cycle 2: promote About to public

**RED**

1. Change target assertions to require:
   - no robots noindex;
   - exact About sitemap URL;
   - public verifier inventory.
2. Add a permanent isolated copied-production variant:
   - copy production source/config into a unique ignored temporary root;
   - rewrite only the copied About visibility to `noindex`;
   - build the copy;
   - assert route + noindex metadata + navigation + sitemap exclusion.
3. The tracked About record remains `noindex`.

```bash
node --test --test-name-pattern="C2 about" tests/shell.test.mjs
```

**Expected RED:** public About assertions fail while the copied noindex variant passes.

**RED commit:** `test(m2): define About public promotion contract`

**GREEN**

1. Change About visibility to `public`.
2. Atomically update B1, B3, C2, and CLI manifests:
   - HTML routes: `["/", "/about/"]`
   - discoverable routes: `["/about/"]`
   - `allowEmptySitemap: false`
3. Preserve the permanent copied noindex variant.

Use this exact record:

```md
---
title: "About Ryan Brosas"
description: "About Ryan Brosas and his approach to agent systems for recurring work."
visibility: public
---

I'm Ryan Brosas, an Agent Systems Builder. I build agent systems so repetitive work stops coming back to you. That means making context, checks, handoffs, and recovery paths explicit around the work.
```

4. Verify:

```bash
npm run check
npm test
npm run build
npm run verify
```

**Expected GREEN:** `/about/` is public, canonical, in navigation and sitemap; the copied noindex variant remains green.

**GREEN commit:** `feat(m2): publish About page`

---

### C3 — Services activation

**Needs:** C2
**Creates:** Public `/services/`
**Checkpoint:** None
**Files:** 3

- `tests/shell.test.mjs`
- `src/content/pages/services.md`
- `scripts/verify-build.mjs`

#### RED

1. Add C3 assertions only.
2. Require:
   - `/services/`;
   - self-canonical;
   - no noindex;
   - sitemap entry;
   - **Work With Me** navigation label;
   - `aria-current="page"` on `/services/`.
3. Leave existing records and manifests untouched.

```bash
node --test --test-name-pattern="C3 services" tests/shell.test.mjs
```

**Expected RED:** `missing-route: /services/`; inherited tests remain green.

**RED commit:** `test(m2): define Services route contract`

#### GREEN

1. Add the exact approved record:

```md
---
title: "Work With Me"
description: "How Ryan Brosas approaches recurring work with agent systems, scripts, and process changes."
visibility: public
---

I start with the recurring work and make its context, checks, handoffs, and recovery path explicit. The right answer might be an agent, a script, or a process change, depending on what the work needs.
```

2. Atomically update all real-root manifests:
   - HTML routes: `["/", "/about/", "/services/"]`
   - discoverable routes: `["/about/", "/services/"]`
   - file endpoints unchanged
   - `allowEmptySitemap: false`
3. Update B2 and transitional C2 assertions:
   - About and Work With Me present;
   - Contact absent.
4. Update the copied noindex variant:
   - About remains routable/noindex and excluded from sitemap;
   - Services remains public and included.
5. Verify:

```bash
npm run check
npm test
npm run build
npm run verify
```

**Expected GREEN:** both public pages render and are discovered exactly once; Contact remains absent; existing `/` and `/404.html` behavior stays green.

**GREEN commit:** `feat(m2): publish Services page`

---

## Final Verification

Run from a clean tree:

```bash
npm run check
npm test
npm run build
npm run verify
```

Confirm generated output:

- `dist/index.html`
- `dist/about/index.html`
- `dist/services/index.html`
- `dist/404.html`
- `dist/sitemap.xml`
- `dist/robots.txt`

Confirm:

- `/` remains `noindex,follow` and absent from sitemap.
- About and Services have exactly one self-canonical each.
- Neither public page emits noindex.
- Sitemap contains About and Services exactly once.
- Contact remains absent from route output, navigation, and sitemap.
- No generated client script is introduced.
- Unsafe Markdown causes a build failure.

---

## Risks and Failure Behavior

- A Markdown guard violation fails the build with a named error and source path.
- A swallowed glob-render error is converted into a fatal failure by `assertMarkdownRendered()`.
- Missing configured content or an impossible route/content join fails the build.
- Draft, missing, and unknown IDs produce no route.
- Noindex records remain routable and navigable but do not enter the sitemap.
- Any stale verifier manifest fails immediately as an unexpected or missing route.
- Any existing root/404 regression blocks the task boundary.

## Privacy and Security

- No raw HTML, event-handler properties, `javascript:`, or `data:` authored URLs survive the Markdown pipeline.
- No new dependency or transitive-package import.
- No credentials, customer data, analytics, client names, metrics, testimonials, or evidence claims.
- `src/data/sources.json` remains unchanged.
- Content is static and requires no runtime CMS or JavaScript.

## Stop Conditions

- C2 cannot begin until C1's production-chain safety tests pass.
- C3 cannot begin until About's public and copied-noindex variants both pass.
- Stop on any inherited shell/verifier regression.
- Do not add Contact, brand assets, favicon, motion, Home Markdown, or browser acceptance.

## Constitutional Compliance

- [x] No broad Git staging commands.
- [x] No destructive Git operations or hook bypasses.
- [x] No new dependency.
- [x] No type suppression.
- [x] C1 five-file and C2 four-file cohesive exceptions explicitly approved.
- [x] C3 stays at three files.
- [x] No secrets or private evidence.

**Constitutional compliance: [x] PASS**
