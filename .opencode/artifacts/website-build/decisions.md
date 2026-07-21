# Website Build Architecture Decisions

## ADR-001: Use Hosted Pages CMS as a Conditional Content Desk

**Status:** superseded by ADR-002 (2026-07-22)
**Date:** 2026-07-22

### Context

Ryan needs to create and maintain blog posts, projects, directory records, LLM
Watcher updates, homepage curation, core-page copy, public links, and approved media
from both desktop and phone. The public website must remain a static Astro site with
Git-backed, reviewable content and fail-closed publication rules.

A page builder would expose route, layout, canonical, SEO, and security controls that
should remain code-owned. A runtime CMS or hosted content database would add an API,
secrets, synchronization, and availability dependencies to a site that does not need
them.

### Decision

Use hosted Pages CMS as a separate Git-backed **Content Desk**:

- Pages CMS writes approved Markdown, JSON, and raster media directly to this GitHub repository through a repository-scoped GitHub App.
- Astro schemas and publishing helpers remain authoritative; `.pages.yml` is a form layer, not a second content model.
- Forms expose all public content but use fixed templates. Routes, canonicals, layouts, schemas, SEO policy, private evidence/approval records, security settings, and deployment code remain unavailable.
- New content defaults to `draft`. A validation action runs the same check, test, build, and generated-output gate used by developer changes before explicit publication.
- Full configuration is conditional on one representative collection passing an authenticated editor test at desktop and 390px widths. The test must cover create, edit, save, rich text, media, explicit visibility, validation, overflow, reachable controls, and data preservation.
- Git editing remains the fallback when Pages CMS is unavailable.

### Consequences

**Benefits**

- The public site stays static and has no CMS runtime or external content API.
- Content remains portable, versioned, diffable, and recoverable in Git.
- A browser form layer can cover both prose and structured records without exposing site architecture.
- Failed validation or deployment can preserve the last good production build.

**Costs and risks**

- `.pages.yml` duplicates parts of the Astro schema and can drift; representative CMS-written fixtures must be validated continuously.
- The GitHub App becomes a trusted write path and must be limited to this repository with no credentials committed.
- Pages CMS's official site claims mobile support and its sign-in screen passed 390px and desktop checks, but the advertised public demo redirects to a video. The authenticated editor is therefore unverified until the tracer passes.
- A richer multi-person approval workflow may eventually exceed the simple draft-field model.

### Alternatives considered

- **Decap CMS:** stronger branch/PR editorial workflow, but its official demo showed horizontal overflow and unreachable editing controls at 390px; rejected for the equal phone/desktop requirement.
- **CloudCannon:** polished Git-backed visual editing and the primary paid fallback, but its ongoing cost and broader platform are disproportionate for the initial solo site.
- **Sanity:** strong structured authoring and the fallback if Git-backed editors fail, but moves canonical content to a hosted database and adds API/webhook integration.
- **Keystatic:** tight Astro integration, but deployed editing adds React/Markdoc, server-side APIs, an adapter, and credentials that conflict with the static/no-framework boundary.
- **Notion or Airtable synchronization:** good native-device editing, but requires custom synchronization, media lifecycle, secrets, preview/rebuild, and failure recovery.

### Revisit when

- The authenticated Pages CMS editor fails the mobile tracer.
- Schema/config drift becomes a recurring maintenance cost.
- Multiple editors require formal review roles, branch approvals, or scheduled publishing.
- Content must be reused by independent applications that justify an API-first content store.

### Sources

- Pages CMS documentation: https://pagescms.org/docs/
- Pages CMS configuration: https://pagescms.org/docs/configuration/
- Pages CMS actions: https://pagescms.org/docs/configuration/actions/
- Pages CMS settings: https://pagescms.org/docs/configuration/settings/
- Pages CMS media: https://pagescms.org/docs/configuration/media/
- Decap CMS editorial workflow: https://decapcms.org/docs/editorial-workflows/
- Keystatic Astro installation: https://keystatic.com/docs/installation-astro
- Sanity Astro integration: https://www.sanity.io/docs/astro

Sources and browser behavior were reviewed on 2026-07-22.

## ADR-002: Self-Host Pages CMS 2.1.8 on the Operator VPS as the Conditional Content Desk

**Status:** accepted, with activation gate
**Date:** 2026-07-22
**Supersedes:** ADR-001

### Context

ADR-001 accepted hosted Pages CMS conditionally. After exploring a Supabase
website-content-backend architecture (agent + Content Desk, dedicated Content API,
typed document revisions, Cloudflare Workers Static Assets auto-deploy), Ryan abandoned
that path as overbuilt: "let's just stick with pagescms we can improve later." When asked
which to retain, Ryan chose **self-hosted Pages CMS** over **hosted Pages CMS**.

The publishing problem is unchanged: equal desktop/phone browser management of all public
content while the Astro site stays static and Git-backed. Source inspection of Pages CMS
2.1.8 (`/tmp/pages-cms/db/schema.ts:15-224`) confirmed PostgreSQL holds only CMS
application state across 12 tables (`user`, `session`, `account`, `verification`,
`github_installation_token`, `collaborator`, `collaborator_invite`, `config`,
`cache_file`, `cache_file_meta`, `cache_permission`, `action_run`); website content stays
in Git. Adding one external table does not provide an editor.

The operator VPS already has sufficient capacity and tooling: Ubuntu 24.04.4 LTS, 10 vCPU,
29 GiB RAM, ~275 GiB free, Docker 29.1.3 + Compose 2.40.3, Caddy 2.11.4 as systemd on
80/443, existing containers `openviking` and `omniroute` on loopback, and a native
PostgreSQL 18.4 cluster on loopback port 5433 of unknown workload. `cms.ryanjosebrosas.dev`
resolves via Cloudflare but returns HTTP 525 (no valid origin TLS/site yet).

### Decision

Self-host Pages CMS 2.1.8 on the operator VPS as a separate Git-backed **Content Desk**:

- Pages CMS runs as a pinned source build (release tag 2.1.8; no official Docker image exists) behind host Caddy at `https://cms.ryanjosebrosas.dev`, binding to loopback only.
- An isolated PostgreSQL 16 container on a private Compose network holds CMS application state only (auth, sessions, encrypted GitHub installation tokens, collaborators, parsed config, cache). No PG host port is published to the VPS. Website content remains Markdown/JSON/media in Git.
- Required runtime secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `CRYPTO_KEY`, `BASE_URL`, `ADMIN_EMAILS`, GitHub App variables) are stored on the VPS, never in the repository.
- Astro schemas and publishing helpers remain authoritative; `.pages.yml` is a form layer, not a second content model. Templates are fixed; routes, canonicals, layouts, schemas, SEO policy, private evidence/approval records, security settings, and deployment code remain unavailable.
- New content defaults to `draft` and passes the same check, test, build, and generated-output gate as developer changes before explicit publication.
- The self-hosted Pages CMS GitHub App requests broad repository permissions (Administration, Actions, Contents read/write). Branch and ruleset protections remain the real authorization boundary; `.pages.yml` constrains the form UI, not the token.
- Backups: daily encrypted `pg_dump` (custom format) off-site to S3-compatible storage, a pre-upgrade backup, retention policy, and periodic restore drills. Migrations are forward-only with no documented rollback command, so a DB backup plus image/snapshot is required before any upgrade.
- Full configuration is conditional on one representative collection passing an authenticated editor test at desktop and 390px widths.
- The self-hosted Pages CMS core workflow (VPS deployment, isolated PostgreSQL, Caddy, GitHub App, backup) is **required before the first public release (M3)**. It does not gate local implementation (M0-M2): the static site can be built and previewed locally before CMS infrastructure is approved. If the authenticated mobile tracer fails, the static site is still built and previewed; the public release is blocked until the CMS gate passes or an approved fallback is recorded.
- Git editing remains the outage fallback.
- An OpenCode operations skill (`.opencode/skill/pages-cms-operations/SKILL.md`) is deferred until manual deploy/backup/restore is proven; it will be ops-only (status, deploy, migrate, backup, restore, upgrade, logs, GitHub App revocation), not content publishing.

### Consequences

**Benefits**

- The public site stays static with no CMS runtime, external content API, or dependency on Pages CMS availability; an outage leaves the existing static site and direct Git editing intact.
- Content remains portable, versioned, diffable, and recoverable in Git.
- Self-hosting reuses existing VPS compute, Docker, and Caddy; avoids a hosted-service dependency and a third-party account; keeps CMS state off third-party infrastructure.
- A browser form layer covers prose and structured records without exposing site architecture.

**Costs and risks**

- Running a dynamic Next.js application plus PostgreSQL on the VPS adds operational load: secrets management, forward-only migrations with no rollback, backups, restores, upgrades, health monitoring, and GitHub App lifecycle/revocation.
- No official Docker image or documented health endpoint; `/api/app/version` is a version probe only. Custom pinned image and source-version verification are required.
- No published PostgreSQL compatibility matrix; isolated PostgreSQL 16 is chosen over the native PG 18.4 cluster to isolate the backup/upgrade boundary, leaving the 18.4 workload untouched.
- `.pages.yml` duplicates parts of the Astro schema and can drift; representative CMS-written fixtures must be validated continuously.
- The self-hosted GitHub App has broad repository permissions; without branch/ruleset protections a compromised service could alter code or settings outside CMS paths.
- The authenticated editor remains unverified until the tracer passes (the public demo redirects to a video).
- The CMS-first-release gate couples the first public launch to CMS infrastructure readiness. Local development is uncoupled, but the credible core cannot ship publicly until VPS, PostgreSQL, Caddy, GitHub App, backup, and the mobile tracer all pass. If any fails late, the launch slips (Git editing remains available as the fallback authoring path).

### Alternatives considered

- **Hosted Pages CMS (ADR-001):** simpler operations (no VPS app, no DB, no secrets on the VPS), but depends on the hosted service and a third-party account, and was superseded by Ryan's preference to self-host.
- **Supabase as website content backend:** explored in detail (dedicated Content API, typed document revisions, agent + Content Desk, Cloudflare Workers Static Assets auto-deploy) and abandoned as overbuilt; a single Supabase table does not provide an editor, and moving canonical content out of Git adds API/webhook/media-lifecycle complexity. Managed Supabase as Pages CMS's DB only outsources DB operations without solving authoring.
- **Decap CMS:** rejected after its official demo failed a 390px editor test (horizontal overflow, unreachable controls).
- **CloudCannon:** paid fallback; Sanity: hosted-database fallback; both retained only if self-hosted Pages CMS fails the mobile tracer or becomes unsustainable.

### Revisit when

- The authenticated Pages CMS editor fails the mobile tracer.
- Schema/config drift becomes a recurring maintenance cost.
- Self-hosting operations (secrets, migrations, backups, upgrades, availability) become unsustainable.
- Multiple editors require formal review roles, branch approvals, or scheduled publishing.
- Content must be reused by independent applications that justify an API-first content store.

### Sources

- Pages CMS documentation: https://pagescms.org/docs/
- Pages CMS self-host guide: https://pagescms.org/docs/guides/installing/self-host/
- Pages CMS database: https://pagescms.org/docs/development/database/
- Pages CMS environment variables: https://pagescms.org/docs/development/environment-variables/
- Pages CMS GitHub App setup: https://pagescms.org/docs/guides/installing/github-app/
- Pages CMS 2.1.8 source inspection: `/tmp/pages-cms/db/schema.ts:15-224`, `db/index.ts:11-22`, `drizzle.config.ts:1-13`, `package.json` (12-table application-state schema, Drizzle forward-only migrations, no official Docker image, no documented health endpoint, no Node engines declaration, local PostgreSQL 16 example)
- Operator VPS read-only inventory (2026-07-22): Ubuntu 24.04.4 LTS, Docker 29.1.3 + Compose 2.40.3, Caddy 2.11.4 systemd on 80/443, native PostgreSQL 18.4 on loopback 5433, existing containers openviking and omniroute on loopback, `cms.ryanjosebrosas.dev` HTTP 525 via Cloudflare

Sources, source inspection, and VPS inventory were reviewed on 2026-07-22.

## ADR-003: Incremental Public Releases (Credible Core First)

**Status:** accepted
**Date:** 2026-07-22
**Related:** ADR-002 (CMS required before the first release)

### Context

The initial roadmap treated the site as a single coordinated launch: Blog, Directory,
LLM Watcher, Resources, and the Content Desk all had to complete before anything went
public. That created a single shippable release on a long critical path where a failed
390px CMS tracer, a missing directory inventory, or unavailable watcher data could
block an otherwise complete Home/About/Projects site — contradicting the rule that CMS
failure must not block the static site.

Ryan confirmed the site should be built incrementally, not one-shot, and approved
incremental public releases with the credible core shipping first.

### Decision

Ship the site in **independent public release increments**:

- The **credible core** (M3) is the first public release: `/`, `/services/`, `/about/`,
  `/contact/`, `/projects/`, one `/projects/[slug]/`, plus `/sitemap.xml`,
  `/robots.txt`, `/404.html`.
- **Blog** (M4), **Directory** (M5), **LLM Watcher** (M6), and **Resources** (M7) each
  promote to public independently once their own content and CMS gates pass. They do
  not block the credible core and are not blocked by each other.
- **Resources** links only to modules with substantive published content; it does not
  ship until at least one resource module is public, preventing empty hubs.
- The **release track** (Plan 10) is a reusable CI/deploy/verify/rollback path, reused
  for each increment — not a single one-shot launch.
- Self-hosted Pages CMS (ADR-002) is required before the first public release (M3) but
  does not gate local M0-M2 work.

### Consequences

**Benefits**

- The credible core can ship as soon as it and the CMS gate are ready, without waiting
  for every module.
- A failure in one module's content/evidence/CMS readiness cannot block an unrelated
  module's release.
- The release track is exercised early and proven before the heaviest increments.

**Costs and risks**

- Each increment needs its own release verification, so the release track runs
  repeatedly rather than once.
- Sitemap, RSS, navigation, and the Resources gateway must grow as modules promote,
  requiring care to never link empty or draft-only modules publicly.
- The credible core launch still waits on the CMS gate (ADR-002), so CMS
  infrastructure readiness remains on the critical path to the first public release.

### Alternatives considered

- **One coordinated launch:** simpler release verification, but a long critical path
  where any single module's failure blocks the whole site. Rejected per Ryan's
  incremental-build preference.
- **Previews then one launch:** build incrementally but keep everything private until
  one coordinated launch. Adds no public value sooner and keeps the one-shot risk.

### Revisit when

- The credible core and CMS gate are ready and a coordinated single launch becomes
  cheaper than repeated increments.
- Module promotion cadence makes the release track a bottleneck.

### Sources

- User approval on 2026-07-22 of incremental public releases with the credible core first.
- `.opencode/roadmap.md` (M0-M8 milestone model).
- `.opencode/artifacts/website-build/plan.md` (dependency graph, release track).

## ADR-004: Adopt Signal Path — Editorial Cut as the Homepage Motion Direction

**Status:** accepted; implementation gates tracked in `.opencode/state.md`
**Date:** 2026-07-22

### Context

The canonical brand package already contains a complete static landing-page proof, but
the website plan treated visual work as token and asset application. It did not define
a website-specific art-direction phase, a motion language, or a visual acceptance gate.
Ryan cited 60fps.design as inspiration and asked for a more explored, expressive site.

Three directions were considered: restrained operational motion, broader editorial
kinetics, and an interaction-heavy workbench. Ryan selected an operational baseline with
one editorial homepage experience, then asked that the first restrained storyboard be
made more expressive.

### Decision

Adopt **Signal Path — Editorial Cut**:

- Expressive choreography is limited to the homepage. Internal routes use only
  functional hover, focus, menu, and state transitions.
- The hero combines oversized cropped headline planes, a structural rule sweep, and one
  finite coral signal trace aligned to the existing System Conductor cable.
- The manifesto uses a color-plane cut; the five-step system uses restrained number/rule
  choreography; selected story/evidence media may use grid-aligned masks.
- CTA/footer return to a quiet composition. Nothing loops, hijacks scroll, gates
  content, or changes document meaning.
- The complete final layout is static HTML/CSS. JavaScript and supported browser APIs
  add motion only; reduced-motion, unsupported, and failure paths render final states
  immediately.
- P02A refines canonical `ryan-brosas-landing-page.html` in place and must pass an
  explicit, durable visual/accessibility/performance checkpoint. P02B then codifies the
  contract, regenerates local mirrors/capture, and verifies the existing published
  `user:brand-design-system` record before Plans 03/04 consume it.
- 60fps.design informs the vocabulary of continuity and state change; its catalog UI,
  density, and spectacle patterns are not copied.

### Consequences

**Benefits**

- The site gains a memorable point of view without turning every route into a motion
  surface or weakening static delivery.
- The signal metaphor reinforces context, coordination, checks, handoffs, and recovery
  using an already approved narrative asset.
- A canonical prototype and acceptance gate reduce the risk of coding an unreviewed
  motion system into Astro.

**Costs and risks**

- The raster cable needs a decorative overlay fitted across breakpoints; misalignment
  is more damaging than omitting the trace.
- Editorial choreography adds browser, performance, reduced-motion, and no-JavaScript
  verification to the homepage release gate.
- The canonical landing page has two generated mirrors, one full-page capture, and one
  registered-package record that P02B must synchronize after acceptance.

### Alternatives considered

- **Operational motion only:** safest and cheapest, but Ryan rejected the first version
  as too restrained.
- **Editorial kinetics across all routes:** more consistently expressive, but increases
  distraction and verification cost on reading-heavy pages.
- **Interactive workbench:** richest interaction, but conflicts most with the static,
  no-JavaScript-complete boundary and makes spectacle more likely than evidence.

### Revisit when

- The canonical prototype fails accessibility or representative mobile performance.
- The System Conductor trace cannot stay aligned without fragile breakpoint-specific
  geometry.
- User testing shows the sequence delays comprehension or distracts from evidence.
- A later internal route demonstrates a real continuity/state requirement that cannot be
  met by the functional motion baseline.

### Sources

- User approval on 2026-07-22 of `Signal Path — Editorial Cut` after selecting
  homepage-only scope, the Conductor trace, and more expressive editorial choreography.
- `docs/Ryan-Brosas-Brand-System/DESIGN.md` (motion, living applied proof, and
  anti-pattern contracts).
- `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html` (canonical applied
  homepage proof).
- 60fps.design interaction catalog; MDN View Transition and reduced-motion guidance;
  web.dev animation performance guidance; WCAG 2.2 animation criteria (reviewed
  2026-07-22).
