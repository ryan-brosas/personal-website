# Plan: Evidence-Led Personal Website

```yaml
---
status: blocked
effort: XL
stack: Astro 5 static, strict TypeScript, semantic HTML, plain CSS, self-hosted Pages CMS 2.1.8 editing layer on operator VPS (isolated PostgreSQL state, host Caddy, S3 backups)
planning_root: .opencode/artifacts/website-build/
must_haves:
  truths:
    - "A founder can understand Ryan's offer, inspect credible work, and reach the booking path."
    - "Projects, writing, directories, and LLM Watcher work without JavaScript."
    - "Every published claim, artifact, date, and freshness statement has approved evidence."
    - "Draft and noindex content never leaks into discovery, curation, RSS, or related content."
    - "Every indexable page has one stable trailing-slash URL and self-canonical."
    - "Resources groups publishing types without duplicating or nesting their canonical URLs."
    - "Ryan can manage all public site content from a separate browser Content Desk on desktop or phone without editing routes or layouts."
    - "The homepage uses one accepted expressive editorial sequence while internal routes remain quiet and all content works without motion or JavaScript."
  artifacts:
    - path: "docs/sitemap.md"
      provides: "Approved route-disposition contract"
    - path: "docs/content-source-manifest.md"
      provides: "Public-safe evidence, rights, and publication approvals"
    - path: "src/content.config.ts"
      provides: "Validated publishing schemas"
    - path: "src/lib/publishing.ts"
      provides: "Fail-closed visibility, evidence, freshness, and relationship policy"
    - path: "src/lib/routes.ts"
      provides: "Canonical URL builders and public-route inventory"
    - path: "src/layouts/BaseLayout.astro"
      provides: "Accessible branded document shell"
    - path: "src/pages/sitemap.xml.ts"
      provides: "Metadata-aware sitemap"
    - path: "scripts/verify-build.mjs"
      provides: "Generated-output contract verification"
    - path: ".pages.yml"
      provides: "Fixed-form Pages CMS configuration for approved public content and media"
    - path: "docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html"
      provides: "Canonical accepted homepage art-direction and motion proof"
  key_links:
    - from: "src/content.config.ts"
      to: "src/lib/publishing.ts"
      via: "validated visibility, evidence, dates, and typed references"
    - from: "src/lib/publishing.ts"
      to: "sitemap, RSS, homepage, and related content"
      via: "one shared publication policy"
    - from: "src/lib/routes.ts"
      to: "canonicals and discovery outputs"
      via: "central route builders"
    - from: "docs/content-source-manifest.md"
      to: "project and homepage evidence"
      via: "approved source IDs and redacted assets"
    - from: "src/data/model-updates.json"
      to: "/tools/llm-watcher/"
      via: "validated static snapshots"
    - from: ".pages.yml"
      to: "src/content.config.ts"
      via: "schema-compatible fields, draft defaults, and representative CMS-written fixtures"
    - from: "Pages CMS"
      to: "GitHub validation and static deployment"
      via: "repository-scoped GitHub App writes followed by the same check, test, build, and verify gate"
    - from: "docs/Ryan-Brosas-Brand-System/DESIGN.md"
      to: "src/pages/index.astro"
      via: "accepted Signal Path motion contract translated as progressive enhancement"
---
```

## Goal

Launch a static, evidence-led personal website positioning Ryan Brosas as an
**Agent Systems Builder**, with credible proof, flexible publishing, conventional
SEO, AI-search accessibility, and a separate browser Content Desk for safely
managing public content without making the site dynamic.

## Route Contract

| Disposition | Routes |
|---|---|
| Launch | `/`, `/services/`, `/projects/`, `/projects/[slug]/`, `/resources/`, `/blog/`, `/blog/[slug]/`, `/directories/`, `/directories/agent-workflow-tools/`, `/tools/`, `/tools/llm-watcher/`, `/about/`, `/contact/` |
| Conditional | `/directories/[directory]/[entry]/` only for substantive editorial entries; `/privacy/` if the scheduler/privacy review requires it |
| Files | `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/404.html` |
| Deferred/absent | `/now/`, public tags/facets, AI/design capability routes, nested `/resources/*` copies, forms, search/filter state, theme switcher, generated OG images, `llms.txt` |

HTML routes use trailing slashes. File endpoints do not. A sitemap index is
unnecessary while one sitemap is sufficient.

## Constraints

- Explicit scaffold authorization is required (`AGENTS.md:28-32,56-60`).
- Static Astro, strict TypeScript, semantic HTML, plain CSS, no UI framework.
- No MDX, SSR adapter, runtime CMS, database, analytics, form backend, or client-state package initially.
- Self-hosted Pages CMS 2.1.8 is an editing layer only: it writes approved Markdown, JSON, and safe media to GitHub; it is not shipped with or queried by the public site. An isolated PostgreSQL container holds CMS application state (auth, sessions, tokens, collaborators, cache) only - website content stays in Git.
- Templates are fixed. The Content Desk may edit public words, images, links, curation, and visibility, but never routes, canonicals, layouts, schemas, SEO policy, private approval records, security headers, or deployment code.
- The Pages CMS choice is conditional on a real authenticated editor tracer passing at desktop and 390px mobile widths before broad configuration.
- The self-hosted Pages CMS GitHub App requests broad repository permissions (Administration, Actions, Contents read/write). `.pages.yml` constrains the form UI, not the token; branch and ruleset protections remain the real authorization boundary.
- Pages CMS migrations are forward-only with no documented rollback command. A DB backup plus image/snapshot is required before any upgrade; image rollback alone is insufficient after a schema change.
- Projects retain `/projects/[slug]/`; AI and website-design work remain project metadata, not new route families.
- Publication uses one fail-closed state: `draft | public | noindex`.
- Canonicals are derived from route and final origin, not routinely authored.
- Plan 01's `astro.config.mjs` uses a placeholder origin (e.g. `https://example.com`); Plan 01's verifier validates canonicals against that configured `site` (placeholder allowed locally). The production origin is injected at release time (Plan 10), whose verifier rejects placeholder origins. The final domain gates the release track (M3), not the build gate.
- Cross-content references use `{ collection, id }`, never authored internal URLs.
- Evidence status is claim-level and separate from publication, lifecycle, and UI state.
- Import only approved brand tokens/assets; never publish the complete brand package.
- Homepage editorial motion is progressive enhancement. Final content and navigation render before enhancement; unsupported APIs, script failure, and reduced-motion preferences retain the final static composition.
- No promises of indexing, ranking, rich results, or AI citation (`AGENTS.md:45-54`).

## Non-goals

- CRM, lead scoring, email automation, or a customer database. Contact remains a scheduler link plus email fallback.
- Visual page building, arbitrary layout blocks, editable route paths, or unrestricted HTML/CSS.
- Runtime CMS queries, live preview inside the public site, or a dependency on Pages CMS availability for readers.
- Multi-user editorial roles, scheduled publishing, or branch-heavy approval workflows in the initial release.

## Dependency Graph

```text
Plan 00: baseline and launch contract
  |-> Plan 01: policy-kernel tracer
  |    |-> Plan 02: Pages CMS mobile tracer (also needs CMS infra approvals)
  |    +-> Plan 03: brand shell and core pages
  |             (Task 1 visual integration also needs completed Plan 02B)
  |             |-> Plan 04: projects and homepage  (first public release: credible core)
  |             |-> Plan 05: blog and RSS          (independent release increment)
  |             |-> Plan 06: directory             (independent release increment)
  |             +-> Plan 07: LLM Watcher            (independent release increment)
  |
  +-> Plan 02A: homepage prototype + visual acceptance (needs repository baseline only)
           -> Plan 02B: contract + local/registered distribution
                +-> gates Plan 03 Task 1 visual integration and Plan 04 choreography

Plan 02 + Plans 04-07
  -> Plan 08: Content Desk expansion (per-module; does not block releases)

At least one of Plans 04-07 public
  -> Plan 09: resources integration and quality gate

Release track (Plan 10) is reusable for every public increment; first use is the credible core.

Plan 11: optional post-launch llms.txt experiment
```

Plan 02A may run after the Plan 00 repository baseline, in parallel with Plan 01 and
Plan 02. Plan 02B starts only after P02A's durable visual acceptance. Plan 03 may begin
semantic shell work after Plan 01; only its Task 1 shared visual integration and M2 exit
wait on completed P02B. Plan 04 also waits on P02B. Plans 04-07 may otherwise run in
parallel after Plan 03. They must not independently alter shared schemas, `.pages.yml`,
route policy, or the accepted motion contract without stopping for coordination. Plan
08 owns broad Content Desk configuration after those content contracts stabilize; it
expands per module and does not block the independent release of Plans 04-07 or Plan 09.

The default code gate for Plans 01-11 is `npm run check && npm test && npm run build && npm run verify`; browser-facing plans add the viewport, keyboard, no-JavaScript, reduced-motion, performance, or hosted checks named below. Plans 02A/02B use their standalone static-package gates before the Astro scaffold exists. Execute them through their exact scoped build-agent handoffs, not `/ship`: that command unconditionally requires npm gates and writes lifecycle files outside these task contracts.

### Milestone mapping

The roadmap (`.opencode/roadmap.md`) owns outcome milestones; this plan owns tasks.
Mapping: M0 = Plan 00 (baseline only); M1 = Plan 01; M2 = Plans 02A/02B + Plan 03; M3 = Plan 03 + Plan
04 + the Content Desk track (core) + Plan 10 (release); M4 = Plan 05; M5 = Plan 06;
M6 = Plan 07; M7 = Plan 09; M8 = Plan 11. Releases are incremental; the credible core
(M3) ships first.

## Plan 00 - Baseline and Launch Contract

**Effort: M. Gates later plans as noted per task.**

The Plan 00 tasks resolve different inputs that gate different downstream work. They
are not a single all-or-nothing block on scaffolding:

- **Task 1 (repository baseline)** and the route/visibility policy from **Task 2** gate
  all local implementation (the build gate in `.opencode/state.md`).
- **Task 3 (launch-input checkpoint)** resolves inputs that gate only their downstream
  milestones: domain/host/CI gate the release track; scheduler/email/privacy gate
  Contact (Plan 03) and the first release (M3); approved evidence gates Plan 04 (M3);
  content permissions gate the content tracks.
- **Task 4 (self-hosted Pages CMS infrastructure)** gates the Content Desk track (Plan
  02 and Plan 08) and the first public release (M3), not local M0-M2 work.

1. **Resolve repository ownership**
   - Decide whether the tracked `.pi/` deletions and untracked `.opencode/` tree represent an intentional migration.
   - Recommended path: approve `.opencode/artifacts/website-build/` as the planning root and update stale references in `AGENTS.md`.
   - Alternative: explicitly restore and retain `.pi/`; never maintain both.
   - Verify: `git status --short` and `git diff --name-status` contain only operator-approved planning changes.

2. **Publish the route contract**
   - Maintain `docs/sitemap.md` with every route marked `launch`, `conditional`, `defer`, or `absent` (published 2026-07-22).
   - Keep route availability separate from per-record content visibility: `draft`, `public`, or `noindex`.
   - Record `/resources/` as a gateway, not a duplicate hierarchy.
   - Record custom `/sitemap.xml` and removal of the planned `@astrojs/sitemap` dependency.
   - Verify: every route decision appears exactly once with one route disposition.

3. **Complete the launch-input checkpoint** (gates release/content tracks, not all scaffolding)
   - Create `docs/content-source-manifest.md` and `docs/launch-contract.md`.
   - Resolve final domain, host, scheduler URL, email fallback, GitHub repository/default branch, Pages CMS account owner, content locations, ownership, public-use permission, disclosure status, review date, approved artifact IDs, and favicon variant.
   - Record that Pages CMS may receive least-privilege access to this repository only; collaborator access remains disabled initially.
   - Store only public-safe paths/URLs and opaque approval references - not contracts, credentials, analytics, or customer information.
   - Verify: operator approval is recorded and at least one redacted real-work artifact is cleared for homepage use.

4. **Approve self-hosted Pages CMS infrastructure** (gates the Content Desk track and M3, not local M0-M2)
   - Approve the operator VPS as the Pages CMS host and confirm coexistence with existing services (containers `openviking` and `omniroute` on loopback; native PostgreSQL 18.4 cluster on port 5433 of unknown workload).
   - Choose an isolated PostgreSQL 16 container on a private Compose network (no published PG host port) over the native PG 18.4 cluster, since Pages CMS publishes no PG compatibility matrix and isolation improves backup/upgrade boundaries.
   - Approve the host Caddy reverse-proxy configuration for `cms.ryanjosebrosas.dev` (currently HTTP 525); Pages CMS binds to loopback only, Caddy keeps ports 80/443.
   - Approve an S3-compatible off-site backup target: provider, bucket, credentials, retention policy, and restore-drill cadence.
   - Approve the self-hosted Pages CMS GitHub App scope (broad: Administration, Actions, Contents read/write) and revocation procedure; confirm branch/ruleset protections as the real authorization boundary.
   - Verify: topology recorded as Cloudflare DNS -> host Caddy HTTPS -> pinned Pages CMS container on loopback -> isolated PostgreSQL container on private Compose network; secrets stored on the VPS, not the repository.

**Stop condition:** local implementation (Plan 01) may begin once Task 1 and the route
policy from Task 2 are resolved — the **build gate** in `.opencode/state.md`. CMS
infrastructure (Task 4) gates the Content Desk track (Plan 02, Plan 08) and the first
public release (M3), not local work. Launch inputs (Task 3) gate only their downstream
milestones. Releases are incremental; the credible core (M3) ships first.

## Plan 01 - Policy-Kernel Tracer

**Effort: L. Needs Plan 00.**

1. **Create the pinned Astro baseline**
   - Files: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`.
   - Pin Astro `5.18.2`, TypeScript `6.0.3`, `@astrojs/check` `0.9.9`, Node `24.16.0`, npm `11.13.0`.
   - Decline Astro 7.1.3 / TypeScript 7.0.2: `@astrojs/check` 0.9.9 peers `typescript: ^5.0.0 || ^6.0.0` and does not support TS 7 (verified 2026-07-22). Revisit when `@astrojs/check` supports TS 7.
   - Add `dev`, `check`, `test`, `build`, `preview`, and `verify` scripts.
   - Configure static output, strict TypeScript, placeholder `site` (production origin injected at release), and `trailingSlash: "always"`.

2. **Implement the publishing contracts**
   - Files: `src/content.config.ts`, `src/lib/publishing.ts`, `src/lib/routes.ts`, `src/data/sources.json`, `tests/policy.test.mjs`.
   - Define schemas for all launch collections and editable singleton records plus the `draft | public | noindex` enum, defaulting to draft.
   - Encode evidence variants:
     - Verified requires `sourceId`.
     - Proposed requires a trade-off.
     - Open requires missing proof and the blocked decision.
   - Distinguish `published`, substantive `updated`, and `reviewedAt`/`lastVerified`.
   - Validate typed relationships and reject hidden or missing targets.

3. **Trace policy into discovery output**
   - Files: `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `scripts/verify-build.mjs`.
   - Build one sitemap from the public-route inventory; do not also install `@astrojs/sitemap`.
   - Generate robots from the final origin.
   - Make verification read-only and fail on route, canonical, visibility, or origin mismatches against the configured `site` (placeholder allowed during Plan 01; release rejection of placeholder origins is Plan 10's job).

Verify:

```bash
npm ci
npm run check
npm test
npm run build
npm run verify
```

## Plan 02 - Pages CMS Mobile Tracer

**Effort: M. Needs Plan 01 and the approved GitHub repository details from Plan 00.**

1. **Configure one representative editing path**
   - Files: root `.pages.yml`, one draft fixture under `src/content/directoryEntries/`, and an approved test raster under `public/media/content/`.
   - Expose only the directory-entry fixture at first. Exercise structured fields, Markdown body, visibility, reviewed date, source URL, disclosure, optional media, and alt/decorative state.
   - Default visibility to `draft`, enable `settings.content.merge: true`, hide raw-source switching, and disable rename/delete operations for the tracer.

2. **Wire validation without granting a deployment bypass**
   - Files: `.github/workflows/cms-validate.yml`, `tests/cms-fixtures.test.mjs`, and the CMS action configuration in `.pages.yml`.
   - Run the same `check`, test, build, and generated-output verification used by local work. Reject unknown fields, unsafe HTML, invalid protocols, disallowed media, missing accessibility text, and visibility leaks.
   - Keep credentials out of the repository. A CMS validation failure must not alter the current production deployment.

3. **Run the authenticated editor acceptance gate**
   - Install the Pages CMS GitHub App with access to this repository only.
   - At desktop and 390px widths, create/edit/save the draft, use rich text and media, change explicit visibility, and run the validation action. Check horizontal overflow, touch targets, field reachability, data preservation, and keyboard access.
   - Record the result in implementation notes; do not expand `.pages.yml` unless the real editor passes both widths.

**Stop condition:** a failed mobile tracer blocks Pages CMS rollout, not the static site. Re-open the architecture choice between CloudCannon and Sanity before configuring additional content types.

## Plan 02A - Homepage Prototype and Visual Acceptance

**Effort: M. Needs the Plan 00 repository baseline and the approved Signal Path — Editorial Cut direction. May run in parallel with Plan 01/02. Gates Plan 02B.**

Complete spec and execution contract:
`.opencode/artifacts/homepage-art-direction/{spec,plan}.md`.

1. **Prototype in the canonical applied proof**
   - Refine only `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html` plus P02A execution notes during iteration.
   - Repair the existing JavaScript-only mobile navigation: base links remain visible without JavaScript; a disclosure may collapse them only after enhancement is available.
   - Prove cropped headline planes, a structural rule sweep, one finite System Conductor signal trace, manifesto color-plane cut, restrained system choreography, and selected media masks.

2. **Run and record the visual acceptance gate**
   - Verify the exact viewport matrix, keyboard/Escape/focus return, real screen-reader smoke, 200% zoom, JavaScript-disabled, reduced-motion, console/network, layout shift, idle animation, and three representative mobile performance traces.
   - Record environment, results, prototype hash, and Ryan's decision at `.opencode/artifacts/homepage-art-direction/acceptance.md`.
   - On rejection, restore canonical bytes from the untouched showcase mirror and prove parity. On acceptance, leave mirrors untouched and hand the exact hash to P02B.

**Stop condition:** P02B starts only when the acceptance record says `Status: accepted` and its hash matches canonical. P02A alone does not unblock production translation.

## Plan 02B - Motion Contract and Registered Distribution

**Effort: M. Needs accepted Plan 02A. Gates Plan 03 Task 1 visual integration and Plan 04 homepage choreography.**

Complete spec and execution contract:
`.opencode/artifacts/homepage-art-direction-canonicalization/{spec,plan}.md`.

1. **Codify the contract and regenerate local mirrors**
   - Update `DESIGN.md`; copy canonical bytes to `showcase-landing-page.html`; generate `system/artifacts/landing.html` with only the documented `tokens.css`, `logos/`, and `assets/` two-level rebase.
   - Require canonical/showcase byte parity, reversible renderer parity, UTF-8 integrity, and local resource resolution.

2. **Refresh and verify distribution**
   - Refresh the existing 1800px-wide applied capture and run the documented Open Design package audit when its environment is available.
   - Synchronize the existing `user:brand-design-system` record in place; verify unchanged id, published metadata, current changed-file hashes, production logo, selected landing proof, and 200 responses for registered resources.
   - Missing external tooling/access leaves P02B blocked; local parity is not sufficient.

3. **Close status gates**
   - Mark P02A/P02B complete only after local and remote distribution checks pass; point Plan 03 Task 1 and Plan 04 at the accepted contract and hash.

**Stop condition:** no shared visual integration or homepage production choreography starts until registered distribution is verified.

## Plan 03 - Brand Shell and Core Pages

**Effort: L. Needs Plan 01. Task 1 and M2 completion also need completed Plan 02B.**

1. **Create the production asset boundary**
   - Files: `src/styles/global.css`, selected files under `src/assets/brand/`, and `public/favicon.svg`.
   - Import the canonical root `tokens.css` once.
   - Copy only explicitly selected SVGs and approved assets; exclude revisions, previews, temporary files, and the browser component kit.
   - Start only after Plan 02B distribution is verified. Consume its functional timing, focus/menu continuity, and reduced-motion rules; keep expressive homepage choreography out of shared internal-route styles.

2. **Build the semantic shell**
   - Files: `src/layouts/BaseLayout.astro`, `src/components/SeoHead.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`.
   - Include skip navigation, semantic landmarks, visible focus, current-page state, canonical metadata, and noindex handling.
   - Keep all navigation usable without JavaScript.

3. **Publish core pages**
   - Files: `src/config/site.ts`, `src/content.config.ts` (schema expansion), records for About/Services/Contact under `src/content/pages/`, `src/content/settings/site.json`, `src/pages/[page].astro` (dynamic route), `src/pages/index.astro`, `src/pages/404.astro`.
    - Core pages use a constrained dynamic route (`src/pages/[page].astro`) with `getStaticPaths()` filtered by `isRoutable` so `draft` records produce no route, `noindex` records produce a route excluded from discovery, and `public` records produce a route in the sitemap. Fixed static files cannot uphold `draft → no route`.
    - The minimal `/` is code-owned and `noindex` with approved identity copy only — no Home Markdown record is consumed during M2. Plan 04 promotes `/` to public.
    - Keep page IDs and route paths code-controlled while loading editable public copy, navigation labels, scheduler link, and email fallback from validated records.
    - Plan 03 owns the About/Services/Contact/404 routes and the minimal `/` shell. The evidence/curation homepage is owned by Plan 04. Contact and Resources records remain draft until their inputs resolve; do not use filler copy to force them public.
    - Label `/services/` as **Work With Me**.
    - Contact explains fit and process, then links normally to the approved external scheduler with an email fallback.

Verify at 360px, 768px, and desktop widths with keyboard navigation, 200% zoom, reduced motion, and JavaScript disabled.

## Plan 04 - Project Proof and Homepage

**Effort: L. Needs approved evidence from Plan 00, Plan 03, and completed Plan 02B.**

1. **Publish one complete project**
   - Files: `src/content/projects/<approved-slug>.md`, `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`.
   - Include context, work, checks, handoffs, recovery, role, trade-offs, and only approved outcomes.
   - Keep AI and website-design distinctions as controlled project metadata.

2. **Create evidence primitives**
   - Files: `src/components/EvidenceBlock.astro`, `src/components/SystemMap.astro`, `src/components/WorkArtifact.astro`.
   - Resolve source IDs without exposing private paths.
   - Use a semantic static System Map; do not vendor the brand-system runtime.

3. **Build the homepage foundation**
   - Files: `src/content/pages/home.md`, `src/data/home-curation.json`, `src/pages/index.astro`, `src/lib/routes.ts` (promote `/` from `noindex` to `public`), homepage-scoped styles/motion module, `tests/home-curation.test.mjs`.
   - Promote `/` from `noindex` to `public`: update route visibility, remove the `noindex` meta, and verify `/` appears exactly once in the sitemap. This is the atomic promotion gate from M2 to M3 homepage.
   - Order: positioning and CTA -> real artifact -> selected proof -> agent/script/process method -> available resources -> CTA.
   - Use typed, manually ordered references; reject draft, noindex, or missing targets.
   - Translate the Plan 02B-distributed hero, manifesto, system, and evidence choreography without importing the brand-package runtime. Keep final HTML readable before enhancement and internal routes outside the expressive motion scope.

Verify the homepage and selected project route with the default code gate, then inspect generated canonicals, draft exclusion, typed curation order, real-artifact redaction, disabled-JavaScript and reduced-motion behavior, one-shot settlement, layout stability, and representative mobile animation performance.

## Plan 05 - Blog, Relationships, and RSS

**Effort: M-L. Needs Plan 03.**

1. Build `src/layouts/ArticleLayout.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, and approved Markdown entries under `src/content/blog/`.
2. Add typed cross-content relationships through `src/components/RelatedLinks.astro`; exclude hidden and missing targets.
3. Add exact `@astrojs/rss@4.0.19` and implement `src/pages/rss.xml.ts` as excerpt-only, newest-first, public-only output.

Verify feed MIME type, absolute URLs, stable dates, escaping, ordering, and exclusion parity.

## Plan 06 - Agent Workflow Tools Directory

**Effort: L. Needs Plan 03 and approved inventory.**

1. Add the directory methodology at `src/content/directories/agent-workflow-tools.md` and reviewed records under `src/content/directoryEntries/`.
   - Each record includes best fit, trade-offs, source URL, disclosure, and `reviewedAt`.
2. Build `src/pages/directories/index.astro`, `src/pages/directories/[slug].astro`, and conditional `src/pages/directories/[directory]/[entry].astro`.
   - Generate detail routes only when explicitly approved as substantive.
3. Add directory cards and freshness behavior under `src/components/directory/`; reject non-HTTP(S) URLs and surface overdue reviews visibly.

Verify the hubs, conditional detail-route threshold, URL protocols, disclosure labels, review dates, stale state, and sitemap parity with the default code gate.

## Plan 07 - Static LLM Watcher

**Effort: M. Needs Plan 03 and source-approved update data.**

1. Define `src/data/model-updates.json` and `src/lib/model-updates.ts`.
   - Keep announcement, observation, and verification dates separate.
   - Require original summaries and primary source links.
2. Build `src/pages/tools/index.astro`, `src/pages/tools/llm-watcher/index.astro`, and `src/components/ModelUpdateList.astro`.
3. Test ordering, source validation, visibility, and overdue-review behavior.
   - Display cutoff, cadence, limitations, and last verification date.
   - Never describe the static page as live monitoring or automatically emit `SoftwareApplication` schema.

Verify source links, independent date semantics, deterministic ordering, draft exclusion, stale-state output, and structured-data omission with the default code gate.

## Plan 08 - Content Desk Expansion

**Effort: L. Needs a passing Plan 02 tracer and stable content contracts from Plans 04-07. Expands per module; does not block independent releases of Plans 04-07 or Plan 09.**

1. **Expose all approved public content through fixed forms**
   - Expand root `.pages.yml` for projects, blog posts, directories, directory entries, LLM Watcher updates, homepage curation, fixed-ID page records, public site settings, and approved media.
   - Treat Home/About/Services/Contact/Resources and site settings as protected singletons: disable create, rename, and delete. Keep route paths, canonical origin, schema code, private evidence records, and deployment settings unavailable.
   - Restrict CMS-managed media to approved raster formats under `public/media/content/`; keep brand SVGs and code assets outside the editor.

2. **Lock CMS fields to the authoritative site schemas**
   - Files: `.pages.yml`, representative files under `tests/fixtures/cms/`, and `tests/cms-fixtures.test.mjs`.
   - Keep `src/content.config.ts` and publishing helpers authoritative. Use explicit draft defaults, typed references instead of pasted internal URLs, `settings.content.merge: true`, protocol validation, and required alt text or explicit decorative state.
   - Disable raw-source switching where supported and reject unsafe raw HTML during site validation. Add a direct YAML dependency only if implementation tests must parse `.pages.yml`; never rely on an undeclared transitive package.

3. **Verify the complete editorial state transition**
   - From phone and desktop, exercise one singleton, one Markdown entry, one structured directory entry, one homepage reference, one model-update record, and one image.
   - Verify: Draft save -> validation/preview -> explicit Public selection -> checked static deployment. Drafts must generate no routes or discovery entries; invalid edits on a non-production branch must fail without replacing the last good deployment.
   - Keep Git editing as the outage fallback. Adding collaborators, branch-heavy review workflows, or direct production actions requires a separate permission review.

## Plan 09 - Resources Integration and Quality Gate

**Effort: L. Needs at least one of Plans 04-07 to be public; does NOT require Plan 08.**

1. Build `src/pages/resources/index.astro`; update the homepage curated stream and shared navigation to include only modules with published content.
2. Extend `scripts/verify-build.mjs` to parse generated HTML/XML and assert:
   - exact route inventory;
   - one self-canonical per indexable page;
   - no draft output;
   - noindex discovery exclusion;
   - correct slash behavior;
   - valid sitemap and RSS URLs;
   - no broken internal links;
   - no local paths, placeholder origins, or private source strings.
3. Add pinned browser-test dependencies only after checking current official documentation. Create `playwright.config.ts` and focused tests under `tests/e2e/` for keyboard access, focus, reflow, no-JS navigation, contrast, and semantic reading order.

The Resources gateway links only to modules with substantive published content; it
does not wait for CMS expansion or for every module to be ready.

## Plan 10 - Deployment and Launch (reusable release track)

**Effort: L. Needs the release inputs from Plan 00 Task 3. First use: the credible core (Plans 03 + 04 + the Content Desk track). Reused for each public increment.**

1. Add the provider-specific configuration named in `docs/launch-contract.md`, a clean-checkout CI gate, and `docs/runbooks/deploy.md`. CI must run `npm ci`, checks, tests, build, and output verification for developer and Pages CMS commits. Before each release build, inject the production origin (from `docs/launch-contract.md`, supplied as a CI build secret) into the build's `site` configuration; release-mode output verification rejects placeholder origins (e.g. `https://example.com`) so Plan 01's local placeholder allowance never ships to production.
2. Configure preferred-host redirects, HTTPS, real 404 behavior, atomic last-good deployment behavior, rollback, and supported security headers. Add `/privacy/` only if the recorded scheduler/privacy decision requires it.
3. Revalidate crawler documentation immediately before each release. With search and training access approved, prefer a simple crawlable policy and the exact sitemap URL; never treat robots as privacy or authorization.

This plan is the release track, not a single one-shot launch. The first public release
is the credible core (M3: `/`, `/services/`, `/about/`, `/contact/`, `/projects/`,
`/projects/[slug]/`). Blog, Directory, LLM Watcher, and Resources each release
independently through the same CI/deploy/verify path once their own content gate passes.

Production verification:

```bash
npm ci
npm run check
npm test
npm run build
npm run verify
npm run test:e2e
npm run preview
```

Then verify on the real host:

- `/path` versus `/path/`
- file endpoints without trailing slashes
- preferred-host and HTTPS redirects
- genuine 404 status
- canonical origin
- sitemap, RSS, and robots contents
- disabled-JavaScript navigation
- scheduler failure and email fallback
- Pages CMS draft/public flow from desktop and phone
- rollback procedure

## Plan 11 - Optional `llms.txt` Experiment

**Effort: S-M. Post-launch only, after a named usage hypothesis is recorded.**

1. Generate `llms.txt` only from the same public-route inventory used by sitemap and RSS; never include draft, noindex, private source, or CMS-only data.
2. Verify generated text, canonical URLs, redaction, and visibility parity through `npm run verify`.
3. Remove the endpoint if the experiment has no demonstrated maintenance or retrieval value.

## Failure Behavior and Guardrails

- Missing permission or evidence -> content remains draft and generates no route.
- Invalid references, source IDs, dates, or URLs -> build fails.
- Pages CMS schema drift or an invalid CMS-written file -> validation fails; production remains on the last good deployment.
- Pages CMS outage or PostgreSQL/backup failure -> the existing public static site remains unaffected; direct Git editing remains available.
- Pages CMS upgrade requires a verified DB backup plus image/snapshot before applying forward-only migrations; image rollback alone is insufficient after a schema change.
- Failed authenticated mobile tracer -> do not expand Pages CMS; revisit the documented fallback (CloudCannon paid, Sanity hosted-database) without changing the static-site boundary.
- Noindex content remains crawlable but is excluded from sitemap, RSS, curation, related content, and future AI outputs.
- Overdue directory or watcher data displays an explicit stale state; it must not silently claim freshness.
- Missing canonical origin or route mismatch -> release verification fails.
- Scheduler outage -> email fallback remains visible.
- Structured data is omitted when visible content cannot substantiate it.
- Motion API failure, JavaScript failure, or reduced-motion preference -> the complete final composition remains visible and usable; no animation retry or fallback UI is required.
- Unaccepted P02A prototype, incomplete P02B local parity, or unverified registered package -> stop before Plan 03 Task 1 visual integration and Plan 04 homepage translation.

## Privacy and Security

- Install the self-hosted Pages CMS GitHub App with repository-scoped access. The App requests broad permissions (Administration, Actions, Contents read/write); branch and ruleset protections are the real authorization boundary. Do not place GitHub tokens, CMS credentials, or runtime secrets in repository files - store them on the VPS.
- Keep collaborators disabled initially. Any future collaborator access needs an explicit repository-permission and content-approval review.
- The Content Desk contains public content only. Never expose contracts, customer data, raw analytics, credentials, private approvals, or unredacted evidence through `.pages.yml`.
- Allow only `http:`/`https:` external URLs and an approved scheduler host. Reject raw HTML, event attributes, unsafe media extensions, and SVG uploads through the CMS.
- Require alt text or an explicit decorative state for CMS-managed images. Strip sensitive metadata and review screenshots for names, tokens, local paths, and customer information before publication.
- Treat robots, draft state, and `noindex` as publishing controls, not authorization or privacy boundaries.
- Back up the isolated PostgreSQL database off-site daily via encrypted `pg_dump` (custom format) and run periodic restore drills; no published PG host port on the VPS.

## Open Blockers

Tagged by the track each gates. See `.opencode/state.md` for live resolved/unresolved status.

Brand/art-direction track (gates Plan 03 Task 1 visual integration and Plan 04 homepage choreography, not Plan 01 or Plan 03 semantic-shell work):
- `[GATE: P02A must pass responsive, no-JavaScript, reduced-motion, accessibility, performance, and explicit visual acceptance checks with a durable accepted hash.]`
- `[GATE: P02B must synchronize local mirrors/capture and verify the existing published user:brand-design-system record before production translation.]`

Release/content track (gate only their downstream milestones, not local work):
- `[UNCERTAIN: What is the final production domain?]` — release track
- `[UNCERTAIN: Which static host and CI provider will be used?]` — release track
- `[UNCERTAIN: Which GitHub repository/default branch and Pages CMS account owner are approved?]` — release + Content Desk tracks
- `[UNCERTAIN: What scheduler URL and public email fallback are approved?]` — Contact (Plan 03) + M3
- `[UNCERTAIN: Which mixed-source assets and claims have public-use permission?]` — content tracks (M4-M6)
- `[UNCERTAIN: Which redacted real-work artifact anchors the homepage?]` — Plan 04 / M3
- `[UNCERTAIN: Does scheduler usage require a dedicated privacy route?]` — Contact + M3

Content Desk track (gate Plan 02, Plan 08, and M3; do not gate local M0-M2):
- `[UNCERTAIN: Is the operator VPS approved as the self-hosted Pages CMS host, coexisting with existing services?]`
- `[UNCERTAIN: Is isolated PostgreSQL 16 chosen over the native PG 18.4 cluster on port 5433?]`
- `[UNCERTAIN: Is the host Caddy reverse-proxy config for cms.ryanjosebrosas.dev approved?]`
- `[UNCERTAIN: Which S3-compatible backup provider, bucket, credentials, retention, and restore-drill cadence are approved?]`
- `[UNCERTAIN: Is the self-hosted Pages CMS GitHub App scope and revocation procedure approved, with branch/ruleset protections confirmed?]`
- `[GATE: The authenticated Pages CMS editor must pass the desktop and 390px mobile tracer before Plan 08 and before the first public release (M3).]`

## Rationale and Trade-offs

The plan prioritizes one policy kernel, one canonical URL system, and one discovery
inventory. This adds deliberate upfront modeling but prevents the more costly failure:
routes, sitemap, RSS, homepage curation, and evidence rules disagreeing after content
scales.

Pages CMS adds a convenient browser form layer while Git remains the portable source of
truth and Astro remains the publication authority. Self-hosting Pages CMS 2.1.8 on the
operator VPS reuses existing Docker, Caddy, and compute capacity and avoids a hosted-service
dependency, at the cost of running a dynamic application plus PostgreSQL and managing
secrets, migrations (forward-only), backups, and upgrades. The trade-off is duplicated
form/schema configuration plus trust in a repository-scoped GitHub App with broad
permissions, contained by branch/ruleset protections and the early mobile tracer plus
CMS-written fixture tests before broad rollout.

Reconsider the architecture only if live data, authenticated functionality, or
independently routed model updates become demonstrated requirements. Those would
justify SSR, a database, or richer tool infrastructure. Reconsider Pages CMS specifically
if the authenticated editor fails mobile parity, schema drift becomes costly, self-hosting
operations become unsustainable, or a real multi-person editorial approval workflow is
required.

## Status

Execution is **incremental**. Releases are public increments, not one coordinated
launch; the credible core (M3) ships first. See `.opencode/roadmap.md` for the
milestone model.

Local implementation (Plan 01) is blocked only on the **build gate**: repository
baseline approval + scaffold authorization + agreed route/visibility policy +
re-pinned toolchain (`.opencode/state.md`). Domain, scheduler, CMS infrastructure,
and final content do not gate local work — they gate only the milestones that
consume them.

Self-hosted Pages CMS 2.1.8 on the operator VPS is approved as the conditional
Content Desk choice and is required before the first public release (M3); broad
configuration remains blocked on the Plan 02 authenticated mobile tracer.

Signal Path — Editorial Cut is the approved homepage art direction. P02A prototype and
visual acceptance, followed by P02B canonicalization and registered distribution, are
pending; no production motion has been implemented.

## Source Notes

This plan combines the prior read-only website plan with the approved Content Desk
revision and the approved incremental-release roadmap. Sources include:
- `AGENTS.md` (stack, architecture, SEO/AI, workflow constraints)
- `docs/Ryan-Brosas-Brand-System/` canonical brand files
- `docs/sitemap.md` (approved route-disposition contract, republished 2026-07-22)
- official Astro documentation via Context7
- npm registry version checks (2026-07-22; re-pin at scaffold time: latest Astro 7.1.3, TS 7.0.2)
- official Pages CMS documentation at `https://pagescms.org/docs/` and its self-host, database, environment-variables, and GitHub App subpages (accessed 2026-07-22)
- Pages CMS 2.1.8 source inspection (`/tmp/pages-cms/db/schema.ts`, `db/index.ts`, `drizzle.config.ts`, `package.json`): 12-table application-state schema, forward-only Drizzle migrations, no official Docker image, no documented health endpoint, no Node engines declaration, local PostgreSQL 16 example
- operator VPS read-only inventory (2026-07-22): Ubuntu 24.04.4 LTS, Docker 29.1.3 + Compose 2.40.3, Caddy 2.11.4 systemd on 80/443, native PostgreSQL 18.4 on loopback 5433, existing containers openviking and omniroute on loopback, `cms.ryanjosebrosas.dev` currently HTTP 525 via Cloudflare
- browser checks of the Pages CMS hosted sign-in at desktop and 390px; the advertised public demo redirects to a video, so authenticated editor behavior remains a planned tracer
- user approval on 2026-07-22 of self-hosted Pages CMS (superseding the earlier hosted-Pages-CMS approval), conditional on the one-collection mobile tracer
- user approval on 2026-07-22 of Signal Path — Editorial Cut: homepage-only editorial choreography over an operational-motion baseline, with a one-time System Conductor signal trace and static/reduced-motion fallbacks
- 60fps.design interaction references plus MDN, web.dev, and WCAG motion/performance guidance reviewed on 2026-07-22; used as mechanism vocabulary, not a layout to copy

See `.opencode/artifacts/MEMORY.md` for any later learnings.
