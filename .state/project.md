---
purpose: Project vision, goals, and success criteria (loaded into all AI contexts)
updated: 2026-07-24
---

# Project Vision

## The Goal

A static, evidence-led personal website positioning Ryan Brosas as an **Agent Systems Builder**, with credible proof, flexible publishing through a self-hosted Pages CMS, conventional SEO, and AI-search accessibility — delivered as built HTML/CSS/XML/text with no runtime CMS or UI framework.

## Success Criteria

1. **Credibility** — every published claim, artifact, date, and freshness statement has approved evidence (Verified / Proposed / Open labels, separate from publication state).
2. **Fail-closed publication** — drafts and `noindex` content never leak into discovery, curation, RSS, or related content.
3. **No-JavaScript accessibility** — content, navigation, and core discovery work without JavaScript; keyboard, reflow, 200% zoom, and reduced-motion pass.
4. **Conventional SEO + AI-search accessibility** — canonical URLs, sitemap, robots, and structured output generated from one visibility policy.
5. **Publishing from desktop or phone** — Ryan can manage all public content without touching routes or layouts (Pages CMS is the conditional implementation; Git editing remains the fallback).
6. **Generated-output verification** — `npm run verify` proves the build contract on every release.

## Target Users

- **Primary: Overworked founders** — reach Ryan through credible work and a clear booking path (recurring workflow assessment).
- **Secondary: Technical readers** — evaluate agent/workflow tooling via projects, writing, directories, and the LLM Watcher.

## Core Principles

1. **Static delivery** — the public site is built HTML/CSS; no SSR, no runtime CMS, no client framework. Add SSR only for a demonstrated live-data requirement.
2. **One visibility policy** — `draft | public | noindex` drives every discovery surface (routes, sitemap, robots, RSS, curation, AI outputs).
3. **Evidence-led** — claims are labeled (`Verified | Proposed | Open`); no fabricated proof. Pages CMS may edit only approved content, not routes/layouts/schemas.

## Current Phase

- **Status:** Implementation
- **Milestone:** M2 — Accessible Core Shell (all six children complete; aggregate close pending screen-reader smoke)
- **Next Milestone:** M3 — Credible Core Release (first public release)

## Architecture Summary

Policy kernel pattern — small, composable modules with single responsibilities:

```
src/lib/publishing.ts        visibility enum, evidence schemas, relationship resolution
src/lib/content-schemas.ts   composes publishing primitives into PageSchema + SettingsDataSchema
src/content.config.ts        wires schemas to Astro Content Collections (pages, projects, blog, directories, settings)
src/config/site.ts           code-owned page IDs ↔ route paths + nav order
src/lib/site-routes.ts       resolveRoutes(): page visibilities → routable paths (excludes drafts)
src/lib/routes.ts            ROOT_ROUTE_POLICY, canonicalHref, isHtmlRoute/isFileEndpoint
src/lib/discovery.ts         renderSitemap (discoverable only) + renderRobots (visibility-independent)
src/lib/markdown-safety.ts   build-time rehype guard: raw HTML / on* / unsafe protocols → fail
src/pages/[page].astro       dynamic content renderer; asserts markdown rendered before routing
src/pages/index.astro        code-owned homepage shell (noindex until root policy flips)
src/pages/404.astro          recoverable 404, slashless canonical
src/pages/sitemap.xml.ts     thin endpoint → renderSitemap
src/pages/robots.txt.ts      thin endpoint → renderRobots
src/layouts/BaseLayout.astro shared document shell (head, skip link, header, main, footer)
src/components/SeoHead.astro canonical, description, robots, Open Graph
src/components/SiteHeader.astro build-time nav from settings + resolveRoutes; one inline enhancement script
src/components/SiteFooter.astro copyright + footer nav
```

Build-time vs runtime boundary: all data loading, route generation, schema validation, and discovery output happen at build. What ships: static HTML + CSS + one inline progressive-enhancement nav script. No client framework, no generated `_astro/*.js` bundle.

## Key Links

- **Repository:** `/home/ryan/repo/personal-website`
- **Route contract:** `docs/sitemap.md`
- **Binding policy:** `AGENTS.md`
- **Legacy planning root:** `.opencode/artifacts/website-build/plan.md`
- **Staging:** (not yet configured)
- **Production:** (not yet deployed; placeholder origin `https://example.com`)

---

_Update this file when project direction or phase changes._
_AI uses this to maintain context across sessions and make decisions aligned with project goals._
