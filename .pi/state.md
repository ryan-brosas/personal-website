# State

## Current Status

**Planning complete enough for operator decisions; implementation not authorized.**

The repository contains initialization and planning documents only. There is no Git work
tree, application source, package manifest, dependency installation, CI, deployment,
or validated project command.

## Active Decisions

- Astro static output, strict TypeScript, semantic HTML, and plain CSS.
- Stable trailing-slash HTML URLs and shared hub/entry/taxonomy patterns.
- Case studies are promoted projects at `/projects/[slug]/`, not a separate section.
- One visibility/canonical policy feeds routes and every discovery output.
- Curated directories are the initial Resources format; guides remain blog formats.
- Tools remain static-first; SSR requires a demonstrated live-data requirement.
- Conventional SEO is primary; `llms.txt` is optional and experimental.
- Search/retrieval crawler decisions remain separate from training-crawler decisions.

## Operator Decisions Needed

1. Priority audience and single primary CTA.
2. Production domain, preferred hostname, and static host.
3. First two projects and the first evidence-backed case study.
4. Public/private rules for names, metrics, images, logos, and testimonials.
5. Provider-by-provider training-crawler policy.
6. Whether “Resources” should label the `/directories/` route.
7. LLM Watcher's purpose, data source, update frequency, and live/static requirement.
8. Whether privacy-preserving analytics is required at launch.

## Next Priority

Complete **Horizon 0: launch contract and evidence inventory** from `.pi/roadmap.md`.
Produce the launch brief, route manifest, claim/evidence ledger, policy register, and
module definitions. Gate G0 and explicit operator authorization precede scaffolding.

## Implementation Gate

Do not create Astro files, install dependencies, select hosting, or write factual brand
claims until the operator explicitly authorizes scaffolding and the relevant decisions above
are resolved. When authorized after Gate G0, create a small executable Horizon 1 policy-kernel plan before implementation.

## References

- Master plan: `.pi/artifacts/website-concrete-plan/plan.md`
- Milestones: `.pi/roadmap.md`
- URL architecture: `docs/sitemap.md`
- Planned technologies: `.pi/tech-stack.md`
