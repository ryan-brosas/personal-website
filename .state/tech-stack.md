---
purpose: Tech stack, constraints, and verification commands for repo-local OMP context
updated: 2026-07-24
---

# Tech Stack

Use this file as the durable repo-local summary of the project stack and non-negotiable constraints.

## Framework & Language

- **Framework:** Astro 5.18.2 (static output, `trailingSlash: "always"`)
- **Language:** TypeScript strict (ESM, `erasableSyntaxOnly`, `verbatimModuleSyntax`)
- **Runtime:** Node.js 24.16.0, npm 11.13.0

## Styling & UI

- **CSS:** Plain CSS via `src/styles/global.css` (imports canonical brand token sheet); no preprocessor, no Tailwind
- **Component system:** Semantic Astro components (`src/components/`, `src/layouts/`); no UI framework (React/Vue/Svelte)
- **Design tokens:** Brand tokens imported by `global.css`; approved assets under `src/assets/brand/`

## Data & State

- **Database:** None (static site). Editing layer (self-hosted Pages CMS 2.1.8) is planned, not a runtime dependency.
- **ORM / query layer:** None. Astro Content Collections + Zod schemas in `src/content.config.ts` + `src/lib/content-schemas.ts`
- **State management:** None (no client framework). One inline progressive-enhancement nav script in `SiteHeader.astro`.
- **API style:** N/A — static HTML/XML/text output only

## Testing

- **Unit tests:** Node built-in test runner (`node --test`); 122 tests, 27 suites
- **Integration / E2E:** `tests/shell.test.mjs` builds the real project into an isolated dist and asserts the rendered shell contract; `tests/policy.test.mjs` covers pure-module contracts + markdown safety
- **Coverage target:** Not configured

## Key Constraints

- **Static output only.** No SSR, no runtime CMS queries, no MDX. Add SSR only for a demonstrated live-data requirement.
- **No UI framework.** Semantic HTML + plain CSS. Content navigation and core discovery must work without JavaScript.
- **Fail-closed visibility** enum `draft | public | noindex` drives routes, sitemap, RSS, curation, related content, and AI outputs. Drafts never leak into discovery.
- **Markdown safety guard** (`src/lib/markdown-safety.ts`) runs in Astro's rehype pipeline and fails the build on raw HTML, `on*` event handlers, and `javascript:`/`data:` protocols. Do NOT set `allowDangerousHtml: false` — it silently strips instead of failing.
- **Canonical URLs** derived centrally from route + final origin; trailing slashes on HTML routes, none on file endpoints. Production origin is injected at release (placeholder `https://example.com` until then).
- **Evidence is claim-level** (`Verified | Proposed | Open`), separate from publication/lifecycle/UI state.
- **Toolchain pins:** Astro 5.18.2 / TypeScript 6.0.3 / `@astrojs/check` 0.9.9. Astro 7 / TS 7 declined because `@astrojs/check` 0.9.9 peers `typescript: ^5.0.0 || ^6.0.0`. Revalidate at scaffold time.

## Active Integrations

- **Self-hosted Pages CMS 2.1.8** (planned editing layer on operator VPS, behind Caddy at `cms.ryanjosebrosas.dev`; isolated PostgreSQL 16 container for CMS state only; website content stays in Git). Required before first public release (M3), not before local work.
- **@astrojs/rss 4.0.19** (planned with Blog increment; not yet installed)

## Verification Commands

Validated 2026-07-24 against the live repository:

```bash
# Type checking
npm run check     # astro check — 0 errors, 0 warnings, 4 hints (brand-workbook deprecations)

# Linting
# not configured — no lint script exists

# Testing
npm test          # node --test — 122 pass, 0 fail

# Building
npm run build     # astro build — 5 pages + sitemap.xml + robots.txt

# Generated-output contract verification
npm run verify    # scripts/verify-build.mjs — verify: ok

# Dev server
npm run dev       # astro dev — loopback HTTP 200 on /, /about/, /sitemap.xml
```

## Notes

- Update this file whenever the stack, constraints, or verification commands change.
- Keep durable project facts here or in `.state/`, not in session-only notes.
- Source: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/content.config.ts`, `src/lib/*`, `.opencode/tech-stack.md`, `.pi/tech-stack.md`.
