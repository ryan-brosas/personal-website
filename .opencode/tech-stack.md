# Tech Stack

Auto-detected by `/init` on 2026-07-22. Stack is **installed** (M1 complete, commit `9fd70ce`): Astro 5.18.2, TypeScript 6.0.3, `@astrojs/check` 0.9.9 pinned in `package.json`.

Updated: 2026-07-22

---

## Runtime (available locally)

| Tool | Version |
|---|---|
| Node | 24.16.0 |
| npm | 11.13.0 |
| Fallow | 3.7.1 (via npx cache) |

## Dependencies (installed M1)

Pinned in `package.json` + `package-lock.json`. Use `npm ci` for reproducible installs.

| Package | Version | Purpose |
|---|---|---|
| astro | 5.18.2 | Static site framework |
| typescript | 6.0.3 | Strict TypeScript |
| @astrojs/check | 0.9.9 | `astro check` type diagnostics (supports TS 5 or 6) |
| @astrojs/rss | 4.0.19 | RSS feed (add with blog slice, Plan 05) |

## Toolchain Decision (2026-07-22)

Staying on Astro 5.18.2 + TypeScript 6.0.3 + `@astrojs/check` 0.9.9. Astro 7.1.3 /
TypeScript 7.0.2 are declined because `@astrojs/check` 0.9.9 peerDependencies declare
`typescript: '^5.0.0 || ^6.0.0'` and do not support TypeScript 7; upgrading to TS 7 would
break `astro check`. Confirmed against the live registry 2026-07-22:

- `astro@5` latest = 5.18.2; dist-tag `latest` = 7.1.3 (declined)
- `typescript@6` latest = 6.0.3; dist-tag `latest` = 7.0.2 (declined)
- `@astrojs/check` latest = 0.9.9 (peers `typescript: ^5.0.0 || ^6.0.0`)
- `@astrojs/rss` latest = 4.0.19

Revalidate these pins at Plan 01 scaffold time; if `@astrojs/check` releases TS 7
support, revisit the Astro 7 / TS 7 upgrade as a separate decision.

## Self-Hosted Pages CMS (Editing Service)

Pages CMS 2.1.8 runs on the operator's existing VPS, not as a hosted service. It is an
authoring layer only, not an application dependency or runtime data source for the public
site. Git and the Astro schemas remain authoritative.

| Component | Role | Status |
|---|---|---|
| Pages CMS 2.1.8 (source build) | Browser Content Desk over the Git repo via a repository-scoped GitHub App and root `.pages.yml`; edits approved Markdown, JSON, and raster media | Approved conditionally; a real one-collection desktop/390px mobile tracer must pass before broad rollout |
| Isolated PostgreSQL container | Holds Pages CMS application state only (auth, sessions, encrypted GitHub installation tokens, collaborators, parsed config, cache). Website content stays in Git. | Planned; pinned to PostgreSQL 16 (the version in official docs examples). Not the existing native PG 18.4 cluster on the VPS (no compatibility matrix published) |
| Host Caddy (systemd) | HTTPS reverse proxy at `cms.ryanjosebrosas.dev`; Pages CMS binds to loopback only, Caddy owns ports 80/443 | Planned; existing Caddy 2.11.4 stays the single TLS terminator |
| S3-compatible off-site backup | Daily encrypted `pg_dump` (custom format), pre-upgrade backup, retention, and periodic restore drills | Planned; provider/bucket/credentials to be chosen in Plan 00 |

Deployment notes:

- No official Pages CMS Docker image exists. Self-host is source-based: pin to release
  tag 2.1.8, build a pinned image, and run `npm install`, `npm run db:migrate`,
  `npm run build`, `npm run start` behind Caddy.
- Pages CMS migrations are forward-only with no documented rollback command. A DB
  backup plus image/snapshot is required before any upgrade; image rollback alone is
  insufficient after a schema change.
- No documented health endpoint exists. `/api/app/version` is a version probe only, not
  a health contract.
- Required runtime secrets include `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CRYPTO_KEY`,
  `BASE_URL` (`https://cms.ryanjosebrosas.dev`), `ADMIN_EMAILS`, and GitHub App
  variables. Secrets are stored on the VPS, never in the repository.
- The self-hosted Pages CMS GitHub App requests broad repository permissions
  (Administration, Actions, Contents read/write). Branch and ruleset protections remain
  the real authorization boundary; `.pages.yml` constrains the form UI, not the token.
- The public Astro site has no dependency on Pages CMS availability; an outage leaves the
  existing static site and direct Git editing intact.
- An OpenCode operations skill (`.opencode/skill/pages-cms-operations/SKILL.md`) is
  deferred until manual deploy/backup/restore is proven working. It will be ops-only
  (status, deploy, migrate, backup, restore, upgrade, logs, GitHub App revocation), not
  content publishing.

## Explicitly Excluded (initial build)

- `@astrojs/sitemap` — replaced by a custom metadata-aware `src/pages/sitemap.xml.ts` generated from the public-route inventory (one visibility policy drives all discovery outputs).
- UI framework (React/Vue/Svelte), MDX, SSR adapter, runtime CMS, hosted content database, analytics, form backend, client-state package, generated OG images, theme switcher.
- `llms.txt` — optional/experimental, deferred until a named usage hypothesis (Plan 11).

## Architectural Boundaries

- Static output only; add SSR only for a demonstrated live-data requirement.
- Semantic HTML + plain CSS; no UI framework. Content navigation and core discovery must work without JavaScript.
- Markdown-first Astro Content Collections defined in `src/content.config.ts`.
- Fixed templates, routes, schemas, SEO policy, private approval records, and deployment code remain code-controlled. Pages CMS may edit only approved public content, curation, links, visibility, and safe raster media.
- CMS-written files use the same fail-closed schemas and `check`, test, build, and verify gate as developer-written files. Git editing remains the outage fallback.
- One fail-closed visibility policy (`draft | public | noindex`) drives routes, sitemap, RSS, curation, related content, and AI outputs.
- Canonical URLs derived centrally from route + final origin; trailing slashes on HTML routes, none on file endpoints.
- Evidence is claim-level (`Verified | Proposed | Open`), separate from publication, lifecycle, and UI state.
- Import only approved brand tokens/assets; never publish the complete brand package.

## Commands (available)

Installed at M1 scaffold:

```bash
npm run dev       # local dev server
npm run check     # astro check (types)
npm run test      # node test runner
npm run build     # static build -> dist/
npm run preview   # preview built output
npm run verify    # generated-output contract verification (scripts/verify-build.mjs)
```

## Source

- `AGENTS.md` — stack summary and architecture rules
- `.opencode/artifacts/website-build/plan.md` — master plan, pinned versions, dependency graph
- npm registry version checks (2026-07-22)
- Pages CMS official documentation: `https://pagescms.org/docs/` and linked configuration pages (accessed 2026-07-22)
