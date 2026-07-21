# Tech Stack

> Planned greenfield architecture. No packages, source tree, Git history, CI, deployment,
> or runnable commands exist yet.

## Selected Targets

| Area | Choice | Status |
| --- | --- | --- |
| Framework | Astro 5.x, `output: static` | Planned, not installed |
| Language | TypeScript 5.x, strict mode | Planned |
| Markup/style | Semantic HTML + plain CSS | No UI framework |
| Content | Astro build-time Content Collections | Markdown-first |
| Content config | `src/content.config.ts` | Official Astro path |
| Sitemap | `@astrojs/sitemap` 3.x | Planned |
| Feed | `@astrojs/rss` 4.x | Planned |
| Package manager | npm | Selected, not initialized |
| Deployment | Static hosting | Provider/domain undecided |
| Client JS | None on ordinary content pages | Progressive enhancement only |

Exact versions must be resolved and pinned when scaffolding is explicitly authorized.
The earlier Astro 5.18.2 resolution was research evidence, not an installed dependency.

## Planned Application Boundaries

| Planned artifact | Responsibility |
| --- | --- |
| `src/config/site.ts` | Production origin, identity, navigation, verified profiles, CTAs |
| `src/content.config.ts` | Shared and collection-specific schemas |
| `src/lib/content/visibility.ts` | Draft/public/indexable/export policy |
| `src/lib/content/relationships.ts` | Explicit and deterministic related content |
| `src/lib/content/freshness.ts` | Editorial updates and resource review states |
| `src/lib/urls.ts` | Canonical/trailing-slash normalization |
| `src/lib/seo.ts` + `Seo.astro` | Metadata and visible-content-derived JSON-LD |
| `src/layouts/BaseLayout.astro` | Semantic shell, navigation, feed/sitemap discovery |

## Planned Content Model

- `pages`: About, Now, Contact
- `blog`: `article | guide | resource | note`; dates, drafts, series, controlled tags
- `projects`: `card | project | case-study`; stable project URL, role, outcomes, evidence
- `directories`: audience, category, methodology, inclusion rules, review cadence
- `directoryEntries`: parent, URL, best-for, rationale, limitations, disclosure, review state
- `tools`: `planned | beta | live | retired`; static-first, with LLM Watcher as first candidate
- `tags`: controlled cross-content taxonomy with authored descriptions

Shared fields: `title`, `description`, `canonical?`, `draft`, `noindex`,
`ogImage?`, `published?`, `updated?`, `featured`, `tags[]`, and `related[]`.

## URL and Discovery Policy

- Absolute self-canonical URLs with trailing slashes for HTML routes
- Drafts create no public routes; `noindex` routes are excluded from sitemap, RSS,
  tags, related results, and AI indexes through one visibility policy
- Explicit sitemap filtering; generated `sitemap-index.xml` and numbered sitemap files
- RSS from public blog entries only
- Generated robots policy with final sitemap origin
- Optional curated `llms.txt`; no ranking or citation claim
- Defer `llms-full.txt`, Markdown twins, generated OG images, and search until justified

## Structured Data Targets

Use only when accurate and visible: `Person`, `WebSite`, `WebPage`, `Article`,
`CreativeWork`, `SoftwareApplication`, `ItemList`, and `BreadcrumbList`.
Schema validity and search-feature eligibility are separate; neither guarantees presentation.

## Verified External Constraints

- Google documents no extra AI file/schema requirement for AI Overviews or AI Mode.
- OpenAI separates OAI-SearchBot (search), GPTBot (training), and ChatGPT-User (user fetch).
- Anthropic separates Claude-SearchBot, Claude-User, and ClaudeBot.
- Astro sitemap includes generated pages by default; exclusion requires configuration.
- Astro warns that trailing-slash behavior for prerendered pages depends on the host.
- `llms.txt` is a community proposal, not a proven discovery standard.

Source URLs and access date are recorded in the concrete plan.

## Validation Status

Unavailable until scaffold approval: dependency installation, TypeScript checks, build,
preview, generated-output inspection, accessibility tests, redirects, and production headers.
See `.pi/state.md` for decisions that block implementation.
