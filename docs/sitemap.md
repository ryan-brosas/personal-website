# Sitemap — Route-Disposition Contract

Approved 2026-07-22. Companion to `.opencode/artifacts/website-build/plan.md` and
`.opencode/roadmap.md` (milestones). Update this file whenever route architecture
changes (`AGENTS.md:62`).

## Disposition legend

Route disposition (route-level availability) is distinct from content visibility
(per-record publication state).

| Mark | Meaning (route availability) |
|---|---|
| `launch` | Route is built. Whether it appears publicly depends on the Release column and the content record's visibility. |
| `conditional` | Route exists only when a stated condition is met (e.g. a substantive editorial entry, a privacy review). |
| `defer` | Intentionally deferred to a later phase. Not built initially. |
| `absent` | Explicitly NOT created. Recorded here to prevent regression. |

Content visibility (per record, fail-closed): `draft` (no route output), `public`
(included in routes, sitemap, RSS, curation), `noindex` (crawlable but excluded from
discovery outputs). See `plan.md` and `src/lib/publishing.ts` (Plan 01).

## Route rules

- HTML routes use canonical **trailing slashes**. File endpoints (`/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/404.html`) do not.
- `/resources/` is a navigation/discovery **gateway** only. It groups Blog, Directories, and Tools in navigation; it does **not** duplicate or nest their canonical URLs (no `/resources/blog/`, `/resources/projects/`, etc.).
- One custom metadata-aware `/sitemap.xml` is generated from the public-route inventory. The `@astrojs/sitemap` integration is **not** installed.
- Projects keep `/projects/[slug]/`. AI and website-design work are project metadata, not separate route families.
- Do not generate thin tag, facet, project-subtype, tool, or directory-entry pages.

## Release model

Releases are **incremental public releases**. The **credible core** (M3) ships first.
Blog, Directory, LLM Watcher, and Resources each promote to public independently once
their content and CMS gates pass. The Release column marks the milestone that first
makes a route public.

## HTML routes

| Route | Disposition | Release | Plan | Notes |
|---|---|---|---|---|
| `/` | launch | M3 | P03, P04 | P03 ships a minimal shell; P04 renders the evidence/curation homepage. |
| `/services/` | launch | M3 | P03 | Labeled **Work With Me** in navigation. |
| `/about/` | launch | M3 | P03 | Fixed-ID singleton. |
| `/contact/` | launch | M3 | P03 | External scheduler link + email fallback; no form. |
| `/projects/` | launch | M3 | P04 | Hub. |
| `/projects/[slug]/` | launch | M3 | P04 | One complete project at first release; more added incrementally. |
| `/blog/` | launch | M4 | P05 | Hub. Promotes independently. |
| `/blog/[slug]/` | launch | M4 | P05 | Substantive entries only. |
| `/directories/` | launch | M5 | P06 | Hub. Promotes independently. |
| `/directories/agent-workflow-tools/` | launch | M5 | P06 | First directory. |
| `/directories/[directory]/[entry]/` | conditional | M5 | P06 | Only for substantive editorial entries; default absent. |
| `/tools/` | launch | M6 | P07 | Hub. Promotes independently. |
| `/tools/llm-watcher/` | launch | M6 | P07 | Static snapshot; states cutoff, cadence, limitations. Not live monitoring. |
| `/resources/` | launch | M7 | P09 | Gateway. Promotes only after at least one resource module is public; links only to modules with substantive published content. |
| `/privacy/` | conditional | M3 | P10 | Only if the scheduler/privacy review requires it. |

## File endpoints

| Endpoint | Release | Plan | Notes |
|---|---|---|---|
| `/sitemap.xml` | M3 | P01 | Custom, generated from public-route inventory. Excludes `draft` and `noindex`. Grows as modules promote. |
| `/robots.txt` | M3 | P01 | Generated from final origin. Crawlable; not a privacy/authorization boundary. |
| `/rss.xml` | M4 | P05 | Excerpt-only, newest-first, public-only. |
| `/404.html` | M3 | P03 | Real 404 status on the host. |

## Deferred routes (not built initially)

| Route | Reason |
|---|---|
| `/now/` | Deferred per approved design; not in initial scope. |
| `/llms.txt` | Optional/experimental; deferred until a named usage hypothesis (Plan 11 / M8). |

## Absent routes (explicitly NOT created)

| Route | Reason |
|---|---|
| `/tags/`, `/tags/[tag]/` | No thin tag pages (`AGENTS.md:43`). Tags are controlled metadata, not routes. |
| AI/design capability routes | AI and website-design are project metadata, not separate route families. |
| `/resources/blog/`, `/resources/projects/`, etc. | `/resources/` is a gateway only; no nested canonical copies. |
| Directory-entry detail pages below threshold | Only substantive editorial entries get detail routes. |
| Form endpoints | No form backend; contact uses external scheduler + email. |
| Search/filter routes | No dynamic filtering/search state. |
| Generated OG image routes | No generated OG images. |
| Theme switcher routes | No theme toggle. |

## Plan → route map

| Plan | Builds | Milestone |
|---|---|---|
| 01 | `/sitemap.xml`, `/robots.txt` | M1 |
| 03 | `/services/`, `/about/`, `/contact/`, `/404.html`, minimal `/` shell | M2 |
| 04 | `/projects/`, `/projects/[slug]/` (first project), evidence/curation homepage | M3 |
| 05 | `/blog/`, `/blog/[slug]/`, `/rss.xml` | M4 |
| 06 | `/directories/`, `/directories/agent-workflow-tools/`, conditional `/directories/[directory]/[entry]/` | M5 |
| 07 | `/tools/`, `/tools/llm-watcher/` | M6 |
| 09 | `/resources/` gateway, full output verifier | M7 |
| 10 | `/privacy/` (if required), release/host config (reusable) | release track |
| 11 | `/llms.txt` (optional, post-launch) | M8 |

## Self-hosted Pages CMS (not a public route)

Pages CMS 2.1.8 is **planned** to run on the operator VPS at `https://cms.ryanjosebrosas.dev`
behind host Caddy. It is not yet deployed or activated (`cms.ryanjosebrosas.dev` currently
returns HTTP 525; infrastructure approvals are pending). It is an editing layer only — it
writes approved content to this Git repository; it is not shipped with, queried by, or
routed through the public static site. An outage leaves the public site unaffected. It is
required before the first public release (M3) but does not gate local implementation.
See `.opencode/artifacts/website-build/decisions.md` ADR-002. This entry records the
boundary; `cms.ryanjosebrosas.dev` is not part of the public sitemap.
