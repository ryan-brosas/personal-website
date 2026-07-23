---
purpose: Project roadmap with stable phase IDs and slug links
updated: 2026-07-24
---

# Roadmap

## Vision

A static, evidence-led personal website positioning Ryan Brosas as an **Agent Systems Builder**, with credible proof, flexible publishing through a self-hosted Pages CMS, conventional SEO, and AI-search accessibility. The public site stays static and Git-backed; no CMS runtime ships with or is queried by the public site.

## Target Users

- **Overworked founders** (primary) — reach Ryan through credible work and a clear booking path.
- **Technical readers** (secondary) — evaluate agent/workflow tooling via projects, writing, directories, and the LLM Watcher.

## Durable Success Measures

- **Credibility** — every published claim, artifact, date, and freshness statement has approved evidence.
- **Stability / correctness** — fail-closed publication; drafts and noindex never leak into discovery, curation, RSS, or related content.
- **Accessibility / SEO** — content, navigation, and core discovery work without JavaScript; conventional SEO fundamentals first.
- **Publishing** — Ryan can manage all public content from desktop or phone without touching routes or layouts.

## Overview

Phases map the legacy milestone track (M0–M8) to stable OMP phase IDs. Releases are **incremental public releases**, not one coordinated launch: the credible core ships first; Blog, Directory, LLM Watcher, and Resources promote independently.

| Phase ID | Goal | Status | Active slugs |
|---|---|---|---|
| P1 | Execution-ready baseline — baseline approved, scaffold authorized, route/visibility policy agreed, toolchain pinned | Complete | — |
| P2 | Proven static foundation — canonical URLs, visibility enum, typed refs, sitemap/robots, generated-output verifier | Complete | — |
| P3 | Accessible core shell — branded shell, nav, About/Services/Contact/404, no-JS, accessibility | Complete | — |
| P4 | Credible core release — first public release; homepage + one project + CMS workflow | Not Started | — |
| P5 | Blog increment — writing, related content, excerpt-only RSS | Not Started | — |
| P6 | Directory increment — Agent Workflow Tools directory | Not Started | — |
| P7 | LLM Watcher increment — sourced model-change snapshots | Not Started | — |
| P8 | Resources gateway — discover only public resource modules | Not Started | — |
| P9 | Evidence-triggered experiments — `llms.txt` etc. with keep/remove decision | Not Started | — |

## P1: Execution-Ready Baseline

**Goal:** Local implementation may begin safely without unresolved ownership or policy ambiguity.

**Success Criteria:**

- [x] Repository baseline approved and committed
- [x] Explicit scaffold authorization recorded
- [x] Route/origin strategy and `draft | public | noindex` visibility policy agreed
- [x] Toolchain re-pinned (Astro 5.18.2 / TS 6.0.3 / `@astrojs/check` 0.9.9)

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| — | (completed as M0 baseline) | — | complete |

**Out of Scope:** final domain, scheduler, CMS infrastructure, final content evidence — gate only the phases that consume them.

---

## P2: Proven Static Foundation

**Goal:** The Astro baseline proves canonical URLs, the visibility enum, typed references, sitemap/robots generation, and the generated-output verifier.

**Success Criteria:**

- [x] Representative `public`, `draft`, and `noindex` fixtures pass `npm run check && npm test && npm run build && npm run verify`
- [x] No `draft` output, no `noindex` in discovery, one self-canonical per indexable page, correct slash behavior

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| — | (completed as M1 at `9fd70ce`) | P1 | complete |

---

## P3: Accessible Core Shell

**Goal:** Reusable branded shell, navigation, About, Work With Me (`/services/`), Contact, and 404 work without JavaScript.

**Success Criteria:**

- [x] Keyboard navigation, reflow, 200% zoom, reduced motion, no-JS, metadata, and route behavior pass without filler content
- [x] Internal routes use only the accepted functional-motion baseline; no homepage editorial choreography leaks into the shell
- [x] M2 aggregate close (ledger reconciliation + hash lineage recorded in `.state/`; screen-reader smoke blocked on no reader installed, carried forward as pre-release gate for P4/M3)

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| `m2-content-route-contracts` | Content route contracts | P2 | complete |
| `m2-semantic-shell` | Semantic shell | `m2-content-route-contracts` | complete |
| `m2-core-pages` | Core pages (About, Services) | `m2-semantic-shell` | complete |
| `m2-brand-shell` | Brand shell + favicon + mobile nav | `m2-core-pages` | complete |
| `m2-contact-page` | Contact page | `m2-brand-shell` | complete |
| `m2-accessibility-acceptance` | Accessibility acceptance evidence | `m2-contact-page` | complete |
| `m2-accessible-core-shell-closeout` | Aggregate close (doc-only ledger sync) | `m2-accessibility-acceptance` | complete |

**Out of Scope:** the evidence/curation homepage (owned by P4).

---

## P4: Credible Core Release

**Goal:** A founder can understand Ryan's offer, inspect one evidence-approved project, and take the approved next action. This is the **first public release**.

**Routes:** `/`, `/services/`, `/about/`, `/contact/`, `/projects/`, `/projects/[slug]/` (one project), `/404.html`, plus `/sitemap.xml`, `/robots.txt`.

**Success Criteria:**

- [ ] Homepage journey, project journey, accessibility, generated output, deployment, rollback, and CMS draft/public flow pass
- [ ] Production homepage translates the accepted Signal Path choreography; no-JS/reduced-motion/unsupported-API/failure paths render the complete composition immediately
- [ ] Authenticated desktop/390px mobile tracer passes for the CMS core content types

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| `m3-launch-inputs` | Resolve credible-core launch inputs (approved project artifact, origin/host/CI, CMS infra) | P3 | open |
| `m3-credible-core` | Build and release the credible core | `m3-launch-inputs` | open |

---

## P5: Blog Increment

**Goal:** Substantive writing, related-content journeys, and excerpt-only RSS are public.

**Routes:** `/blog/`, `/blog/[slug]/`, `/rss.xml`.

**Success Criteria:**

- [ ] One complete publish/update cycle passes; feed MIME, absolute URLs, ordering, escaping, and visibility exclusion parity verified

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| (blog slice) | Blog increment + RSS | P3 | open |

---

## P6: Directory Increment

**Goal:** The Agent Workflow Tools directory adds maintained editorial value.

**Routes:** `/directories/`, `/directories/agent-workflow-tools/`, conditional `/directories/[directory]/[entry]/`.

**Success Criteria:**

- [ ] Methodology, best-fit/trade-off fields, source URL protocols, disclosure labels, `reviewedAt` freshness, stale-state behavior, substantive-detail threshold, and sitemap parity pass

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| (directory slice) | Directory increment | P3 | open |

---

## P7: LLM Watcher Increment

**Goal:** The static watcher provides sourced, date-accurate model-change snapshots with explicit limitations.

**Routes:** `/tools/`, `/tools/llm-watcher/`.

**Success Criteria:**

- [ ] Source links, separate announcement/observation/verification dates, deterministic ordering, draft exclusion, stale-state output, cutoff/cadence/limitations display, and structured-data omission pass. Never describe the page as live monitoring.

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| (llm-watcher slice) | LLM Watcher increment | P3 | open |

---

## P8: Resources Gateway

**Goal:** Visitors can discover only the resource modules that are actually public.

**Routes:** `/resources/`.

**Success Criteria:**

- [ ] The gateway links only to modules with substantive published content; no empty or draft-only module is linked.

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| (resources slice) | Resources gateway | first qualifying module public (P5/P6/P7) | open |

---

## P9: Evidence-Triggered Experiments

**Goal:** Optional additions such as `llms.txt` answer a named hypothesis and receive an explicit keep/remove decision.

**Success Criteria:**

- [ ] Generated text, canonical URLs, redaction, and visibility parity pass `npm run verify`; a review period produces a documented keep or remove decision.

**Work items:**

| Slug | Title | Depends on | Status |
|---|---|---|---|
| (experiments slice) | Evidence-triggered experiments | P4 shipped | open |

---

## Parallel Tracks

These tracks run alongside the phases and gate only the phases that consume them.

- **Content Desk track** (self-hosted Pages CMS): VPS/PostgreSQL 16/Caddy/S3 backup/GitHub App approval → authenticated desktop/390px mobile tracer → core content forms → module-by-module expansion. Gates P4 (first public release). Does not gate P1–P3 local work.
- **Release track:** domain/host/CI selection, exact-SHA checks, preview, atomic last-good deployment, rollback, host verification. Starts after P2; required for P4.
- **Evidence/content track:** approved project artifact, editorial content, directory inventory, source data. Gates only phases consuming that material.
- **Art-direction track:** P02A Signal Path prototype (accepted); P02B contract/local mirrors/capture (locally complete; remote sync deferred by operator). Gates P3 visual integration/exit and P4 homepage choreography.
- **Shared policy track:** canonical, visibility, route, evidence, and output contracts. All tracks consume these but do not independently redefine them.

## Open Decision Gates

- Repository baseline approval and scaffold authorization (gated P1 — resolved).
- Brand token/asset allowlist (gates P3 — resolved).
- P02A Signal Path prototype acceptance (resolved); P02B local/registered package verification (locally complete).
- Contact inputs: scheduler URL, email fallback, privacy-route decision (resolved).
- Approved redacted real-work project artifact (gates P4).
- Self-hosted Pages CMS infrastructure: VPS host, isolated PG 16, Caddy config, S3 backup, GitHub App scope/revocation (gate the Content Desk track).
- Final domain and static host/CI provider (gate the release track).

## Deferred / Trigger-Based Work

- `/now/` — not in initial scope.
- `llms.txt` — P9; only after a named usage hypothesis.
- Public tags/facets, AI/design capability routes, nested `/resources/*` copies, forms, search/filter routes, generated OG images, theme switcher — absent by design (`docs/sitemap.md`).

## Legend

**Status:** `Not Started`, `In Progress`, `Complete`

**Phase IDs** are stable (`P1`, `P2`, …). `/xcreate` records a slug's phase ID in `project-status.md`; `/xplan` and `/xstatus` consume it.

---

_Update this file when phases complete or the roadmap changes._
_Use `/xplan` to create detailed plans for active phases; `/xstatus` to view project position._

## Master Plan Reference (optional)

The legacy master plan lives at `.opencode/artifacts/website-build/plan.md`. It is not copied into `.state/`; commands read the targeted sections when needed.

```yaml
master_plan:
  path: .opencode/artifacts/website-build/plan.md
  sections:
    P3:
      scope: "M2 child plan records + accessibility acceptance"
      anchor: "#m2-accessible-core-shell"
    P4:
      scope: "M3 credible core: homepage journey, project journey, CMS workflow, release ops"
      anchor: "#m3-credible-core-release"
```
