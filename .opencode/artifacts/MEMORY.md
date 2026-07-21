# Project Memory

Durable project knowledge. Search with `rg -n "topic" .opencode/artifacts/MEMORY.md`, read with `read`, append with `edit`.

Updated: 2026-07-22

---

## Architecture

### Layers

```text
1. Instructions           AGENTS.md, skills
2. Commands               command/ — slash commands
3. Workflows              workflows/ — multi-agent orchestration
4. Plugins                plugin/ — runtime TypeScript plugins
5. Tools                  tool/ — agent-available tools
6. SDK                    plugin/sdk/ — shared types, interfaces
```

### Dependency Rules

| Layer | Can Import From |
|---|---|
| Instructions | Nothing (markdown, self-contained) |
| Commands | Instructions, Skills |
| Workflows | Commands, Instructions, Skills |
| Plugins | SDK only. Never from other plugins. |
| Tools | SDK, Plugins (via defined tool interfaces) |
| SDK | Nothing external. Must be self-contained types. |

### Principles

- **Plugin isolation** — plugins are independent modules; communicate via SDK interfaces, never by importing each other
- **No circular dependencies** — extract shared concerns to SDK
- **Minimal surface area** — keep SDK interfaces small and stable
- **File boundaries** — plugins ≤300 lines, SDK ≤150 lines, commands ≤500 lines, workflows ≤150 lines

---

## Decisions

### [2026-07-08] Memory System: File-Based Project Context

- **Context:** Replaced automated memory pipeline (observation tool, memory-search, memory.db) with file-based context
- **Decision:** Single `.opencode/artifacts/MEMORY.md` file for all durable project knowledge
- **Rationale:** Simpler than 4 separate files. No database, no auto-injection, no black-box pipeline. Grep-friendly, version-controlled.
- **Consequences:** Agents search with `rg -n`, read with `read`, append with `edit`. No automated capture.

### [2026-07-22] Project Initialized — Greenfield Astro Static Site

- **Context:** `/init` (full, all modes) on the greenfield personal-website repo. No `package.json`, source, CI, or deps existed; stack was planned in `AGENTS.md` and `.opencode/artifacts/website-build/plan.md`.
- **Decision:** Approved the `.pi -> .opencode` migration as the planning root. Updated stale `.pi` references in `AGENTS.md` to `.opencode/` equivalents (pointing at `.opencode/artifacts/website-build/plan.md` and `.opencode/tech-stack.md`). Wrote `.opencode/tech-stack.md` documenting the planned (not-yet-installed) stack. Completed Mode 2 (`.opencode/roadmap.md`, `.opencode/state.md`) and Mode 3 (`.opencode/user.md`) from established planning context. Published `docs/sitemap.md` route-disposition contract.
- **Rationale:** Resolves Plan 00 blocker #1 (migration decision) and #2 partial (stale AGENTS.md references). Keeps AGENTS.md accurate for future agents without scaffolding application code.
- **Consequences:** Stack remains uninstalled until Plan 01 scaffold approval. Local implementation is gated only by the build gate (baseline + scaffold auth + route/visibility policy + re-pinned toolchain); domain/scheduler/CMS/content decisions gate only their downstream milestones. Plan pins Astro 5.18.2 / TS 6.0.3 but current registry latest is Astro 7.1.3 / TS 7.0.2 — revalidate and re-pin at scaffold time.

### [2026-07-22] Self-Hosted Pages CMS — Conditional Content Desk

- **Context:** Ryan wants equal desktop/phone browser management for blog posts, projects, directories, LLM Watcher, homepage curation, core-page copy, public settings, and approved media while keeping the public Astro site static. Considered a Supabase website-content-backend architecture, then abandoned it as overbuilt; retained Pages CMS and chose self-hosted over hosted.
- **Decision:** Self-host Pages CMS 2.1.8 on the operator's existing VPS behind host Caddy at `cms.ryanjosebrosas.dev`. It may edit approved public Markdown, JSON, and raster media through fixed forms; routes, layouts, schemas, canonicals, SEO policy, private approvals/evidence, security, and deployment remain code-controlled. An isolated PostgreSQL container holds CMS application state only (auth, sessions, encrypted GitHub tokens, collaborators, cache); website content stays in Git. New content defaults to draft and passes the same validation/build gate as developer changes.
- **Rationale:** Pages CMS preserves Git and Astro as the source of truth and avoids a runtime CMS/database on the public site. Self-hosting avoids the hosted-service dependency while reusing the existing VPS, Docker, and Caddy. Decap failed an observed 390px editor test; Keystatic conflicts with the static/no-framework boundary; CloudCannon is the paid fallback and Sanity the hosted-database fallback; Supabase as a website content backend was explored and abandoned.
- **Consequences:** Full rollout is conditional on a one-collection authenticated desktop/390px tracer. Use a repository-scoped GitHub App (broad permissions: Administration, Actions, Contents r/w) with branch/ruleset protections as the real boundary; `.pages.yml` constrains the form UI, not the token. Validate representative CMS-written fixtures to prevent `.pages.yml`/Astro schema drift; keep Git editing as the outage fallback; back up PostgreSQL off-site via `pg_dump` daily. The OpenCode operations skill is deferred until manual deploy/backup/restore is proven. The CMS core workflow is required before the first public release (M3) but does not gate local M0-M2 work. See `.opencode/artifacts/website-build/decisions.md` ADR-002 (supersedes ADR-001).

### [2026-07-22] Incremental Public Releases — Credible Core First

- **Context:** The initial roadmap treated the site as one coordinated launch, putting Blog, Directory, LLM Watcher, Resources, and the Content Desk on a single critical path where any module's failure could block an otherwise complete core site. Ryan said the site should be built incrementally, not one-shot, and approved incremental public releases.
- **Decision:** Ship in independent public release increments. The credible core (M3: `/`, `/services/`, `/about/`, `/contact/`, `/projects/`, one `/projects/[slug]/`) ships first. Blog (M4), Directory (M5), LLM Watcher (M6), and Resources (M7) promote independently once their content and CMS gates pass. Resources links only to modules with substantive published content (no empty hubs). The release track (Plan 10) is a reusable CI/deploy/verify/rollback path. Pages CMS is required before M3 but does not gate local M0-M2 work.
- **Rationale:** Uncouples module readiness from the core launch; exercises the release track early; keeps a failed CMS tracer or missing module from blocking the whole site.
- **Consequences:** Each increment needs its own release verification; sitemap/RSS/navigation/Resources grow as modules promote, requiring care to never link empty or draft-only modules. The credible core launch still waits on the CMS gate. See `.opencode/artifacts/website-build/decisions.md` ADR-003 and `.opencode/roadmap.md` (M0-M8).

### [2026-07-22] Signal Path — Editorial Cut Homepage Direction

- **Context:** The brand system and canonical landing page established a strong static art direction, but the website plan had no website-specific motion exploration or visual acceptance gate. Ryan cited 60fps.design, chose an operational-motion baseline plus one editorial homepage experience, limited expression to the homepage, selected a one-time System Conductor coral-signal trace, and asked that the first storyboard be more expressive.
- **Decision:** Adopt **Signal Path — Editorial Cut**. The homepage may use oversized cropped headline planes, a structural rule sweep, one finite Conductor cable trace, a manifesto color-plane cut, restrained system-step choreography, and selected grid-aligned media masks. Internal routes use only functional 150–220ms interaction motion. No parallax, scroll hijacking, marquee, cursor effects, particles, splash screens, decorative loops, bounce/elastic easing, or animation-gated content.
- **Rationale:** It gives the site a memorable, evidence-compatible point of view without turning the static Astro site into an interaction-heavy app or copying 60fps.design's catalog UI.
- **Consequences:** P02A refines `docs/Ryan-Brosas-Brand-System/ryan-brosas-landing-page.html` in place, repairs its no-JavaScript mobile-navigation baseline, and records explicit responsive/no-JavaScript/reduced-motion/accessibility/performance and visual acceptance with the exact hash. P02B then updates `DESIGN.md`, generated mirrors, the applied capture, and verifies the existing published `user:brand-design-system` record before Plan 03 Task 1 or Plan 04 consumes it. Final readable HTML/CSS is always the fallback; no production motion exists yet. See `.opencode/artifacts/homepage-art-direction/{spec,plan}.md`, `.opencode/artifacts/homepage-art-direction-canonicalization/{spec,plan}.md`, and website-build ADR-004.

### [2026-07-22] Plan 01 Toolchain Pinned — Astro 5 / TS 6 (Astro 7 / TS 7 Declined)

- **Context:** M0 build-gate item t3 requires the toolchain matrix to be confirmed with registry evidence before Plan 01 scaffolds. Plan 01 runs `astro check` as a typecheck gate, so the Astro/TypeScript/`@astrojs/check` versions must be internally compatible.
- **Decision:** Pin Plan 01 to Astro 5.18.2 + TypeScript 6.0.3 + `@astrojs/check` 0.9.9. `@astrojs/rss` 4.0.19 is confirmed now but installed and pinned by Plan 05. Astro 7.1.3 / TypeScript 7.0.2 are declined because `@astrojs/check` 0.9.9 peerDependencies (`typescript: ^5.0.0 || ^6.0.0`) do not support TypeScript 7; upgrading would break `astro check`. Confirmed against the live npm registry 2026-07-22.
- **Rationale:** Avoids a broken `astro check` gate on day one. Latest-in-major pins stay current without crossing the unsupported TS 7 boundary.
- **Consequences:** Plan 01 pins Astro, TypeScript, and `@astrojs/check` in `package.json` and `package-lock.json` (use `npm ci`); `@astrojs/rss` 4.0.19 is confirmed now but installed and pinned by Plan 05. Revisit when `@astrojs/check` publishes TS 7 support; that is a separate upgrade decision, not automatic. Recorded in `.opencode/tech-stack.md` (Toolchain Decision section) and `.opencode/artifacts/website-build/plan.md` (Plan 01 Task 1).

---

## Patterns

### File-Based Context Reads

Before starting work: `rg -n "topic" .opencode/artifacts/MEMORY.md` to find relevant decisions, patterns, gotchas.

### Minimal Delegation

Prefer direct tools over `task()` delegation for surgical fixes. Delegate only for isolation, parallelism, or specialist focus.

### Close the Loop

Every non-trivial phase ends with a 1-3 line summary. If you can't summarize it, you don't understand it.

---

## Gotchas

- Pages CMS's advertised public demo (`https://demo.pagescms.org`) redirects to a YouTube video rather than an interactive editor. The hosted sign-in is responsive, but do not claim authenticated mobile parity until the Plan 02 tracer passes.
- Pages CMS 2.1.8 has no official Docker image/Dockerfile, no documented health endpoint (`/api/app/version` is a version probe only), no Node `engines` declaration, and no published PostgreSQL compatibility matrix (docs example uses PostgreSQL 16). Self-host is source-based: pin tag 2.1.8, build, run `npm run db:migrate`, `npm run build`, `npm run start` behind Caddy. Verified from `/tmp/pages-cms/` source on 2026-07-22.
- Pages CMS migrations are forward-only with no documented rollback command. A verified DB backup plus image/snapshot is required before any upgrade; image rollback alone is insufficient after a schema change.
- Pages CMS PostgreSQL holds CMS application state only (12 tables: auth, sessions, encrypted GitHub tokens, collaborators, config, cache, action runs). Website content stays in Git. Adding an external DB table does not provide an editor. Verified from `/tmp/pages-cms/db/schema.ts:15-224`.
- The self-hosted Pages CMS GitHub App requests broad repository permissions (Administration, Actions, Contents read/write). `.pages.yml` constrains the form UI, not the token. Branch and ruleset protections are the real authorization boundary.
- The operator VPS already runs a native PostgreSQL 18.4 cluster on loopback port 5433 of unknown workload. Use an isolated PostgreSQL 16 container for Pages CMS, not the native cluster, to isolate backup/upgrade boundaries. `cms.ryanjosebrosas.dev` currently returns HTTP 525 via Cloudflare (no valid origin TLS/site yet).
