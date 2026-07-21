# Roadmap

Durable outcome milestones, promotion gates, and parallel tracks for the personal
website. The source of truth for implementation tasks, files, and verification is
`.opencode/artifacts/website-build/plan.md`; the source of truth for live position and
blockers is `.opencode/state.md`; the route availability contract is
`docs/sitemap.md`. This file owns outcomes, not tasks.

Releases are **incremental public releases**, not one coordinated launch. The credible
core ships first; Blog, Directory, LLM Watcher, and Resources promote independently when
each passes its own gate.

## Vision

A static, evidence-led personal website positioning Ryan Brosas as an **Agent Systems
Builder**, with credible proof, flexible publishing through a self-hosted Pages CMS,
conventional SEO, and AI-search accessibility. The public site stays static and
Git-backed; no CMS runtime ships with or is queried by the public site.

## Target Users

- **Overworked founders** (primary) — reach Ryan through credible work and a clear booking path (recurring workflow assessment).
- **Technical readers** (secondary) — evaluate agent/workflow tooling via projects, writing, directories, and the LLM Watcher.

## Durable Success Measures

- **Credibility** — every published claim, artifact, date, and freshness statement has approved evidence.
- **Stability / correctness** — fail-closed publication; drafts and noindex never leak into discovery, curation, RSS, or related content.
- **Accessibility / SEO** — content, navigation, and core discovery work without JavaScript; conventional SEO fundamentals first.
- **Publishing** — Ryan can manage all public content from desktop or phone without touching routes or layouts. Self-hosted Pages CMS is the current conditional implementation of this outcome, not the outcome itself; Git remains the fallback if the CMS fails its gate.

## Non-goals

- CRM, lead scoring, email automation, or a customer database.
- Visual page building or editable route paths/layouts.
- Runtime CMS queries or a dependency on Pages CMS availability for readers.
- Multi-user editorial roles, scheduled publishing, or branch-heavy approval workflows in the initial release.

## Current State — 2026-07-22

- No scaffold, application code, or dependencies exist yet.
- Init artifacts complete: `AGENTS.md`, `.opencode/tech-stack.md`,
  `.opencode/roadmap.md`, `.opencode/state.md`, `.opencode/user.md`,
  `.fallowrc.json`, `.opencode/artifacts/website-build/{plan,todo,decisions}.md`,
  `.opencode/artifacts/MEMORY.md`, `docs/sitemap.md`.
- The `.pi` -> `.opencode` migration baseline is still uncommitted in the worktree.
- **Signal Path — Editorial Cut** is the approved homepage art direction. P02A owns the
  canonical prototype/decision; P02B owns contract and registered distribution before
  production translation.
- Active milestone: **M0 — Execution-ready baseline**. See `.opencode/state.md` for the
  live blocker list.

## Milestone Map

### M0 — Execution-Ready Baseline

**Outcome:** local implementation may begin safely without unresolved ownership or
policy ambiguity.

**Depends on:** nothing.

**Exit:**
- Repository baseline (`.pi` -> `.opencode` migration) approved and committed.
- Explicit scaffold authorization recorded.
- Route/origin strategy and `draft | public | noindex` visibility policy agreed.
- Toolchain re-pinned against the current registry (plan pins Astro 5.18.2 / TS 6.0.3;
  latest is Astro 7.1.3 / TS 7.0.2 — revalidate at scaffold time).

**Does NOT require:** final domain, scheduler, CMS infrastructure, or final content
evidence. Those gate only the milestones that consume them.

### M1 — Proven Static Foundation

**Outcome:** the Astro baseline proves canonical URLs, the visibility enum, typed
references, sitemap/robots generation, and the generated-output verifier.

**Depends on:** M0.

**Exit:** representative `public`, `draft`, and `noindex` fixtures pass
`npm run check && npm test && npm run build && npm run verify`. No `draft` output, no
`noindex` in discovery, one self-canonical per indexable page, correct slash behavior.

### M2 — Accessible Core Shell

**Outcome:** reusable branded shell, navigation, About, Work With Me (`/services/`),
Contact, and 404 work without JavaScript.

**Depends on:** M1, approved brand tokens/assets, and the Contact inputs (scheduler URL
+ email fallback). P02B gates shared visual integration and M2 exit, not the start of
semantic shell work after M1.

**Exit:** keyboard navigation, reflow, 200% zoom, reduced motion, no-JS, metadata, and
route behavior pass without filler content. Internal routes use only the accepted
functional-motion baseline; no homepage editorial choreography leaks into the shell.

**Homepage ownership:** M2 may ship a minimal `/` shell, but the evidence/curation
homepage is owned by M3. This removes the prior ambiguity between Plan 03 and Plan 04.

### M3 — Credible Core Release

**Outcome:** a founder can understand Ryan's offer, inspect one evidence-approved
project, and take the approved next action. This is the **first public release**.

**Routes:** `/`, `/services/`, `/about/`, `/contact/`, `/projects/`,
`/projects/[slug]/` (one project), `/404.html`, plus `/sitemap.xml`, `/robots.txt`.

**Depends on:** M2, one approved/redacted real-work project artifact, **and** the
self-hosted Pages CMS core workflow (VPS deployment, isolated PostgreSQL, Caddy, GitHub
App, backup) verified working for the core content types.

**Exit:** homepage journey, project journey, accessibility, generated output,
deployment, rollback, and the CMS draft/public flow from desktop and phone all pass.
The production homepage translates the accepted Signal Path choreography while its
no-JavaScript, reduced-motion, unsupported-API, and failure paths render the complete
final composition immediately.

**CMS gate:** self-hosted Pages CMS is required before this release. If the
authenticated desktop/390px tracer fails, the static site is still built and previewed
locally; the public release is blocked until the CMS gate passes or an approved
fallback is recorded. This gate does not block M0–M2 local work.

### M4 — Blog Increment

**Outcome:** substantive writing, related-content journeys, and excerpt-only RSS are
public.

**Routes:** `/blog/`, `/blog/[slug]/`, `/rss.xml`.

**Depends on:** M2 and approved editorial content. Released independently after its CMS
form and quality gate pass. May run in parallel with M3's later work.

**Exit:** one complete publish/update cycle passes; feed MIME, absolute URLs, ordering,
escaping, and visibility exclusion parity verified.

### M5 — Directory Increment

**Outcome:** the Agent Workflow Tools directory adds maintained editorial value.

**Routes:** `/directories/`, `/directories/agent-workflow-tools/`, conditional
`/directories/[directory]/[entry]/` only for substantive entries.

**Depends on:** M2 and approved directory inventory. Released independently.

**Exit:** methodology, best-fit/trade-off fields, source URL protocols, disclosure
labels, `reviewedAt` freshness, stale-state behavior, substantive-detail threshold, and
sitemap parity pass.

### M6 — LLM Watcher Increment

**Outcome:** the static watcher provides sourced, date-accurate model-change snapshots
with explicit limitations.

**Routes:** `/tools/`, `/tools/llm-watcher/`.

**Depends on:** M2 and approved source data. Released independently.

**Exit:** source links, separate announcement/observation/verification dates,
deterministic ordering, draft exclusion, stale-state output, cutoff/cadence/limitations
display, and structured-data omission pass. Never describe the page as live monitoring.

### M7 — Resources Gateway

**Outcome:** visitors can discover only the resource modules that are actually public.

**Routes:** `/resources/`.

**Depends on:** at least one qualifying resource module (Blog, Directory, or Tools) is
public. Released independently after the first such module.

**Exit:** the gateway links only to modules with substantive published content; no empty
or draft-only module is linked. This prevents empty hubs from appearing publicly.

### M8 — Evidence-Triggered Experiments

**Outcome:** optional additions such as `llms.txt` answer a named hypothesis and receive
an explicit keep/remove decision.

**Depends on:** a production baseline (M3 shipped).

**Exit:** generated text, canonical URLs, redaction, and visibility parity pass
`npm run verify`; a review period produces a documented keep or remove decision.

## Parallel Tracks

These tracks run alongside the milestones and gate only the milestones that consume them.

- **Content Desk track** (self-hosted Pages CMS):
  1. VPS/PostgreSQL 16/Caddy/S3 backup/GitHub App approval.
  2. Authenticated desktop/390px mobile tracer on one representative collection.
  3. Core content forms (core pages, projects, homepage curation).
  4. Module-by-module expansion alongside M4–M6.
  Gates M3 (first public release). Does not gate M0–M2 local work. If the tracer fails,
  Git editing remains the fallback and the static site is unaffected.
- **Release track:** domain/host/CI selection, exact-SHA checks, preview, atomic
  last-good deployment, rollback, host verification. Starts after M1; required for M3.
- **Evidence/content track:** approved project artifact, editorial content, directory
  inventory, source data. Gates only milestones consuming that material.
- **Art-direction track:** P02A refines the canonical brand landing proof in place,
  repairs its no-JavaScript mobile-navigation baseline, and records explicit responsive,
  accessibility, reduced-motion, performance, and visual acceptance. P02B then codifies
  the contract, regenerates local mirrors/capture, and verifies the existing published
  `user:brand-design-system` record. P02B gates M2 visual integration/exit and M3
  homepage choreography, not M1 or the start of Plan 03 semantic-shell work.
- **Shared policy track:** canonical, visibility, route, evidence, and output contracts.
  All tracks consume these but do not independently redefine them.

## Open Decision Gates

See `.opencode/state.md` for the live, resolved/unresolved status of each:

- Repository baseline approval and scaffold authorization (gates M0).
- Brand token/asset allowlist (gates M2).
- P02A canonical Signal Path prototype acceptance, then P02B local/registered package
  verification (gate M2 visual integration and M3 homepage choreography; direction
  itself is approved).
- Contact inputs: scheduler URL, email fallback, privacy-route decision (gates M2/M3).
- Approved redacted real-work project artifact (gates M3).
- Self-hosted Pages CMS infrastructure: VPS host, isolated PG 16, Caddy config, S3
  backup, GitHub App scope/revocation (gate the Content Desk track).
- Final domain and static host/CI provider (gate the release track).

## Deferred / Trigger-Based Work

- `/now/` — not in initial scope.
- `llms.txt` — M8; only after a named usage hypothesis.
- Public tags/facets, AI/design capability routes, nested `/resources/*` copies, forms,
  search/filter routes, generated OG images, theme switcher — absent by design
  (`docs/sitemap.md`).

## References

- `.opencode/state.md` — current position and live blockers.
- `.opencode/artifacts/website-build/plan.md` — implementation tasks, files, dependencies,
  verification, failure behavior.
- `.opencode/artifacts/website-build/todo.md` — completion tracking.
- `.opencode/artifacts/website-build/decisions.md` — ADR-002 (self-hosted Pages CMS).
- `docs/sitemap.md` — route availability contract.
- `AGENTS.md` — binding stack, architecture, SEO/AI, workflow constraints.
