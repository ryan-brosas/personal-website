# Plan for the Personal Website SEO, Entity, and AI-Search Refactor

## An executable architecture plan for `ryan-brosas/personal-website`

**Status:** Proposed  
**Version:** 1.0  
**Research date:** 2026-07-24 (Asia/Manila)  
**Repository baseline:** `main` at `ad151469db0bab9c5a8c8140680ab5b78d6cbb0c`  
**Implementation scope:** planning only; no production code or public URL changes  

---

## Decision summary

The repository does not need a framework rewrite. Preserve Astro static output, strict TypeScript, semantic HTML, progressive enhancement, the fail-closed `draft | public | noindex` policy, evidence validation, deterministic sitemap generation, and generated-output verification.

The refactor should replace a premature module-first architecture—Projects, Blog, Directories, Tools, LLM Watcher, Resources—with a demand-and-proof-led authority system:

```text
Entity → Services → Case Studies → Insights → Research → Discovery and Measurement
```

Recommended market-facing position:

> **Ryan Brosas builds AI workflow systems for founder-led teams.**

Keep **Agent Systems Builder** as the distinctive secondary descriptor. Begin with content, research, and knowledge workflows because this is the most credible bridge from Ryan's existing copywriting/content-strategy proof into agent and automation work.

Recommended core sitemap:

```text
/
/services/
/case-studies/
/case-studies/[slug]/
/insights/                    conditional after its content gate
/insights/[slug]/
/research/                    conditional after its maintenance gate
/about/
/contact/
/privacy/                     conditional

/sitemap.xml
/robots.txt
/rss.xml                      with Insights
/llms.txt                     experiment only
/404.html
```

Central architecture decision: create one typed route registry that drives paths, canonicals, navigation, breadcrumbs, sitemap output, redirects, feeds, crawler/AI inventories, and build-verifier expectations.

AI-search decision: conventional SEO remains the foundation. Make pages easy to retrieve, quote, verify, attribute, and update. Separate search-crawler access from model-training consent. Treat `llms.txt` as a measured post-launch experiment, not a requirement or ranking mechanism.

CMS decision: Git/Markdown remains the canonical publishing path. A CMS may be added after demonstrated editorial friction; it must not block the first credible public release.

---

## Plan chapters

1. [Strategy, audit, goals, and invariants](./seo-geo-refactor/00-strategy-and-audit.md)
2. [Positioning, information architecture, journeys, and page blueprints](./seo-geo-refactor/01-positioning-information-architecture.md)
3. [Content models, technical architecture, structured data, discovery, and AI search](./seo-geo-refactor/02-content-technical-ai-architecture.md)
4. [Editorial authority, measurement, testing, and quality gates](./seo-geo-refactor/03-authority-measurement-quality.md)
5. [Implementation roadmap, migration, risks, decisions, and appendices](./seo-geo-refactor/04-roadmap-migration-appendices.md)

---

## Recommended execution order

```text
0. Freeze and baseline
1. Resolve positioning, entity, final origin, and public evidence
2. Introduce typed route/content/SEO architecture
3. Rebuild metadata, entity graph, breadcrumbs, and discovery outputs
4. Publish Home, Services, Case Studies, About, and Contact
5. Launch Insights only after its minimum content gate
6. Launch Research only after independent value and maintenance gates
7. Configure crawler policy, Search Console, Bing, IndexNow, and measurement
8. Migrate, validate, release, observe, and iterate
```

## Central invariant

> Every public URL must have one primary job, one clear audience, one canonical identity, enough unique value to deserve indexing, and a measurable path to proof, further learning, or contact.
